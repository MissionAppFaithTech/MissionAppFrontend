# [ADR-0003]: Escopo e Convenções do Zustand para Estado de Cliente

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-01
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

O frontend usa Zustand v5 em sete stores (`src/stores/`). Boa parte das práticas já é sólida, mas está só no código, nunca foi registrada:

- **Persistência sem mismatch de hidratação:** `persist` com `skipHydration: true`, reidratação num effect (`rehydrateProfileStore`) e flag `hasHydrated`.
- **Privacidade:** o perfil guarda em `sessionStorage` só os campos públicos (`partialize` + `toPersistedProfile`). A chave legada que tinha PII em `localStorage` é apagada.
- **Limpeza:** `clearUserStores()` zera os stores com dado de usuário no logout e no 401.
- **Versionamento:** `version` + `migrate` descartam formatos antigos.

Três riscos ficam em aberto:

- **Store de módulo no servidor.** No App Router, componentes `'use client'` também renderizam no servidor, e um store criado em escopo de módulo é compartilhado entre todos os requests do processo. Hoje nenhum código de servidor importa stores e toda escrita acontece em effects e handlers. Nada impede, porém, que alguém chame `set()` durante o render ou importe um store num route handler, e aí o dado de um usuário vazaria para outro.
- **Estado de servidor dentro do Zustand** (`profileStore`, `sessionStore`), que o [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md) passa a proibir.
- **Falta de critério escrito** sobre o que pode ser persistido e onde.

A questão central é: **o que pode ir para um store Zustand e quais regras garantem que ele seja seguro em SSR, em persistência e no logout?**

## Decisão

O Zustand continua sendo a ferramenta de **estado de cliente**, com as regras abaixo.

### O que pode ir para um store

- Preferências do usuário que não são dados pessoais (`a11yPreferencesStore`).
- Estado de UI que atravessa componentes ou navegações (`feedbackStore`, modais e drawers abertos, rascunho do compositor de post).
- Rascunhos de fluxos com vários passos que ainda não foram enviados (`missionaryRegisterStore`, `supporterRegisterStore`).
- Progresso local sem fonte remota (`churchChecklistStore`).

### O que não pode

- Resposta da API ou cópia dela: isso é estado de servidor, no TanStack Query ([ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)). `profileStore` e a parte de sessão do `sessionStore` migram para queries.
- Status de carregamento ou erro de pedidos à API (`status: 'loading'`): isso é da query ou da mutação.
- Estado que deveria estar na URL (filtros, aba, termo de busca).

### Persistência

| Onde             | Pode guardar                                                           | Exemplos                                                     |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `localStorage`   | Só dados **não pessoais**, que devem sobreviver ao fechar o navegador  | preferências de a11y, checklist do conselho                  |
| `sessionStorage` | Rascunhos e snapshots públicos que podem morrer com a aba              | rascunho do cadastro (sem senha), snapshot público do perfil |
| Nenhum (memória) | Todo o resto, inclusive qualquer PII, documento, contato ou financeiro | toast, `submission` do cadastro                              |

Todo store persistido deve ter:

1. `skipHydration: true` e reidratação num effect no cliente, com `hasHydrated` quando a UI depender disso;
2. `partialize` explícito: nunca persistir o estado inteiro por padrão;
3. `version` + `migrate`, que descarta formatos antigos em vez de tentar convertê-los;
4. storage protegido contra `window` ausente e contra Web Storage bloqueado (try/catch), como o `sessionStorageSafe` de `profileStore`.

### Segurança em SSR

1. **Store nunca é escrito durante o render nem no servidor.** `set()` só roda em effects, handlers de evento ou callbacks assíncronos disparados por eles.
2. **Código de servidor não importa stores.** Uma regra `no-restricted-imports` de `@/stores/*` vai para o `eslint.config.mjs`, aplicada a `src/app/api/**`, `src/proxy.ts` e `src/lib/api/**`.
3. **Store global de módulo é permitido** enquanto obedecer às duas regras acima, porque nesse caso o estado no servidor é sempre o inicial e igual para todos.
4. **Store via Context (criado por request)** só quando um store precisar receber estado inicial vindo do servidor. Nesse caso, segue o padrão `createStore` + Provider + `useRef` da documentação do Zustand para Next.js.

### Ciclo de vida

- Todo store que guarde algo ligado ao usuário logado expõe `reset()` e é chamado por `clearUserStores()`. Isso inclui rascunhos, porque outro usuário pode usar o mesmo navegador.
- Todo store novo tem teste unitário cobrindo `reset()` e, se persistido, `partialize` e `migrate` (padrão de `src/stores/*.test.ts`).

## Justificativa

- Formaliza práticas que já funcionam no código e já passaram por revisão, em vez de trocá-las.
- O risco de vazamento entre requests vem de escrever num store de módulo no servidor, não do store de módulo em si. As regras 1 e 2 eliminam a causa sem a cerimônia de um Provider por store. O lint torna a regra verificável.
- A tabela de persistência transforma a decisão de produto já tomada (sem PII em Web Storage) num critério que vale para qualquer store novo.

## Alternativas Consideradas

**1. Converter todos os stores para o padrão Context + `createStore` por request**

É a recomendação genérica para Next.js. Aqui ela adicionaria um Provider e um hook de contexto por store sem reduzir risco real, já que, depois do [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md), nenhum store recebe dado do servidor. Fica reservada para o caso em que isso mudar. Descartada como regra geral.

**2. Trocar Zustand por React Context + `useReducer`**

Sem dependência, mas Context re-renderiza todos os consumidores a cada mudança e não tem `persist` pronto. O Zustand já resolve as duas coisas com seletores. Descartada.

**3. Jotai**

Bom para estado muito granular e interdependente (estado por item numa lista longa). O estado de cliente do MissionApp é pequeno e organizado por domínio. Trocar de biblioteca não traria ganho. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Critério objetivo para revisar PRs: "isso é estado de cliente?" e "pode ser persistido onde?".
- Vazamento entre requests prevenido por regra verificável no lint, não só por convenção.
- Stores menores e síncronos, mais fáceis de testar.

### Negativas / Riscos

- A regra de "nunca escrever no render" não é totalmente verificável por lint. Continua dependendo de revisão.
- Ao remover `profileStore`, componentes que leem o perfil precisam trocar o seletor pelo hook da query, o que é uma migração com vários arquivos (6 componentes hoje).

## Referências

- [Zustand — Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs): store por request e riscos de store global no servidor
- [Zustand — Persisting store data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data): `skipHydration`, `partialize`, `version`/`migrate`
- [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md) e [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md): o que sai do Zustand
