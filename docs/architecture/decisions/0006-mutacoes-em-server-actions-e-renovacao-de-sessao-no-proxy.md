# [ADR-0006]: Mutações em Server Actions e Renovação de Sessão no Proxy

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-02
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

A sessão usa cookies httpOnly com um access token JWT de 15 minutos e um refresh token rotativo (ADR-0023 do backend). Hoje a renovação acontece só nos route handlers do BFF (`withSession` em `src/lib/api/bff.ts`), que gravam os cookies novos na resposta.

O modelo server-first ([ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md), [ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)) traz dois problemas:

- **Server Components não podem gravar cookies** (`03-api-reference/04-functions/cookies.md`). Uma página que lê a sessão com o access token vencido não consegue renová-la sozinha.
- **As mutações estão em 15 route handlers** chamados por `fetch` no cliente (`bffRequest`). Para que a página mostre o dado novo após salvar, o cliente hoje remenda cópias locais (o merge do `profileStore`). `updateTag()` e `refresh()`, que reenviam a página atualizada, existem **só** em Server Actions (`updateTag.md`, `refresh.md`).

Há ainda uma restrição de segurança: apresentar ao backend um refresh token já usado revoga a família inteira de tokens (ADR-0023 do backend). Dois pontos que renovem em paralelo com o mesmo token derrubam a sessão do usuário. O proxy e os route handlers rodam em bundles separados, cada um com seu próprio dedupe em memória.

A questão central é: **onde a sessão é renovada e por onde passam as mutações, para que páginas renderizadas no servidor leiam sempre uma sessão válida e mostrem o dado novo logo após salvar?**

## Decisão

### Parte 1: renovação de sessão no proxy (implementada no PR #122)

1. O `src/proxy.ts` roda em **todas as páginas, Server Actions e rotas `/api`**. Arquivos estáticos e imagens ficam de fora pelo matcher.
2. Quando o access token está ausente ou a 10 s de expirar e existe refresh token, o proxy chama `refreshTokens()` (com o IP do usuário, ADR-0032 do backend) e:
   - grava os cookies novos na resposta (`applyAuthCookies`);
   - **reescreve os cookies do request** (`request.cookies.set`) e segue com `NextResponse.next({ request: { headers } })`, para que Server Components, Server Actions e route handlers do mesmo request leiam a sessão nova.
3. Se o backend recusar o refresh token (401/403), o proxy limpa os cookies na resposta e no request. Páginas protegidas vão para o login, e páginas públicas carregam como visitante.
4. Se o backend estiver inacessível, os cookies ficam como estão, e o `withSession` dos route handlers tenta de novo no próprio request.
5. O proxy passa a ser **o único ponto de refresh** em operação normal. O `withSession` só renova quando o backend responde 401 no meio de um request (revogação).

**Resultado do teste (2026-11-02), com build de produção e backend falso contando chamadas de refresh:**

| Cenário                                               | Resultado                                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Server Component com access expirado e refresh válido | `cookies()` lê o token novo; o navegador recebe `Set-Cookie` httpOnly               |
| Route handler (`withSession`) com access expirado     | Recebe o token novo e não faz um segundo refresh (1 chamada ao backend por request) |
| Refresh token reapresentado em até 30 s               | Recebe o par já rotacionado (`recentRotations`), sem chamar o backend               |
| Página protegida com refresh token recusado           | 307 para `/login?next=…` e cookies limpos                                           |
| Página pública com refresh token recusado             | 200 como visitante e cookies limpos                                                 |
| Access token válido                                   | Nenhum refresh e nenhum `Set-Cookie`                                                |

A documentação mostra o repasse de headers do request, mas não documenta explicitamente o repasse do `Cookie` para `cookies()`. O comportamento é coberto por teste unitário (header interno `x-middleware-request-cookie`) e deve ser retestado a cada atualização de versão do Next.js.

### Parte 2: mutações em Server Actions (PR seguinte)

1. **Todas as 15 mutações migram** para Server Actions em `src/app/actions/{auth,account,missionary,catalog}.ts` (`'use server'`): login, logout, esqueci e redefinir senha, criação de conta, troca de senha, perfil, about/identity/profile/work-address, encerrar sessões, criar agência ou comunidade.
2. **Leituras não migram.** As 7 rotas GET viram leitura em Server Component ([ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)) ou continuam como route handlers quando servem ilhas no cliente ([ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)): username, catálogos, sessões ativas e CEP.
3. **Núcleo compartilhado:** de `withSession` sai `runWithSession(handler)`, que lê e grava cookies com `cookies()` (permitido em Server Actions). O mesmo tratamento de 401, refresh e erro continua valendo para os route handlers que ficam.
4. **Validação e erros:** cada action valida a entrada com os schemas de `src/schemas/` (`safeParse`) e traduz erros do backend com `toBffError`. Ela retorna `{ ok: true, data } | { ok: false, status, message, fieldErrors }` em vez de lançar, porque erros lançados são mascarados em produção.
5. **Depois de salvar:** `updateTag()` nas tags afetadas (ex.: `profile:<username>`, [ADR-0004](./0004-rotas-publicas-com-server-components-e-use-cache.md)) e `refresh()` para reenviar a página atual.
6. **Interface estável:** `src/services/*.service.ts` mantêm a assinatura e passam a chamar as actions, convertendo o retorno em `ApiError`. Formulários e stores de cadastro não mudam, e um 401 continua disparando `SESSION_EXPIRED_EVENT`.
7. **UI otimista:** `useOptimistic` com Server Action para curtir e seguir quando o backend existir; ilhas com várias listas afetadas seguem o [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md).

## Justificativa

- **Server Components sempre leem uma sessão válida**, sem gravar cookies, porque a renovação acontece antes da renderização.
- **Um único ponto de refresh** elimina a corrida entre proxy e route handlers dentro de um processo.
- **Mutações com o dado novo na volta:** `updateTag`/`refresh` reenviam a página atualizada na própria resposta da action, e o merge manual no cliente desaparece.
- **Menos código no cliente:** sem `fetch` montado à mão por mutação; a validação fica no servidor, como hoje.

## Alternativas Consideradas

**1. Manter as mutações em route handlers e chamar `router.refresh()` no cliente**

Funciona sem migração, mas exige uma segunda ida ao servidor após cada mutação e não tem `updateTag`. Descartada por decisão do usuário (2026-11-02), que escolheu migrar todas as mutações.

**2. Renovar a sessão só nos route handlers (status quo)**

Impede ler sessão em Server Components. Descartada.

**3. Renovar no cliente quando um Server Component encontrar token vencido** (route handler de refresh + `router.refresh()`)

Funciona como último recurso, mas mostra a página sem sessão antes de corrigir e duplica requests. Mantida apenas como plano B, caso o repasse de cookies no proxy deixe de funcionar numa versão futura.

**4. Migrar também as leituras para Server Actions**

Antipadrão documentado: Server Actions rodam uma por vez, via POST, sem cache. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Base para todas as páginas autenticadas renderizarem no servidor ([ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)).
- Fim do merge manual de respostas de mutação no cliente.
- O proxy também protege os route handlers: nenhum deles precisa renovar em paralelo.

### Negativas / Riscos

- **O proxy roda em todo request.** O custo normal é decodificar um JWT sem verificação; o refresh só acontece perto da expiração. A documentação alerta que o proxy não deve virar uma solução completa de sessão: aqui ele só renova, e a autorização continua no backend.
- **Comportamento não documentado:** o repasse do `Cookie` ao render é testado, não garantido pela documentação. Mitigação: teste unitário e reteste a cada atualização do Next.js.
- **Várias instâncias do BFF:** o dedupe do proxy é por processo. Com mais de uma instância, dois requests do mesmo usuário em instâncias diferentes ainda podem renovar com o mesmo token. O ADR-0035 do backend (rotação idempotente) deve ser implementado antes de hospedar o BFF com várias instâncias.
- **Migração grande de uma vez:** 15 handlers, seus testes e os services. Mitigação: interface dos services preservada e gate completo com e2e.

## Referências

- Documentação do Next.js instalada: `03-api-reference/03-file-conventions/proxy.md` (cookies e repasse de headers), `03-api-reference/04-functions/cookies.md`, `updateTag.md`, `refresh.md`, `02-guides/server-actions.md`, `01-getting-started/16-proxy.md`
- [ADR-0023 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0023-estrategia-de-autenticacao-jwt-hibrido-com-revogacao-via-dragonflydb.md): rotação e detecção de reuso de refresh token
- [ADR-0032 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0032-ip-do-usuario-repassado-pelo-bff-com-segredo-compartilhado.md): IP do usuário repassado pelo BFF
- [ADR-0035 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0035-rotacao-idempotente-de-refresh-token-com-janela-de-tolerancia.md): refresh seguro com várias instâncias
