# [ADR-0003]: Escopo e Convenções do Zustand para Estado de Cliente

## Dados

- **Status:** 🟡 Proposto
- **Data:** 2026-11-02 (revisão da versão de 2026-11-01)
- **Proponentes:** [@Amaro-peter](https://github.com/Amaro-peter)

---

## Contexto e Problema

O frontend usa Zustand v5 em sete stores (`src/stores/`). Várias práticas já são sólidas, mas só existem no código:

- **Persistência sem mismatch de hidratação:** `persist` com `skipHydration: true`, reidratação num effect e flag `hasHydrated`.
- **Privacidade:** dados de usuário em `sessionStorage` só com campos públicos (`partialize`); a chave legada com PII em `localStorage` é apagada.
- **Limpeza:** `clearUserStores()` zera os stores com dado de usuário no logout e no 401.
- **Versionamento:** `version` + `migrate` descartam formatos antigos.

Três problemas ficam em aberto:

- **Estado de servidor dentro do Zustand.** `profileStore` (fetch, `status`, `error`, merge manual, snapshot em `sessionStorage`, contadores sobrescritos no `merge` pelo PR #121) e `sessionStore` (sessão com dedupe manual). Pelo [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md), esses dados passam a vir do servidor ([ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)).
- **Store de módulo no servidor.** Componentes `'use client'` também renderizam no servidor, e um store criado em escopo de módulo é compartilhado entre todos os requests do processo. Hoje nada escreve em store no servidor, mas nada impede.
- **Falta de critério escrito** sobre o que pode ser persistido e onde.

A questão central é: **o que pode ir para um store Zustand e quais regras garantem que ele seja seguro em SSR, em persistência e no logout?**

## Decisão

O Zustand continua sendo a ferramenta de **estado de cliente**, com as regras abaixo.

### O que pode ir para um store

- Preferências do usuário que não são dados pessoais (`a11yPreferencesStore`).
- Estado de UI que atravessa componentes ou navegações (`feedbackStore`, modais e drawers, rascunho do compositor de post).
- Rascunhos de fluxos com vários passos ainda não enviados (`missionaryRegisterStore`, `supporterRegisterStore`).
- Progresso local sem fonte remota (`churchChecklistStore`).

### O que não pode

- Resposta da API ou cópia dela. Ela é renderizada por Server Components ou, nas ilhas, fica no TanStack Query ([ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)).
- Status de carregamento ou erro de pedidos à API.
- Estado que deveria estar na URL.

### O que sai

- **`profileStore`:** o perfil do dono passa a ser lido no servidor e entregue por props. O snapshot em `sessionStorage` deixa de ser necessário, porque o SSR já mostra o perfil no primeiro paint. A decisão de produto de 2026-10-30 (perfil aparecer na hora no reload, sem PII em Web Storage) continua atendida, e melhor.
- **Estado do `sessionStore`:** a sessão passa a ser lida no servidor ([ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)). O arquivo fica só com `clearUserStores()`.

### Persistência

| Onde             | Pode guardar                                                                | Exemplos                                    |
| ---------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| `localStorage`   | Só dados **não pessoais** que devem sobreviver ao fechar o navegador        | preferências de a11y, checklist do conselho |
| `sessionStorage` | Rascunhos que podem morrer com a aba                                        | rascunho do cadastro (sem senha)            |
| Nenhum (memória) | Todo o resto, inclusive qualquer PII, documento, contato ou dado financeiro | toast, `submission` do cadastro             |

Todo store persistido deve ter:

1. `skipHydration: true` e reidratação num effect no cliente, com `hasHydrated` quando a UI depender disso;
2. `partialize` explícito;
3. `version` + `migrate`, que descarta formatos antigos;
4. storage protegido contra `window` ausente e Web Storage bloqueado (try/catch).

### Segurança em SSR

1. **Store nunca é escrito durante o render nem no servidor.** `set()` só roda em effects, handlers de evento ou callbacks disparados por eles.
2. **Código de servidor não importa stores.** Regra `no-restricted-imports` de `@/stores/*` no `eslint.config.mjs` para `src/app/api/**`, `src/proxy.ts`, `src/lib/api/**`, `src/lib/server/**` e arquivos de Server Actions (`src/app/actions/**`).
3. **Store global de módulo é permitido** enquanto obedecer às regras 1 e 2: no servidor ele fica sempre no estado inicial, igual para todos.
4. **Store via Context (criado por request)** só quando um store precisar de estado inicial vindo do servidor, seguindo o padrão `createStore` + Provider + `useRef` da documentação do Zustand para Next.js.

### Ciclo de vida

- Todo store com algo ligado ao usuário logado expõe `reset()` e é chamado por `clearUserStores()`, inclusive rascunhos, porque outra pessoa pode usar o mesmo navegador.
- Todo store novo tem teste unitário cobrindo `reset()` e, se persistido, `partialize` e `migrate`.

## Justificativa

- Formaliza práticas que já funcionam e já passaram por revisão.
- O risco de vazamento entre requests vem de escrever num store de módulo no servidor; as regras 1 e 2 eliminam a causa, e o lint torna a regra verificável.
- Com perfil e sessão no servidor, os stores ficam pequenos, síncronos e fáceis de testar.

## Alternativas Consideradas

**1. Converter todos os stores para Context + `createStore` por request**

Recomendação genérica para Next.js, mas aqui adicionaria um Provider por store sem reduzir risco real, porque nenhum store recebe dado do servidor. Reservada para quando isso mudar. Descartada como regra geral.

**2. Trocar Zustand por React Context + `useReducer`**

Context re-renderiza todos os consumidores a cada mudança e não tem `persist` pronto. Descartada.

**3. Jotai**

O estado de cliente do MissionApp é pequeno e organizado por domínio; trocar de biblioteca não traria ganho. Descartada.

## Consequências (Trade-offs)

### Positivas / Benefícios

- Critério objetivo para revisar PRs: "isso é estado de cliente?" e "pode ser persistido onde?".
- Vazamento entre requests prevenido por regra verificável no lint.
- Saem o fetch, o merge manual e o snapshot do perfil.

### Negativas / Riscos

- A regra de "nunca escrever no render" não é totalmente verificável por lint; depende de revisão.
- Remover `profileStore` mexe em vários componentes que leem o perfil (seis hoje), que passam a recebê-lo por props ou contexto.

## Referências

- [Zustand — Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs): store por request e riscos de store global no servidor
- [Zustand — Persisting store data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data): `skipHydration`, `partialize`, `version`/`migrate`
- [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md), [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md) e [ADR-0005](./0005-renderizacao-server-first-com-cache-components.md): o que sai do Zustand e para onde vai
