# [ADR-0004]: Busca Inicial com React Server Components e Hidratação em Rotas Públicas

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-01
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

Algumas rotas do MissionApp são públicas e devem ser indexáveis:

- perfil público do missionário (`/user/[username]`);
- página de campanha (`/campanha/[id]`);
- futuramente, a busca (RF 1.4, RF 7, RF 13).

O `docs/seo-and-ai-discoverability.md` já define metadata, JSON-LD (`Person`, `ProfilePage`, `DonateAction`) e `revalidate = 300` nessas páginas. Hoje, porém, elas renderizam dados de `src/mocks/`, porque o backend ainda não tem GETs públicos de perfil, campanha ou busca.

Quando esses dados vierem da API, há três formas de buscá-los:

1. **Só no cliente**, com TanStack Query ([ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)). O HTML inicial sai sem conteúdo, o que piora SEO, descoberta por IAs e o LCP (NF 2.2 pede feed e exploração carregados em menos de 2 s).
2. **Só no servidor**, sem cache no cliente. Bom para SEO, mas as interações da página (seguir, curtir, "Carregar mais" nos posts) teriam que refazer a busca no cliente.
3. **No servidor e entregue ao cache do cliente** (prefetch + hidratação).

Três restrições da arquitetura atual pesam na escolha:

- **Server Components não podem gravar cookies.** O refresh de token (`withSession` em `src/lib/api/bff.ts`) só funciona em route handlers. Por isso, buscar dado **autenticado** em Server Component quebraria quando o access token expirasse.
- **`backendFetch` (`src/lib/api/backend.ts`) lê os headers do request** (`forwardedClientHeaders`, ADR-0032 do backend) e usa `cache: 'no-store'`. Isso torna a rota dinâmica e anula o `revalidate`.
- **O projeto não usa Cache Components** (`cacheComponents` não está no `next.config.ts`). O modelo de cache vigente é o de segment config (`revalidate`) + `fetch` com `next: { revalidate, tags }`.

A questão central é: **como as rotas públicas obtêm seus dados iniciais para servir HTML completo e cacheável, sem duplicar a busca no cliente e sem misturar dado do visitante com dado compartilhado?**

## Decisão

Nas **rotas públicas indexáveis**, os dados compartilhados são buscados em Server Components e entregues ao cache do TanStack Query por hidratação. Nas **rotas autenticadas** (`/profile/**`, `/admin/**`), nada muda: a busca continua no cliente via BFF.

### Regras

1. **Dado público é anônimo e compartilhável.**
   - A busca no servidor usa uma função própria, `publicBackendFetch`, em `src/lib/api/`.
   - Ela não envia `Authorization`, não lê cookies nem headers do request e usa `next: { revalidate, tags }` (ex.: `revalidate: 300`, `tags: ['profile:<username>']`).
   - Assim a página continua estática com revalidação (ISR).
2. **Prefetch + hidratação:**
   - A página cria um `QueryClient` de servidor (`getQueryClient()` do [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)) e chama `prefetchQuery` (ou `prefetchInfiniteQuery` para a primeira página de posts) com **as mesmas query keys** usadas no cliente.
   - Depois envolve a árvore em `<HydrationBoundary state={dehydrate(queryClient)}>`.
   - O componente cliente chama o mesmo hook (`usePublicProfile(username)`) e recebe o dado sem novo pedido.
3. **Metadata e JSON-LD usam a mesma busca.** `generateMetadata` e a página chamam uma função comum, envolvida em `React.cache`. O `fetch` com a mesma URL também é deduplicado pelo Next.
4. **Dado do visitante fica no cliente.** "Eu sigo este missionário?", "eu curti este post?" e o botão de doar habilitado são buscados depois da hidratação, por queries que só rodam com sessão (`enabled` quando autenticado), via BFF. Isso evita que uma página cacheada mostre o estado de outro usuário.
5. **Após mutações do dono, a revalidação é por tag.** Quando o missionário edita o próprio perfil, o route handler do BFF que salvou chama `revalidateTag('profile:<username>')`, e a versão pública atualiza sem esperar os 300 s.
6. **404 e erro:**
   - Perfil ou campanha inexistente → `notFound()` no servidor.
   - Falha da API → a página renderiza o shell e a query refaz a busca no cliente, com o estado de erro acessível (`role="alert"` + "Tentar novamente").
7. **Migração para Cache Components** (`'use cache'`, `cacheLife`, `cacheTag`) fica para um ADR próprio. As regras acima valem em qualquer um dos dois modelos.

### Dependências e pontos em aberto

- **Backend:** precisa expor GETs públicos e anônimos de perfil de missionário, campanha, projetos e primeira página de posts, com o envelope de paginação do ADR-0033 do backend. Até lá, as páginas continuam com dados de exemplo identificados pelo `ExampleDataBadge` (decisão de produto vigente).
- **Rate limit dessas leituras:** como a busca é feita pelo servidor do Next, sem o IP do visitante e compartilhada via ISR, ela não deve consumir o orçamento por IP de um usuário qualquer. A forma de a API reconhecer esse tráfego (por exemplo, o mesmo `x-missionapp-bff-secret` do ADR-0032 do backend, sem `x-missionapp-client-ip`, com orçamento próprio) é decisão de contrato e deve ser registrada no backend junto com os endpoints públicos.

## Justificativa

- **SEO e IAs recebem HTML completo**, coerente com a estratégia de `docs/seo-and-ai-discoverability.md` e com o NF 2.2.
- **Uma busca só:** o dado buscado no servidor vira cache do cliente, e as interações seguintes (seguir, curtir, "Carregar mais") continuam pela mesma camada do [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md).
- **Sem esbarrar no refresh de token:** só dado anônimo é buscado no servidor, então nunca é preciso regravar cookie num Server Component.
- **Cacheável de verdade:** separar `publicBackendFetch` de `backendFetch` mantém a rota estática com revalidação, o que reduz carga na API (NF 2.5: 1.000 usuários simultâneos).

## Alternativas Consideradas

**1. Buscar tudo no cliente**

Mais simples e uniforme, mas entrega HTML vazio para buscadores e IAs e piora o LCP justamente nas páginas de entrada vindas de compartilhamento. Descartada para rotas públicas.

**2. Buscar no servidor sem hidratar o TanStack Query**

O conteúdo renderiza bem, mas o cliente não tem o dado em cache, e cada interação refaz a busca ou mantém um estado paralelo. Descartada.

**3. Server Components também nas rotas autenticadas**

Exigiria refresh de token fora dos route handlers (no `proxy.ts`) para todo request de página, e tornaria essas rotas dinâmicas sem ganho de SEO, já que são privadas e bloqueadas em `robots.ts`. Descartada por enquanto. O refresh proativo no `proxy.ts` é tratado no ADR-0035 do backend por outro motivo.

**4. Usar `backendFetch` como está nas páginas públicas**

Funciona, mas a leitura de headers torna a rota dinâmica: o `revalidate = 300` deixa de valer e cada visita vira um pedido à API. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Páginas públicas rápidas, indexáveis e cacheadas, com revalidação imediata após edição do dono.
- Mesma query key e mesmo hook no servidor e no cliente: sem duplicação de lógica de busca.
- Separação explícita entre dado compartilhado (servidor, cacheado) e dado do visitante (cliente, com sessão).

### Negativas / Riscos

- Duas funções de acesso à API no servidor (`backendFetch` autenticada e `publicBackendFetch` anônima). Mitigação: nomes e testes que deixam claro o uso de cada uma, e lint impedindo `cookies()` em `publicBackendFetch`.
- Conteúdo público pode ficar até 300 s desatualizado quando a mudança não vier do dono (ex.: contador de seguidores). Isso é aceitável para SEO; o número exato aparece após a hidratação, pela query do cliente.
- Depende de trabalho no backend (endpoints públicos e política de rate limit) antes de sair dos dados de exemplo.

## Referências

- [TanStack Query v5 — Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr): `prefetchQuery` + `HydrationBoundary` no App Router
- Documentação do Next.js instalada (`node_modules/next/dist/docs/01-app/02-guides/public-static-pages.md` e `migrating-to-cache-components.md`): páginas públicas, `revalidate` e o modelo de Cache Components
- [`docs/seo-and-ai-discoverability.md`](../../seo-and-ai-discoverability.md): estratégia de SEO e JSON-LD das rotas públicas
- [ADR-0032 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0032-ip-do-usuario-repassado-pelo-bff-com-segredo-compartilhado.md): IP do usuário e segredo do BFF
- [ADR-0033 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0033-paginacao-por-cursor-para-feeds-e-listas-incrementais.md): envelope da primeira página de posts
- [Site de requisitos](https://missionappfaithtech.github.io/MissionAppRequirementsList/): RF 1.4, 7, 13; NF 2.2, 2.5
