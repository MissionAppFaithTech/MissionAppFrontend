# 📋 Architecture Decision Records — MissionApp Frontend

> [!NOTE]
> Esta pasta é o **registro histórico** das decisões arquiteturais do MissionApp Frontend. Cada arquivo explica **o que foi decidido, por quê e quais alternativas foram descartadas**. O processo é o mesmo do backend, descrito no [ADR-0000](./0000-uso-de-architecture-decision-records.md).

---

## 🧭 Onde registrar cada decisão

| Tipo de decisão                                                                                     | Onde fica                                                                                                                                    |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Só do frontend: gerência de estado, renderização, bibliotecas de UI, estrutura de pastas do Next.js | Aqui (`docs/architecture/decisions/`)                                                                                                        |
| Contrato entre BFF e API: envelopes, paginação, erros, autenticação, headers                        | [Backend](https://github.com/MissionAppFaithTech/MissionAppBackend/tree/main/docs/architecture/decisions), porque a API é a dona do contrato |
| Bug, refatoração sem mudança externa, bump de versão, ajuste de lint                                | Issue + PR, sem ADR                                                                                                                          |

Quando um ADR do frontend depende de um ADR do backend, ele cita o número e o link do backend nas Referências.

## ✍️ Como propor

1. Abra uma issue com a label `architecture` descrevendo o problema.
2. Copie o template: `cp docs/architecture/templates/adr-template.md docs/architecture/decisions/XXXX-nome-curto.md`.
3. Use o próximo número livre, status `🟡 Proposto`, e abra um PR com a branch `docs/...`.
4. Depois da revisão de um gestor, o status passa para `🟢 Aceito`. ADRs aceitos não são reescritos: uma mudança de rumo vira um novo ADR que marca o anterior como `🟠 Substituído pelo ADR-XXXX`.

---

## 📚 Índice de ADRs

| #                                                                                 | Título                                                                 | Status      |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------- |
| [ADR-0000](./0000-uso-de-architecture-decision-records.md)                        | Adoção de Architecture Decision Records no Frontend                    | 🟡 Proposto |
| [ADR-0001](./0001-separacao-entre-estado-de-servidor-cliente-url-e-formulario.md) | Separação entre Estado de Servidor, de Cliente, de URL e de Formulário | 🟢 Aceito   |
| [ADR-0002](./0002-adocao-do-tanstack-query-para-estado-de-servidor.md)            | Adoção do TanStack Query nas Ilhas de Estado de Servidor no Cliente    | 🟢 Aceito   |
| [ADR-0003](./0003-escopo-e-convencoes-do-zustand-para-estado-de-cliente.md)       | Escopo e Convenções do Zustand para Estado de Cliente                  | 🟢 Aceito   |
| [ADR-0004](./0004-rotas-publicas-com-server-components-e-use-cache.md)            | Rotas Públicas com Server Components e `use cache`                     | 🟢 Aceito   |
| [ADR-0005](./0005-renderizacao-server-first-com-cache-components.md)              | Renderização Server-First com Cache Components                         | 🟢 Aceito   |
| [ADR-0006](./0006-mutacoes-em-server-actions-e-renovacao-de-sessao-no-proxy.md)   | Mutações em Server Actions e Renovação de Sessão no Proxy              | 🟢 Aceito   |
| [ADR-0007](./0007-identificacao-do-aparelho-e-gestao-de-sessoes.md)               | Identificação do Aparelho e Gestão de Sessões                          | 🟢 Aceito   |
