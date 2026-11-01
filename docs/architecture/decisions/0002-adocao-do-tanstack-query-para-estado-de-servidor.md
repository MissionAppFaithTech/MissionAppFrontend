# [ADR-0002]: Adoção do TanStack Query para Estado de Servidor

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-01
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

O [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md) separa o estado de servidor do estado de cliente. Falta escolher a ferramenta para o estado de servidor e as regras de uso dela nesta arquitetura, que tem quatro particularidades:

- **O navegador nunca fala com a API.** Toda chamada passa por um route handler do Next (`src/app/api/**`) via `bffRequest` (`src/lib/api/client.ts`). O BFF lê os cookies httpOnly, renova o token (`withSession` em `src/lib/api/bff.ts`) e chama a API com `backendFetch` (`src/lib/api/backend.ts`).
- **Um 401 pode chegar a qualquer momento**, não só quando o token expira. Pelo ADR-0023 do backend, troca de senha, revogação remota e "sair de todos" invalidam a sessão. Hoje `bffRequest` dispara `SESSION_EXPIRED_EVENT` e o `SessionWatcher` limpa os stores.
- **A API não manda ETag nem Cache-Control e não tem canal em tempo real.** O frescor depende do cliente: prazo de validade, refetch e invalidação após as próprias mutações.
- **Os próximos requisitos são de lista e interação:**
  - feeds por cursor (NF 2.2) com no máximo 20 itens por requisição (NF 2.3; contrato no ADR-0033 do backend);
  - "Carregar mais" (RF 10.6, 11.6);
  - curtir e seguir com resposta em até 100 ms (RF 8.4, 10.2, NF 3.1);
  - typeahead de igrejas e agências e busca global (RF 2.1, 7).

O código atual resolve partes disso à mão, de formas diferentes em cada lugar:

- `profileStore` com `status`/`error` e merge manual;
- promise de módulo em `sessionStore`;
- `reloadKey` em `ActiveSessionsSection`;
- `cancelled` em `useCatalogItems`;
- `requestIdRef` em `useUsernameAvailability`.

A questão central é: **qual biblioteca gerencia o estado de servidor no frontend, e com quais regras, para funcionar com o BFF, o fluxo de 401 e a paginação por cursor?**

## Decisão

Adotar o **TanStack Query v5** (`@tanstack/react-query`) como a única camada de estado de servidor do frontend.

O TanStack Query é uma biblioteca open-source mantida pela organização TanStack (Tanner Linsley e colaboradores). Ela gerencia dados assíncronos com:

- cache com chave e prazo de validade;
- deduplicação de pedidos simultâneos;
- refetch em segundo plano;
- paginação incremental (`useInfiniteQuery`);
- mutações com atualização otimista e rollback;
- hidratação de dados buscados no servidor.

Ela não faz as requisições em si: recebe uma função assíncrona qualquer. Por isso encaixa no `bffRequest` existente sem mudar o BFF.

### Regras

1. **Um `QueryClient` por request no servidor e um único no navegador.** Uma função `getQueryClient()` (em `src/lib/query/`) usa `isServer` para criar um cliente novo a cada render no servidor e reaproveitar um singleton no navegador. O provider entra em `src/app/providers.tsx`. **Nunca** instanciar `QueryClient` em escopo de módulo compartilhado no servidor, porque vazaria o cache de um usuário para outro.
2. **`queryFn` e `mutationFn` sempre chamam o BFF via `bffRequest`**, ou as funções de `src/services/*.service.ts` que já o usam. Nenhum hook chama a API diretamente.
3. **Fábrica de query keys por domínio**, num único lugar (`src/lib/query/keys.ts`). Exemplos: `profileKeys.me()`, `postKeys.feed('following')`, `catalogKeys.list('faith-communities', filtros)`. Assim, invalidar `postKeys.all` atinge todos os feeds.
4. **Hooks por domínio** ficam junto dos services (ex.: `src/services/queries/profile.queries.ts`). Componentes consomem `useMyProfile()`, `useFeed()`, `useToggleLike()`, nunca `useQuery` cru com chave escrita à mão.
5. **Defaults do `QueryClient`:**
   - `staleTime: 30_000`, para que navegações curtas não refaçam os pedidos;
   - `retry`: nenhum para `ApiError` 4xx (inclusive 401, 423 e 429, que respeitam `Retry-After`/mensagem e não insistem); 1 tentativa para erro de rede (`status` 0) e 5xx;
   - `refetchOnWindowFocus` ligado (padrão), desligável por query, por exemplo no typeahead.
6. **Sessão e 401:**
   - `bffRequest` continua disparando `SESSION_EXPIRED_EVENT`.
   - `clearUserStores()` (em `src/stores/sessionStore.ts`) passa a chamar também `queryClient.clear()`, no logout e no 401.
   - A sessão atual vira uma query (`sessionKeys.current()`), e a deduplicação manual de `pendingSession` sai.
   - Depois do login, `setQueryData` grava o usuário retornado, como `setAuthenticated` faz hoje.
7. **Paginação por cursor:**
   - `useInfiniteQuery` com `initialPageParam: null` e `getNextPageParam: (page) => page.meta.nextCursor ?? undefined`, seguindo o envelope do ADR-0033 do backend, que o BFF repassa sem remodelar.
   - "Carregar mais" e rolagem infinita usam `fetchNextPage`/`hasNextPage`.
   - O botão "Carregar mais" fica sempre disponível como alternativa acessível à rolagem.
8. **Curtir e seguir otimistas:**
   - `onMutate` cancela as queries afetadas, guarda o snapshot e aplica a mudança, inclusive no contador de seguidores e nas páginas já carregadas dos feeds (`setQueriesData`);
   - `onError` restaura o snapshot e avisa via `feedbackStore`;
   - `onSettled` invalida as chaves afetadas.
   - Isso cobre os 100 ms do NF 3.1 sem esperar a rede.
9. **Perfil do dono mantém o snapshot público em `sessionStorage`** (decisão de produto anterior):
   - Após cada sucesso de `useMyProfile()`, grava-se só os campos públicos, com a mesma regra de `toPersistedProfile` de hoje: sem contato, sem financeiro, sem PII.
   - O snapshot é lido como `placeholderData`, de modo que o perfil aparece na hora no reload e é substituído pelo dado fresco.
   - Formulários de edição continuam exigindo dado fresco, não placeholder (regra atual do `ProfileDataGate`).
   - O snapshot é apagado no logout e no 401.
   - **O cache do TanStack Query em si não é persistido** (sem `persistQueryClient`).
10. **Testes:** um helper de teste cria um `QueryClient` novo por teste, com `retry: false`, e envolve o componente no provider. As factories de services continuam mockadas como hoje.
11. **Ferramentas de desenvolvimento:** `@tanstack/react-query-devtools` só em desenvolvimento, carregado sob demanda; `@tanstack/eslint-plugin-query` no ESLint para pegar chaves incompletas e uso incorreto.

### Migração incremental

- Telas novas (feeds, curtidas, seguidores, campanha, busca) já nascem com TanStack Query.
- As existentes migram em PRs separados, cada um com seus testes:
  1. `ActiveSessionsSection`
  2. `useCatalogItems`
  3. `useUsernameAvailability`, mantendo o debounce e usando `enabled` + chave com o valor normalizado
  4. a sessão (`sessionStore.loadSession`)
  5. por último `profileStore`, que vira `useMyProfile` + `useSaveProfileHeader`/`useSaveProfileAbout`, e o store é removido.
- Durante a transição, um store com fetch e uma query não podem guardar o mesmo dado.

### Ponto em aberto (decisão de produto)

O RF 10.2/10.3 pede que o contador de seguidores atualize "em tempo real". Este ADR atende isso para a **ação do próprio usuário** (atualização otimista). Para refletir follows de **outras pessoas** sem recarregar, há duas opções: polling (`refetchInterval`) ou um canal em tempo real no backend, que hoje não existe. A interpretação do requisito precisa ser confirmada com o produto antes da implementação.

## Justificativa

- **Cobre exatamente os requisitos que vêm aí:** `useInfiniteQuery` para cursor, mutações otimistas com rollback para curtir/seguir, deduplicação e cache para os typeaheads.
- **Encaixa no BFF sem mudar nada nele:** a biblioteca só precisa de uma função que devolva uma promise, e `bffRequest` já é essa função, com `ApiError` tipado para decidir retry.
- **Suporte de primeira classe ao App Router:** `HydrationBoundary` e `dehydrate` permitem buscar no servidor e entregar ao cliente sem refetch, o que o [ADR-0004](./0004-busca-inicial-com-rsc-e-hidratacao-em-rotas-publicas.md) usa nas rotas públicas.
- **Maturidade:** a biblioteca de estado de servidor mais usada no ecossistema React, com documentação extensa, devtools e plugin de ESLint.
- **Elimina código manual:** os cinco mecanismos ad hoc listados no Contexto passam a ser configuração.

## Alternativas Consideradas

**1. SWR (Vercel)**

Mais leve e simples para leitura. As mutações otimistas com rollback, a paginação infinita e a invalidação por prefixo de chave são menos completas e exigem mais código do próprio projeto, justamente nas áreas que mais pesam aqui (curtir, seguir, feeds). Descartada.

**2. RTK Query**

Qualidade comparável para estado de servidor, mas traz Redux Toolkit inteiro e um modelo de "API slice" centralizado, além de não substituir o Zustand já em uso. Descartada pelo custo de adoção.

**3. Hooks próprios sobre `bffRequest` (status quo)**

Sem dependência nova, mas é o caminho que já produziu cinco implementações diferentes de loading/erro/retry. Paginação por cursor e rollback otimista multiplicariam isso. Descartada.

**4. Buscar tudo em Server Components, sem cache no cliente**

Funciona para páginas de leitura, mas não resolve interação (curtir, seguir, "Carregar mais", typeahead). Também esbarra no refresh de token: Server Components não podem regravar cookies. Fica restrita às rotas públicas no [ADR-0004](./0004-busca-inicial-com-rsc-e-hidratacao-em-rotas-publicas.md).

## Consequências (Trade-offs)

### Positivas / Benefícios

- Feeds, curtidas e seguidores são implementados com APIs prontas, com comportamento consistente entre telas.
- Menos pedidos ao BFF: deduplicação e `staleTime` evitam chamadas repetidas em navegações curtas. Isso importa porque a API tem rate limits por IP (ADR-0032 do backend).
- O logout limpa todo o dado remoto com uma chamada (`queryClient.clear()`).
- Loading, erro e retry ficam padronizados, o que facilita aplicar os mesmos padrões de acessibilidade (`role="status"`, `aria-busy`, `role="alert"`) em todas as telas.

### Negativas / Riscos

- **Dependência nova** (~13 kB gzip) e conceitos novos para o time: query keys, stale vs. cache time, invalidação.
- **Mais pedidos paralelos ao BFF no carregamento.** O dedupe de refresh em `src/lib/api/bff.ts` (`inflightRefreshes`, `recentRotations`) vale só dentro de um processo. Com várias instâncias do BFF, refreshes paralelos podem reusar o mesmo refresh token, e o backend então revoga a sessão. A correção está proposta no ADR-0035 do backend e deve estar aceita antes de hospedar o BFF com várias instâncias.
- **Convivência temporária de dois padrões** durante a migração. Mitigação: a ordem de migração acima e a regra de não duplicar dado entre store e query.
- **Frescor só por tempo e invalidação:** sem ETag nem tempo real, dados alterados por outras pessoas aparecem após o `staleTime` ou no próximo foco da janela.

## Referências

- [TanStack Query v5 — Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr): `QueryClient` por request e `HydrationBoundary` no App Router
- [TanStack Query — Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries): paginação por cursor
- [TanStack Query — Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates): padrão `onMutate`/rollback
- [ADR-0023 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0023-estrategia-de-autenticacao-jwt-hibrido-com-revogacao-via-dragonflydb.md): ciclo do token e causas de 401
- [ADR-0033 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0033-paginacao-por-cursor-para-feeds-e-listas-incrementais.md): envelope de paginação por cursor
- [ADR-0035 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0035-rotacao-idempotente-de-refresh-token-com-janela-de-tolerancia.md): refresh seguro com várias instâncias do BFF
- [Site de requisitos](https://missionappfaithtech.github.io/MissionAppRequirementsList/): RF 2.1, 7, 8.4, 10.2, 10.6, 11.6; NF 2.2, 2.3, 3.1
