## 📌 Tipo de Mudança

<!-- Marque todas que se aplicam -->

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] `perf` — melhoria de performance
- [ ] `test` — adição ou correção de testes
- [ ] `docs` — atualização de documentação
- [ ] `chore` — configuração, dependências, infraestrutura
- [ ] `ci` — pipeline de CI/CD
- [ ] `style` — formatação / ajuste visual sem lógica de negócio
- [ ] ⚠️ **Breaking change** — altera fluxo crítico ou contrato com a API

---

## 🚀 Motivação

<!-- Por que essa mudança é necessária? -->

Precisamos fazer essa mudança para ...

---

## 💡 O que foi feito

<!-- Descreva objetivamente as mudanças implementadas. -->

Proponho a seguinte mudança ...

---

## 🧪 Como Testar

1. ...
2. ...

---

## 📸 Evidências

<!-- Screenshots ou vídeo — especialmente se houver UI. Remova se não aplicável. -->

- Mobile (~360px):
- Desktop (~1280px):

---

## 📋 Checklist

**Qualidade**

- [ ] `pnpm lint` passa
- [ ] `pnpm format:check` passa
- [ ] `pnpm typecheck` passa
- [ ] `pnpm build` passa (ou CI verde)

**UI e padrões do front**

- [ ] Layout responsivo (mobile-first; sem overflow horizontal)
- [ ] Reusei componentes existentes (`PillButton`, `Logo`, etc.) quando aplicável
- [ ] Cores de marca via tokens do tema (`src/theme/theme.ts`), sem hex hardcoded
- [ ] Controles críticos não dependem só de hover

**Auth / API**

- [ ] Se tocou em auth: mocks (`USE_AUTH_MOCKS`) vs API real está claro no PR
- [ ] Não commitou segredos (`.env`, tokens)

**Higiene do PR**

- [ ] PR não contém `package-lock.json` nem `yarn.lock`
- [ ] Escopo focado — uma mudança por PR
- [ ] Dependência nova: justificativa no corpo do PR

---

## 🔗 Links

- Issue / task:
- Figma / design:
- Outros:
