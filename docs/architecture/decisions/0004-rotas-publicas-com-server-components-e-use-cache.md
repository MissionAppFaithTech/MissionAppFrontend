# [ADR-0004]: Rotas Públicas com Server Components e `use cache`

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-02 (revisão da versão de 2026-11-01)
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

Algumas rotas do MissionApp são públicas e devem ser indexáveis: o perfil público do missionário (`/user/[username]`), a campanha (`/campanha/[id]`) e, no futuro, a busca (RF 1.4, RF 7, RF 13). O `docs/seo-and-ai-discoverability.md` já define metadata, JSON-LD (`Person`, `ProfilePage`, `DonateAction`) e `revalidate = 300` nessas páginas. Hoje elas mostram dados de `src/mocks/`, porque o backend ainda não tem GETs públicos de perfil, campanha ou busca.

A primeira versão deste ADR propunha buscar no servidor e hidratar o TanStack Query. Com o modelo server-first ([ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md), [ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)), essa hidratação deixa de ser necessária: o Next.js 16 cacheia o dado compartilhado no servidor e o revalida por tag.

Três restrições pesam:

- **`use cache` não pode ler `cookies()` nem `headers()`**, nem em funções que ele chama (`03-api-reference/01-directives/use-cache.md`). O dado cacheado precisa ser anônimo.
- **`backendFetch` (`src/lib/api/backend.ts`) lê os headers do request** para repassar o IP do usuário (ADR-0032 do backend). Por isso não pode ser usado dentro de `use cache`.
- **O que é do visitante** ("eu sigo este missionário?", "eu curti este post?") não pode entrar numa página compartilhada entre usuários.

A questão central é: **como as rotas públicas obtêm seus dados para servir HTML completo e cacheável, revalidado quando o dono edita, sem misturar dado do visitante com dado compartilhado?**

## Decisão

Nas rotas públicas indexáveis, o dado compartilhado é lido em Server Components dentro de `use cache`, com tag por entidade:

1. **Leitura anônima e cacheada.** Uma função `publicBackendFetch` em `src/lib/api/` não envia `Authorization`, não lê cookies nem headers e é chamada de funções com `'use cache'`, `cacheTag()` e `cacheLife()`. Exemplos: `getPublicProfile(username)` com `cacheTag('profile:<username>')`; `getCampaign(id)` com `cacheTag('campaign:<id>')`. O tempo de vida é um perfil `cacheLife` próprio de 300 s, equivalente ao `revalidate = 300` de hoje.
2. **Metadata e página usam a mesma função**, então `generateMetadata` e o corpo da página não fazem dois pedidos.
3. **Revalidação imediata pelo dono.** As Server Actions que salvam perfil ou campanha ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)) chamam `updateTag('profile:<username>')` ou `updateTag('campaign:<id>')`, e a próxima visita já vê o dado novo.
4. **Dado do visitante em uma fronteira separada.** O botão "Seguir/Seguindo", o estado de curtida e o "Doar" habilitado ficam num componente dinâmico sob `<Suspense>`, que lê a sessão ([ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)), ou numa ilha do TanStack Query quando houver interação contínua ([ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)). O restante da página continua no shell estático.
5. **404 e erro:** entidade inexistente → `notFound()`; falha da API → `error.tsx` da rota, com mensagem acessível (`role="alert"`) e ação de tentar novamente.
6. **Sem hidratação do TanStack** nessas páginas, a menos que uma parte seja ilha (por exemplo, a primeira página do feed de posts do perfil, quando existir).

### Dependências e pontos em aberto

- **Backend:** precisa expor GETs públicos e anônimos de perfil, campanha, projetos e primeira página de posts, com o envelope do ADR-0033 do backend. Até lá, as páginas seguem com dados de exemplo identificados pelo `ExampleDataBadge`.
- **Rate limit dessas leituras:** dentro de `use cache` não há IP do visitante para repassar, e o resultado é compartilhado. A API precisa reconhecer esse tráfego vindo do servidor do Next (por exemplo, o mesmo `x-missionapp-bff-secret` do ADR-0032, sem `x-missionapp-client-ip`, com orçamento próprio). Isso é contrato e deve ser registrado no backend junto com os endpoints públicos.

## Justificativa

- **SEO e descoberta por IAs recebem HTML completo**, coerente com `docs/seo-and-ai-discoverability.md` e com o NF 2.2.
- **Cache compartilhado de verdade:** uma leitura serve muitos visitantes, o que reduz carga na API (NF 2.5).
- **Frescor controlado pelo dono:** `updateTag` dá semântica de "ler o que acabei de escrever", sem esperar os 300 s.
- **Sem estado duplicado no cliente:** não há cache do TanStack para manter em sincronia com a página.

## Alternativas Consideradas

**1. Prefetch no servidor + hidratação do TanStack Query (versão anterior deste ADR)**

Funciona, mas mantém no cliente uma cópia do dado já renderizado e exige `QueryClient` e chaves em páginas que não têm interação de dados. Descartada; fica só para partes que forem ilhas.

**2. Buscar tudo no cliente**

HTML vazio para buscadores e LCP pior nas páginas de entrada vindas de compartilhamento. Descartada.

**3. Usar `backendFetch` como está**

A leitura de headers tornaria a rota dinâmica, e `use cache` nem permite essa chamada. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Páginas públicas rápidas, indexáveis e cacheadas, com revalidação imediata após edição do dono.
- Separação explícita entre dado compartilhado (cacheado) e dado do visitante (dinâmico ou ilha).

### Negativas / Riscos

- **Duas funções de acesso à API no servidor** (`backendFetch` autenticada e `publicBackendFetch` anônima). Mitigação: nomes e testes que deixam claro o uso de cada uma.
- **Até 300 s de defasagem** em mudanças que não vêm do dono (contador de seguidores, por exemplo). O número exato pode vir na fronteira dinâmica.
- Depende de trabalho no backend (endpoints públicos e política de rate limit) antes de sair dos dados de exemplo.

## Referências

- Documentação do Next.js instalada: `03-api-reference/01-directives/use-cache.md`, `03-api-reference/04-functions/cacheTag.md`, `cacheLife.md`, `updateTag.md`, `02-guides/public-static-pages.md`
- [`docs/seo-and-ai-discoverability.md`](../../seo-and-ai-discoverability.md): estratégia de SEO e JSON-LD das rotas públicas
- [ADR-0032 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0032-ip-do-usuario-repassado-pelo-bff-com-segredo-compartilhado.md): IP do usuário e segredo do BFF
- [ADR-0033 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0033-paginacao-por-cursor-para-feeds-e-listas-incrementais.md): envelope da primeira página de posts
- [Site de requisitos](https://missionappfaithtech.github.io/MissionAppRequirementsList/): RF 1.4, 7, 13; NF 2.2, 2.5
