# [ADR-0002]: Adoção do TanStack Query nas Ilhas de Estado de Servidor no Cliente

## Dados

- **Status:** 🟢 Aceito
- **Data:** 2026-11-02 (revisão da versão de 2026-11-01)
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

Pelo [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md), leituras para renderizar ficam em Server Components e mutações em Server Actions. Sobram dados de servidor que mudam **no navegador, sem navegação**, e que o servidor não resolve sozinho:

- **Disponibilidade de username:** consulta a cada digitação, com debounce, num endpoint limitado a 20 requisições por minuto por IP (ADR-0032 do backend). Hoje `src/hooks/useUsernameAvailability.ts` controla respostas fora de ordem com `requestIdRef`.
- **Listas de catálogo do cadastro** (agências e comunidades de fé): `src/forms/register/shared/useCatalogItems.ts` refaz o fetch a cada montagem, e um item criado no modal precisa aparecer na hora (RF 2.1).
- **Sessões ativas:** `ActiveSessionsSection` usa `reloadKey` para "tentar novamente".
- **No futuro, o feed:** rolagem infinita com cursor (NF 2.2, NF 2.3; contrato no ADR-0033 do backend) e curtidas ou seguidores com atualização otimista (RF 8.4, RF 10.3, NF 3.1).

Server Actions não servem para essas leituras, porque rodam uma por vez via POST, e a documentação do Next.js 16 recomenda route handlers para leituras feitas pelo cliente.

A primeira versão deste ADR fazia do TanStack Query a camada única de estado de servidor. Esta revisão restringe seu uso às ilhas.

A questão central é: **qual ferramenta gerencia os dados de servidor que vivem no cliente, e com quais regras, sem duplicar o que os Server Components já fazem?**

## Decisão

Adotar o **TanStack Query v5** (`@tanstack/react-query`) **somente nas ilhas** que atendem aos critérios do [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md).

O TanStack Query é uma biblioteca open-source mantida pela organização TanStack (Tanner Linsley e colaboradores). Ela gerencia dados assíncronos com cache por chave, deduplicação, refetch em segundo plano, paginação incremental (`useInfiniteQuery`) e mutações com atualização otimista e rollback. Ela não faz as requisições em si, apenas recebe uma função assíncrona, e por isso encaixa no `bffRequest` existente.

### Ilhas iniciais

| Ilha                        | Leitura (route handler)                                      | Escrita                                   | Observações                                                                                       |
| --------------------------- | ------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Disponibilidade de username | `GET /api/accounts/username-availability`                    | —                                         | Debounce de 450 ms; chave pelo valor normalizado; `retry: false`; mesma API pública do hook atual |
| Listas de catálogo          | `GET /api/missionary-agencies`, `GET /api/faith-communities` | Server Action de criação + `setQueryData` | `staleTime` de 5 min, por causa do limite de 20 req/min/IP                                        |
| Sessões ativas              | `GET /api/auth/sessions`                                     | Server Action "encerrar todas"            | "Tentar novamente" vira `refetch`                                                                 |

**Fora das ilhas por decisão de 2026-11-02:** a busca de CEP (`/api/cep` + `useCepAutofill`) fica como está.

**Ilhas futuras:** feed (`useInfiniteQuery` com `meta.nextCursor` do ADR-0033 do backend), "Carregar mais" de seguidores e curtir/seguir otimistas quando a tela tiver várias listas afetadas. Quando uma ação otimista afetar um único dado renderizado no servidor, prefira `useOptimistic` + Server Action.

### Regras

1. **`QueryClient` por request no servidor e único no navegador:** `getQueryClient()` em `src/lib/query/`, com `isServer`. Nunca instanciar em escopo de módulo compartilhado no servidor.
2. **`queryFn` sempre chama um route handler** via `bffRequest` (`src/lib/api/client.ts`) ou as funções de `src/services/*.service.ts`. Nunca uma Server Action.
3. **Mutações dentro de uma ilha chamam Server Actions** ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)) e depois ajustam o cache da ilha (`setQueryData` ou `invalidateQueries`).
4. **Fábrica de query keys por domínio** em `src/lib/query/keys.ts`; hooks por domínio em `src/services/queries/`. Componentes não escrevem chaves à mão.
5. **Defaults:** `staleTime` de 30 s; nenhum retry para `ApiError` 4xx (inclusive 401, 423 e 429); uma tentativa para rede (`status` 0) e 5xx.
6. **401:** `bffRequest` continua disparando `SESSION_EXPIRED_EVENT`, e a limpeza local passa a chamar também `queryClient.clear()`.
7. **Hidratação opcional:** quando a primeira página de uma ilha precisar vir no HTML (o feed, por exemplo), o Server Component faz `prefetchQuery`/`prefetchInfiniteQuery` com a mesma chave e envolve a ilha em `<HydrationBoundary>`.
8. **Testes:** helper com um `QueryClient` novo por teste e `retry: false`.
9. **Ferramentas:** `@tanstack/react-query-devtools` só em desenvolvimento; `@tanstack/eslint-plugin-query` no ESLint.

**Notas de implementação (2026-11-03):**

- Versão instalada: 5.105. Nela, o `isServer` booleano está depreciado; `getQueryClient()` (`src/lib/query/client.ts`) usa `environmentManager.isServer()`.
- Hooks por domínio em `src/services/queries/` (`useCatalogItems`, `useActiveSessions`, `usernameAvailabilityQuery`). O `useUsernameAvailability` continua em `src/hooks/` com a mesma API; o `setSuggestions`, que ninguém usava, saiu.
- Uma resposta de disponibilidade de username vale 30 s também quando o default muda; o backend confere de novo no envio.
- A criação de agência ou igreja acontece na store do cadastro (ao concluir o passo 3), por isso o `setQueryData` fica no serviço de catálogo (`addCatalogItem`), logo depois da action.
- `clearUserStores()` limpa também o cache de queries. Ele roda no 401, no login, no logout e ao encerrar todas as sessões, não só no 401: assim a lista de sessões de uma conta nunca aparece para a próxima pessoa no mesmo navegador.
- As devtools carregam com `next/dynamic` só quando `NODE_ENV` é `development`.

## Justificativa

- **Resolve exatamente o que o servidor não resolve:** deduplicação por chave na verificação de username, cache entre aberturas do cadastro, rolagem infinita e rollback otimista no futuro feed.
- **Escopo pequeno e explícito:** três ilhas hoje, com critérios claros para novas, em vez de uma camada que competiria com os Server Components.
- **Encaixa no BFF sem mudá-lo:** os route handlers de leitura já existem.
- **Maturidade:** biblioteca de estado de servidor mais usada no ecossistema React, com suporte oficial a App Router e hidratação.

## Alternativas Consideradas

**1. TanStack Query como camada única (versão anterior deste ADR)**

Duplicaria no cliente o cache que os Server Components já oferecem e manteria skeleton seguido de fetch em todas as páginas. Descartada.

**2. Manter os hooks manuais (status quo)**

Funciona para as três ilhas de hoje, mas cada uma reimplementa loading, erro, cancelamento e retry de um jeito diferente, e o feed exigiria cursor e rollback escritos à mão. Descartada.

**3. SWR**

Mais leve para leitura, mas com mutação otimista, invalidação por prefixo e paginação infinita menos completas, justamente o que o feed vai exigir. Descartada.

**4. Server Actions como leitoras**

Antipadrão documentado: rodam uma por vez, via POST, sem cache HTTP. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Os hooks manuais das três ilhas viram configuração, e o comportamento fica padronizado.
- Menos chamadas aos endpoints com limite por IP.
- A base para o feed (rolagem infinita, curtidas) fica pronta antes de a tela existir.

### Negativas / Riscos

- **Dependência nova** (~13 kB gzip) para poucas telas. Mitigação: o escopo é explícito e o feed justifica o investimento.
- **Dois mecanismos de cache** (servidor e ilhas). Mitigação: um dado nunca vive nos dois; a regra 3 sincroniza após mutações.
- **Pedidos paralelos ao BFF** continuam passando pelo refresh centralizado no proxy ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)); com várias instâncias do BFF, vale o risco descrito no ADR-0035 do backend.

## Referências

- [TanStack Query v5 — Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr): `QueryClient` por request e `HydrationBoundary`
- [TanStack Query — Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries): paginação por cursor
- Documentação do Next.js instalada, `02-guides/server-actions.md`: leituras do cliente em route handlers
- [ADR-0033 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0033-paginacao-por-cursor-para-feeds-e-listas-incrementais.md): envelope de paginação por cursor
- [ADR-0035 do backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/docs/architecture/decisions/0035-rotacao-idempotente-de-refresh-token-com-janela-de-tolerancia.md): refresh com várias instâncias do BFF
- [Site de requisitos](https://missionappfaithtech.github.io/MissionAppRequirementsList/): RF 2.1, 8.4, 10.3; NF 2.2, 2.3, 3.1
