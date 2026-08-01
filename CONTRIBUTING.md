# 🤝 Contribuindo com o MissionApp Frontend

Obrigado pelo interesse em contribuir. Este guia cobre **como contribuir** (branches, commits, PRs e padrões). Para visão do produto, stack, estrutura de pastas e instalação, use o [`README.md`](./README.md).

Padrões alinhados ao [MissionApp Backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/CONTRIBUTING.md).

> **Agentes de IA:** qualquer assistente (Cursor, Claude, Codex, Copilot, etc.) que atue neste repositório **deve** seguir este documento e o [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Ver também [`AGENTS.md`](./AGENTS.md).

---

## 📋 Sumário

1. [Ambiente](#ambiente)
2. [Fluxo de trabalho](#fluxo-de-trabalho)
3. [Padrões de código](#padroes-de-codigo)
4. [Abrindo um Pull Request](#abrindo-um-pull-request)
5. [Código de Conduta](#codigo-de-conduta)
6. [Segurança](#seguranca)

---

<a name="ambiente"></a>

## 🛠️ Ambiente

Siga a seção **Pré-requisitos** e **Instalação** do [`README.md`](./README.md). Em resumo: Node.js conforme [`.node-version`](./.node-version), **pnpm** (`pnpm install`), `.env.local` a partir de `.env.example`, `pnpm dev`.

**Gerenciador de pacotes:** apenas pnpm (`packageManager` no `package.json`, lockfile `pnpm-lock.yaml`), alinhado ao backend. Não use `npm` nem `yarn` neste repo.

Antes de abrir um PR, rode:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
```

O CI no GitHub (`.github/workflows/ci.yml`) roda `lint`, `format:check`, `typecheck` e `build` em pushes/PRs para `main`.

Commits são validados por **Husky + commitlint** (mensagem Conventional Commits em inglês). Se a mensagem for inválida, o `git commit` falha.

---

<a name="fluxo-de-trabalho"></a>

## 🔄 Fluxo de trabalho

### 🌿 Branches

Crie sempre uma branch a partir de `main`:

```bash
git checkout main
git pull origin main
git checkout -b <type>/<short-description>
```

| Prefixo     | Quando usar                              |
| ----------- | ---------------------------------------- |
| `feat/`     | Nova funcionalidade                      |
| `fix/`      | Correção de bug                          |
| `docs/`     | Documentação                             |
| `refactor/` | Refatoração sem mudança de comportamento |
| `test/`     | Adição ou correção de testes             |
| `chore/`    | Configuração, CI, dependências           |

### 🔒 Proteção da `main`

**Não faça push direto na `main`.** Todo código entra via Pull Request.

Maintainers devem manter a branch `main` protegida no GitHub
(**Settings → Rules → Rulesets**, ou **Settings → Branches → Branch protection rules**):

| Regra                                 | Valor recomendado                              |
| ------------------------------------- | ---------------------------------------------- |
| Target                                | `main`                                         |
| Require a pull request before merging | Sim                                            |
| Require status checks to pass         | Sim — check do workflow `CI`                   |
| Require branches to be up to date     | Opcional (recomendado)                         |
| Block force pushes                    | Sim                                            |
| Restrict deletions                    | Sim                                            |
| Allow bypass                          | Só admins, se necessário (evitar no dia a dia) |

Push direto na `main` sem PR quebra review e o gate do CI. Se o front publicar em Vercel (ou similar), produção deve seguir só a `main` **após merge de PR**.

### ✍️ Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/), em **inglês**, no imperativo e em minúsculas:

```
<type>(<optional-scope>): <imperative description in lowercase>
```

Tipos permitidos (mesmo conjunto do backend):

| Tipo       | Quando usar                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | Nova funcionalidade                              |
| `fix`      | Correção de bug                                  |
| `docs`     | Documentação                                     |
| `style`    | Formatação / ajuste visual sem lógica de negócio |
| `refactor` | Mudança interna sem alterar comportamento        |
| `perf`     | Melhoria de performance                          |
| `test`     | Testes                                           |
| `build`    | Build / bundler / toolchain                      |
| `ci`       | CI/CD                                            |
| `chore`    | Manutenção, deps, configs                        |
| `revert`   | Reverter commit anterior                         |

Escopos comuns no front (opcional): `auth`, `register`, `landing`, `profile`, `theme`, `api`, `seo`.

Exemplos:

```
feat(auth): add password reset screen
fix(theme): fix button contrast in dark mode
refactor(register): extract shared credentials step
chore(deps): update next to the latest version
docs: add contributing guide and code of conduct
```

Evite:

```
Update files
Ajustes
feat: Add Login Screen.
fix: bug
docs: adicionar guia de contribuição
```

Um commit deve ter **uma intenção** — não misture `feat`, `fix` e `chore` no mesmo commit.

O hook `.husky/commit-msg` roda o commitlint automaticamente (mesmas regras do backend em `commitlint.config.mts`).

---

<a name="padroes-de-codigo"></a>

## 📐 Padrões de código

### 🧩 Convenções do front

- **App Router** (`src/app/`) para rotas e metadata.
- **Componentes** em `src/components/`; formulários em `src/forms/`.
- **Chamadas à API / BFF** em `src/services/` e `src/app/api/`.
- **Tema e tokens** em `src/theme/theme.ts` — não hardcode cores de marca fora do tema.
- Enquanto o backend não estiver ligado, fluxos de auth podem usar mocks em `src/mocks/` (`USE_AUTH_MOCKS`).
- **Reuso de UI:** preferir componentes existentes (`PillButton`, `Logo`, `SectionHeader`, `PhoneField`, etc.) e só criar novos quando não houver equivalente. Catálogo para agentes: [`AGENTS.md`](./AGENTS.md) (seção _UI component reuse_).
- **Responsividade:** toda UI deve funcionar em telefone, tablet e desktop (mobile-first, breakpoints MUI). Ver [`AGENTS.md`](./AGENTS.md) (seção _Responsiveness_) e a regra do Cursor `responsiveness.mdc`.

Detalhe das pastas: ver **Estrutura do projeto** no [`README.md`](./README.md).

### 🌐 Idioma

- Código (identificadores): **inglês**
- Mensagens de commit: **inglês** (Conventional Commits)
- Docs de contribuição, PRs e conversa com a comunidade: **português (pt-BR)**

---

<a name="abrindo-um-pull-request"></a>

## 🚀 Abrindo um Pull Request

1. Abra uma issue para mudanças maiores (recomendado) — use os templates em `.github/ISSUE_TEMPLATE/`.
2. Crie a branch com o prefixo correto a partir de `main`.
3. Rode `pnpm lint`, `pnpm format:check` e `pnpm typecheck` (o CI também valida no GitHub).
4. Abra o PR com o template em `.github/pull-request-template.md` — descreva **o que** mudou e **por quê**.
5. Mantenha o escopo focado: uma mudança por PR.
6. Em mudanças de UI, inclua evidência mobile e desktop quando fizer sentido.

Ao contribuir, você concorda que as alterações serão licenciadas sob a [MIT](./LICENSE.txt).

---

<a name="codigo-de-conduta"></a>

## 📜 Código de Conduta

Ao participar deste projeto, você concorda em seguir o [Código de Conduta](./CODE_OF_CONDUCT.md). Violações podem ser reportadas em **missionapp.faithtech@gmail.com**.

---

<a name="seguranca"></a>

## 🔒 Segurança

Vulnerabilidades: siga [`SECURITY.md`](./SECURITY.md) e envie para **missionapp.faithtech@gmail.com** com `[SECURITY]` no assunto. Não abra issue pública.
