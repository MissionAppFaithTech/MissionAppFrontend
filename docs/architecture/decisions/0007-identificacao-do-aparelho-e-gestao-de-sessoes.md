# [ADR-0007]: Identificação do Aparelho e Gestão de Sessões

## Dados

- **Status:** 🟢 Aceito
- **Data:** 2026-11-03
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

A tela **Configurações de Conta → Sessões ativas** lista as sessões da conta (`GET /api/auth/sessions`, ilha do TanStack Query, [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)). Havia três problemas:

- **Cada login virava uma sessão nova.** O BFF só mandava `x-client-type: web` para a API. Sem saber que o navegador era o mesmo, a API abria uma família de refresh token nova a cada login, e a lista crescia com o mesmo aparelho repetido.
- **A lista não dizia se a sessão era de computador ou de celular.** O `deviceType` da API é o tipo de cliente (site ou app), não o tipo de aparelho.
- **Só dava para encerrar todas as sessões.** A API já tinha `DELETE /auth/sessions/{familyId}`, mas a tela não o usava.

O backend passou a aceitar os cabeçalhos `x-device-id` e `x-device-kind` e a manter uma sessão por aparelho ([ADR-0038 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0038-uma-sessao-por-aparelho.md)). Falta decidir como o site identifica o aparelho e o que a tela oferece.

A questão central é: **como o BFF reconhece o mesmo navegador entre logins, descobre o tipo de aparelho e deixa o usuário encerrar uma sessão específica?**

## Decisão

### Pesquisa feita antes de decidir

| Opção                                                                 | O que resolve                                                                                                                                | Por que não basta sozinha                                                          |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `userAgent()` / `userAgentFromString()` de `next/server` (Next.js 16) | Tipo de aparelho (celular, tablet ou computador), navegador e sistema. Usa o `ua-parser-js` 1.x embutido, licença MIT, sem dependência nova. | Não identifica **qual** aparelho: dois computadores com o mesmo Chrome são iguais. |
| Better Auth / Auth.js                                                 | Listam e revogam sessões prontas.                                                                                                            | Assumiriam toda a autenticação, que é da API AdonisJS (ADR-0023 do backend).       |
| `ua-parser-js` 2.x                                                    | Mesmo papel do item 1.                                                                                                                       | Mudou para AGPL; o 1.x embutido no Next atende.                                    |
| FingerprintJS (impressão digital do navegador)                        | Reconhece o aparelho sem cookie.                                                                                                             | É rastreamento (LGPD exige base legal e transparência), e a versão precisa é paga. |
| Cookie de dispositivo (OWASP, "device cookie")                        | Reconhece o navegador onde o usuário já entrou.                                                                                              | Some ao limpar os dados do site, o que é aceitável.                                |

**Escolha:** cookie de dispositivo para reconhecer o navegador e `userAgentFromString()` do Next para o tipo e o nome do aparelho.

### Cookie de dispositivo (`src/lib/auth/device.ts`)

- Nome `ma_device_id`, valor `crypto.randomUUID()`.
- `httpOnly`, `sameSite: lax`, `secure` em produção, `path: /`, validade de 400 dias (o máximo que os navegadores aceitam). O JavaScript da página não o lê.
- Gravado **só depois** de um login ou cadastro bem-sucedido. Uma tentativa com senha errada não cria cookie. Cada login regrava o cookie e renova a validade.
- **O logout mantém o cookie:** ele identifica o navegador, não a sessão. É ele que faz o próximo login substituir a sessão anterior.
- Um valor que a API recusaria (fora de `[A-Za-z0-9_-]{16,128}`) é ignorado e trocado por um novo no login.

### Cabeçalhos enviados à API

`deviceHeaders()` monta, a partir do `user-agent` do pedido do usuário:

- `x-device-id`: o valor do cookie, quando existe;
- `x-device-kind`: `mobile`, `tablet`, `desktop` ou `unknown` (robôs, TVs e pedidos sem `user-agent`);
- `x-device-name`: "Navegador no Sistema", por exemplo "Chrome no Windows", até 120 caracteres.

Eles vão no **login** (`loginAction`), no **cadastro** (`registerAccountAction`) e em **todo refresh**: no proxy ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)) e no refresh de reserva do BFF (`callWithSession`). O refresh precisa deles porque a API grava o nome do aparelho de cada pedido no token novo e o usa para distinguir um pedido repetido de um roubo (ADR-0035 do backend).

### Tela "Sessões ativas"

- Cada linha mostra o ícone e o **texto** do tipo de aparelho ("Computador", "Celular", "Tablet" ou "Aparelho"; nunca só o ícone), o navegador e o sistema, "Conectado desde" (início da sessão) e "Último acesso".
- Este aparelho vem primeiro, com o selo "Este aparelho" e **sem** botão: ele sai pelo "Sair".
- As outras sessões têm o botão **"Encerrar"**, que abre uma confirmação num `Dialog` (`aria-labelledby`/`aria-describedby`, foco inicial em "Cancelar", Escape fecha e devolve o foco ao botão). Ao confirmar, a Server Action `endSessionAction` valida o id (UUID) e chama `DELETE /auth/sessions/{id}` com `runWithSession`; a lista é recarregada e um aviso confirma.
- "Encerrar todas as sessões" continua igual.
- Mobile-first: no `xs` o botão ocupa a largura toda e tem pelo menos 44 px de altura; os botões do diálogo empilham.

## Justificativa

- **Usa o que o framework já traz:** o parser do Next resolve o tipo de aparelho sem dependência nova, nem licença AGPL.
- **Não troca a autenticação:** a API continua dona das sessões; o BFF só informa o aparelho.
- **Privacidade:** o identificador é aleatório e criado pelo próprio site, sem coletar características do hardware. A API guarda só o hash dele.
- **Compatível:** sessões antigas, sem tipo de aparelho, aparecem como "Celular" (cliente app) ou "Aparelho".

## Alternativas Consideradas

1. **Better Auth ou Auth.js.** Descartadas: trariam um segundo dono das sessões, em conflito com a API.
2. **Impressão digital do navegador.** Descartada pela LGPD e pelo custo.
3. **Gerar o id no navegador (`localStorage`).** Descartada: o JavaScript da página poderia lê-lo, e o BFF não o veria no refresh feito pelo proxy.
4. **Encerrar a própria sessão pela lista.** Descartada: duplicaria o "Sair" e deixaria a tela sem sessão no meio da ação.

## Consequências (Trade-offs)

### Positivas / Benefícios

- A lista mostra um item por aparelho, com o tipo em texto e ícone.
- Entrar de novo no mesmo navegador não acumula sessões.
- O usuário encerra a sessão de um aparelho perdido sem sair dos outros.

### Negativas / Riscos

- **Janela anônima, outro navegador ou limpar os dados do site** contam como aparelho novo.
- **O `user-agent` pode ser falso** ou reduzido (User-Agent Client Hints). O tipo serve só para exibição; nenhuma regra de segurança depende dele.
- **Um cookie a mais** (`ma_device_id`), de função estritamente necessária para a sessão.

## Referências

- [ADR-0038 do backend — Uma Sessão por Aparelho](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0038-uma-sessao-por-aparelho.md)
- [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md): lista de sessões como ilha do TanStack Query
- [ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md): Server Actions e refresh no proxy
- [Next.js — `userAgent`](https://nextjs.org/docs/app/api-reference/functions/userAgent)
- [OWASP — Authentication Cheat Sheet, "Device Cookies"](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [MDN — Set-Cookie, limite de 400 dias](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [ua-parser-js — licença da versão 2](https://github.com/faisalman/ua-parser-js)
