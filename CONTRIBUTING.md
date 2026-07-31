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

---

<a name="ambiente"></a>

## 🛠️ Ambiente

Siga a seção **Pré-requisitos** e **Instalação** do [`README.md`](./README.md). Em resumo: Node.js 20+, Yarn, `yarn install`, `.env.local` a partir de `.env.example`, `yarn dev`.

Antes de abrir um PR, rode:

```bash
yarn lint
yarn format:check
```

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

| Prefixo | Quando usar |
| ------- | ----------- |
| `feat/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `docs/` | Documentação |
| `refactor/` | Refatoração sem mudança de comportamento |
| `test/` | Adição ou correção de testes |
| `chore/` | Configuração, CI, dependências |

### ✍️ Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/), em **inglês**, no imperativo e em minúsculas:

```
<type>(<optional-scope>): <imperative description in lowercase>
```

Tipos permitidos (mesmo conjunto do backend):

| Tipo | Quando usar |
| ---- | ----------- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `style` | Formatação / ajuste visual sem lógica de negócio |
| `refactor` | Mudança interna sem alterar comportamento |
| `perf` | Melhoria de performance |
| `test` | Testes |
| `build` | Build / bundler / toolchain |
| `ci` | CI/CD |
| `chore` | Manutenção, deps, configs |
| `revert` | Reverter commit anterior |

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

---

<a name="padroes-de-codigo"></a>

## 📐 Padrões de código

### 🧩 Convenções do front

- **App Router** (`src/app/`) para rotas e metadata.
- **Componentes** em `src/components/`; formulários em `src/forms/`.
- **Chamadas à API / BFF** em `src/services/` e `src/app/api/`.
- **Tema e tokens** em `src/theme/theme.ts` — não hardcode cores de marca fora do tema.
- Enquanto o backend não estiver ligado, fluxos de auth podem usar mocks em `src/mocks/` (`USE_AUTH_MOCKS`).

Detalhe das pastas: ver **Estrutura do projeto** no [`README.md`](./README.md).

### 🌐 Idioma

- Código (identificadores): **inglês**
- Mensagens de commit: **inglês** (Conventional Commits)
- Docs de contribuição, PRs e conversa com a comunidade: **português (pt-BR)**

---

<a name="abrindo-um-pull-request"></a>

## 🚀 Abrindo um Pull Request

1. Abra uma issue para mudanças maiores (recomendado).
2. Crie a branch com o prefixo correto a partir de `main`.
3. Rode `yarn lint` e `yarn format:check`.
4. Abra o PR descrevendo **o que** mudou e **por quê**.
5. Mantenha o escopo focado: uma mudança por PR.

Ao contribuir, você concorda que as alterações serão licenciadas sob a [MIT](./LICENSE.txt).

---

<a name="codigo-de-conduta"></a>

## 📜 Código de Conduta

Ao participar deste projeto, você concorda em seguir o [Código de Conduta](./CODE_OF_CONDUCT.md). Violações podem ser reportadas em **missionapp.faithtech@gmail.com**.
