# [ADR-0001]: Separação entre Estado de Servidor, de Cliente, de URL e de Formulário

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-01
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

Hoje o frontend guarda qualquer estado compartilhado em stores Zustand (`src/stores/`), seja qual for a origem do dado. Funciona bem para preferências e rascunhos, mas mistura duas naturezas diferentes de estado:

- **Dado que pertence à API** e do qual o navegador tem só uma cópia. `src/stores/profileStore.ts` busca o perfil, guarda `status`/`error` e aplica à mão o retorno de cada mutação (`applyUser`, `applyMissionary`, `applyWorkAddress`). `src/stores/sessionStore.ts` deduplica `/api/auth/session` com uma promise em escopo de módulo.
- **Dado que só existe no navegador:** preferências de acessibilidade, toast atual, passo do wizard.

Fora dos stores, cada componente que lê a API reimplementa carregamento, erro, cancelamento e "tentar novamente" com `useEffect` e `useState`:

- `src/components/profile/settings/ActiveSessionsSection.tsx`: `reloadKey` para retry;
- `src/forms/register/shared/useCatalogItems.ts`: flag `cancelled`;
- `src/hooks/useUsernameAvailability.ts`: debounce + `requestIdRef` contra respostas fora de ordem.

As próximas integrações aumentam muito essa demanda. Pelo [site de requisitos](https://missionappfaithtech.github.io/MissionAppRequirementsList/):

- feeds cronológicos com paginação por cursor de 20 itens (RF 4.4.2, 5.3.1, 10.4, NF 2.3);
- listas "Carregar mais" de seguidores (RF 10.6, 11.6);
- curtir e seguir com contador atualizado e feedback em até 100 ms (RF 8.4, 10.2, NF 3.1);
- busca global e typeahead (RF 7, 2.1).

Essas telas hoje usam `src/mocks/`.

A questão central é: **onde cada tipo de estado deve morar, para que as próximas integrações não reimplementem cache, deduplicação, paginação e rollback à mão em cada tela?**

## Decisão

Todo estado do frontend pertence a exatamente uma destas quatro categorias. Cada categoria tem uma ferramenta dona:

| Categoria                | Definição                                                                         | Ferramenta                                                                                  | Exemplos no MissionApp                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Estado de servidor**   | Cópia local de dado cuja fonte de verdade é a API (via BFF)                       | **TanStack Query** ([ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)) | perfil do dono, sessão atual, sessões ativas, catálogos, disponibilidade de username, feeds, curtidas, seguidores, campanha, busca |
| **Estado de cliente**    | Dado que nasce e morre no navegador, sem fonte de verdade remota                  | **Zustand** ([ADR-0003](./0003-escopo-e-convencoes-do-zustand-para-estado-de-cliente.md))   | preferências de a11y, toast (`feedbackStore`), rascunho e passo dos wizards de cadastro, checklist do conselho, modais abertos     |
| **Estado de URL**        | Estado que precisa sobreviver a reload, ser compartilhável ou navegável no voltar | `searchParams` / segmentos de rota do App Router                                            | termo e filtros da busca, aba ativa do perfil, `next` e `reason` do login                                                          |
| **Estado de formulário** | Valores e erros de um formulário enquanto ele está aberto                         | **react-hook-form + zod** (já em uso em `src/forms/` e `src/schemas/`)                      | edição de perfil, login, passos do cadastro                                                                                        |

Regras de fronteira:

1. **Resposta da API não entra em store Zustand.** Ela vive no cache do TanStack Query. Um store pode guardar um _id_ ou uma _seleção_ do usuário, nunca a entidade buscada.
2. **Formulário inicializa a partir da query e devolve via mutação.** Os valores em edição ficam no react-hook-form; o salvar é uma `useMutation` que atualiza ou invalida a query.
3. **O que pode ser link vai para a URL** antes de ir para um store.
4. **Rascunhos de cadastro continuam no Zustand.** São dados que o usuário ainda não enviou, portanto estado de cliente, mesmo que um dia virem payload da API.

## Justificativa

- Estado de servidor tem problemas próprios que estado de cliente não tem: cache com prazo de validade, deduplicação de pedidos simultâneos, refetch em segundo plano, invalidação após mutação, paginação incremental, atualização otimista com rollback. Resolver isso uma vez numa biblioteca é mais barato e mais correto do que em cada store ou `useEffect`.
- Com o dado remoto fora do Zustand, os stores ficam pequenos, síncronos e fáceis de testar, e os riscos de SSR e persistência se concentram em poucos lugares ([ADR-0003](./0003-escopo-e-convencoes-do-zustand-para-estado-de-cliente.md)).
- A separação é a recomendação corrente da comunidade React e da própria documentação do Zustand e do TanStack Query.

## Alternativas Consideradas

**1. Continuar com Zustand para tudo**

Não exige dependência nova, mas cada feed, lista paginada ou botão otimista teria que reimplementar cache, dedupe, cursor e rollback. É o padrão que já gerou `profileStore`, `reloadKey` e `requestIdRef`. Descartada.

**2. Redux Toolkit + RTK Query (um só lugar para os dois estados)**

Resolve o estado de servidor com qualidade parecida, mas troca toda a camada de estado de cliente por uma mais verbosa, sem ganho para o tamanho do time e do app. Descartada.

**3. Jotai (átomos) para estado de cliente**

Brilha com estado de cliente muito granular e interdependente. Aqui o estado de cliente é pequeno e já está bem atendido pelo Zustand, e o problema real é o estado de servidor, que Jotai não resolve. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Cada nova tela sabe de antemão onde cada dado mora. Isso reduz decisões ad hoc e revisões longas.
- Sai código repetido de loading/erro/retry dos componentes.
- O logout tem dois pontos de limpeza bem definidos: o cache de queries e os stores com `reset()`.

### Negativas / Riscos

- Durante a migração convivem dois padrões (store com fetch e query). Mitigação: migração incremental descrita no [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md).
- Há uma nova categoria para ensinar aos contribuidores. Mitigação: a tabela acima vai para o `AGENTS.md` quando este ADR for aceito.

## Referências

- [Site de requisitos do MissionApp](https://missionappfaithtech.github.io/MissionAppRequirementsList/): RF 4.4.2, 5.3.1, 7, 8.4, 10.2, 10.6, 11.6 e NF 2.3, 3.1
- [TanStack Query — Does this replace client state?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state): separação entre estado de servidor e de cliente
- [Zustand — Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs): limites do Zustand em SSR
