# [ADR-0001]: Separação entre Estado de Servidor, de Cliente, de URL e de Formulário

## Dados

- **Status:** 🟢 Aceito
- **Data:** 2026-11-02 (revisão da versão de 2026-11-01)
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

Hoje o frontend busca quase todos os dados no navegador, mesmo em páginas que já são Server Components por fora:

- **Perfil do dono:** `src/stores/profileStore.ts` faz o fetch num `useEffect` do `MissionaryProfileLayout`, guarda `status`/`error`, aplica à mão o retorno de cada mutação e mantém um snapshot em `sessionStorage`. O PR #121 ainda precisou sobrescrever contadores antigos no `merge` do `persist`, outro remendo de cache.
- **Sessão:** `src/stores/sessionStore.ts` deduplica `/api/auth/session` com uma promise em escopo de módulo.
- **Fetches manuais com `useEffect`** em cinco lugares, cada um com seu próprio loading, erro, cancelamento e retry: `ActiveSessionsSection`, `useCatalogItems`, `useUsernameAvailability`, `useCepAutofill` e o próprio `profileStore`.

A primeira versão deste ADR (2026-11-01) propunha o TanStack Query como camada única de estado de servidor. Revendo o modelo do Next.js 16 instalado, essa direção põe no navegador trabalho que o servidor faz melhor. A documentação (`node_modules/next/dist/docs/`) é explícita:

- leituras ficam em Server Components;
- mutações ficam em Server Functions (Server Actions), que depois chamam `updateTag()` ou `refresh()`;
- Server Actions rodam uma por vez e não devem ser usadas para leitura (`02-guides/server-actions.md`).

O MissionApp é sobretudo conteúdo e CRUD: perfil, edição, configurações, campanha, painel admin. Há poucas telas de estado de servidor realmente vivo no cliente (busca por digitação, feed com rolagem infinita), e o feed ainda nem existe no backend.

A questão central é: **onde cada tipo de estado deve morar, para que as próximas integrações não reimplementem cache, deduplicação e invalidação à mão nem levem para o navegador o que o servidor resolve?**

## Decisão

Todo estado do frontend pertence a exatamente uma destas categorias, cada uma com uma ferramenta dona:

| Categoria                                   | Definição                                                              | Ferramenta                                                                                                                                                                                   | Exemplos no MissionApp                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Leitura de dados da API para renderizar** | Dado cuja fonte de verdade é a API, lido para montar a página          | **Server Components** ([ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)): `use cache` + `cacheTag` no que é compartilhado; dinâmico sob `<Suspense>` no que é do usuário | perfil do dono, sessão atual, sessões ativas, perfil público, campanha                                            |
| **Mutações**                                | Escrita na API a partir de um formulário ou ação                       | **Server Actions** ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)), seguidas de `updateTag`/`refresh`                                                      | salvar perfil, "Sobre", senha, login, logout, criar igreja ou agência                                             |
| **Ilhas de estado de servidor no cliente**  | Dado da API que muda no navegador sem navegação                        | **TanStack Query** ([ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)), lendo route handlers                                                                            | disponibilidade de username, listas de catálogo do cadastro, sessões ativas; no futuro, feed com rolagem infinita |
| **Estado de cliente**                       | Dado que nasce e morre no navegador                                    | **Zustand** ([ADR-0003](./0003-escopo-e-convencoes-do-zustand-para-estado-de-cliente.md))                                                                                                    | preferências de a11y, toast, rascunho dos wizards de cadastro, checklist do conselho                              |
| **Estado de URL**                           | Estado que deve sobreviver a reload, virar link ou responder ao voltar | `searchParams` e segmentos de rota                                                                                                                                                           | termo da busca, aba ativa, `next`/`reason` do login                                                               |
| **Estado de formulário**                    | Valores e erros enquanto o formulário está aberto                      | **react-hook-form + zod** (`src/forms/`, `src/schemas/`)                                                                                                                                     | edição de perfil, login, passos do cadastro                                                                       |

### Quando um dado vira ilha no cliente

Um dado de servidor só vai para o TanStack Query se tiver pelo menos uma destas necessidades:

- refazer a busca a cada digitação, sem navegar (typeahead, verificação de username);
- rolagem infinita ou "Carregar mais" com cursor;
- polling, ou refetch ao voltar o foco ou a conexão;
- mutação otimista que precisa atualizar várias consultas e desfazer em caso de erro.

O resto é Server Component. Na dúvida, começa no servidor.

### Regras de fronteira

1. **Resposta da API não entra em store Zustand.** Ela é renderizada pelo servidor ou vive no cache do TanStack Query.
2. **Formulário inicializa com dados vindos do servidor por props** e salva por Server Action. O servidor então reenvia a página com o dado novo (`refresh()`/`updateTag()`), sem merge manual no cliente.
3. **Server Action nunca é usada como leitor.** Leitura no cliente usa route handler (`GET /api/...`).
4. **O que pode ser link vai para a URL** antes de ir para um store.
5. **Rascunhos de cadastro continuam no Zustand:** são dados ainda não enviados, portanto estado de cliente.
6. **Exceção registrada (decisão de 2026-11-02):** a busca de CEP (`/api/cep` + `useCepAutofill`, do PR #121) fica como está.

## Justificativa

- **Menos JavaScript e menos estado no navegador:** perfil, sessão e listas chegam prontos no HTML, sem skeleton seguido de fetch e sem snapshot em `sessionStorage`.
- **Uma fonte de verdade por dado:** depois de uma mutação, o servidor reenvia o dado atualizado em vez de o cliente remendar uma cópia (o problema que o `merge` do #121 expõe).
- **Cada ferramenta no papel em que é forte:** o Next.js 16 cobre cache, deduplicação e invalidação por tag no servidor; o TanStack Query fica com o que só o cliente resolve; o Zustand, com o que não tem servidor.
- **Segue a documentação oficial da versão instalada**, que é a referência obrigatória deste repositório (ver `AGENTS.md`).

## Alternativas Consideradas

**1. TanStack Query como camada única de estado de servidor (versão anterior deste ADR)**

Resolve cache e deduplicação no cliente, mas manda para o navegador leituras que o servidor faz sem custo e mantém skeleton seguido de fetch em toda página. Descartada como regra geral; o TanStack fica restrito às ilhas.

**2. Continuar com Zustand para tudo**

Sem dependência nova, mas cada tela reimplementa cache, cursor e rollback. É o padrão que gerou `profileStore`, `reloadKey` e `requestIdRef`. Descartada.

**3. Redux Toolkit + RTK Query**

Troca toda a camada de cliente por uma mais verbosa e mantém a leitura no navegador. Descartada.

**4. Jotai**

Útil para estado de cliente muito granular; não resolve leitura de servidor. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- As páginas autenticadas renderizam com dados no primeiro paint.
- Cada tela nova sabe de antemão onde cada dado mora.
- O logout tem pontos de limpeza bem definidos: cookies (servidor), cache de ilhas (`queryClient.clear()`) e stores com `reset()`.

### Negativas / Riscos

- **Três modelos para aprender** (Server Components, Server Actions, TanStack nas ilhas). Mitigação: a tabela acima vai para o `AGENTS.md` quando este ADR for aceito.
- **Depende de renovar a sessão antes de renderizar**, porque Server Components não gravam cookies. Isso é resolvido no proxy ([ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)).
- **Migração em etapas:** convivem por um tempo dados no servidor e stores antigos. Mitigação: a ordem de PRs dos ADRs 0005 e 0006, e a regra de nunca guardar o mesmo dado nos dois lugares.

## Referências

- Documentação do Next.js instalada: `02-guides/server-actions.md` (Server Actions em série e não indicadas para leitura), `01-getting-started/07-mutating-data.md`, `02-guides/interactive-apps.md`
- [TanStack Query — Does this replace client state?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state): papel do TanStack frente ao estado de cliente
- [Zustand — Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs): limites do Zustand com SSR
- [Site de requisitos](https://missionappfaithtech.github.io/MissionAppRequirementsList/): RF 2.1, 4.4.2, 7, 8.4, 10.3, 10.6, 11.6; NF 2.2, 2.3, 3.1
