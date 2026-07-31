# Contribuindo com o MissionApp Frontend

Obrigado pelo interesse em contribuir. Este guia define o fluxo de trabalho e os padrões de commit do projeto — alinhados ao [MissionApp Backend](https://github.com/MissionAppFaithTech/MissionAppBackend/blob/main/CONTRIBUTING.md).

> **Agentes de IA:** qualquer assistente (Cursor, Claude, Codex, Copilot, etc.) que atue neste repositório **deve** seguir este documento e o [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Ver também [`AGENTS.md`](./AGENTS.md).

---

## Sumário

1. [Pré-requisitos](#pre-requisitos)
2. [Configurando o ambiente](#configurando-o-ambiente)
3. [Fluxo de trabalho](#fluxo-de-trabalho)
4. [Padrões de código](#padroes-de-codigo)
5. [Abrindo um Pull Request](#abrindo-um-pull-request)
6. [Código de Conduta](#codigo-de-conduta)

---

<a name="pre-requisitos"></a>

## Pré-requisitos

| Ferramenta | Versão | Obrigatório | Finalidade |
| ---------- | ------ | ----------- | ---------- |
| [Node.js](https://nodejs.org/) | 20+ | Sim | Runtime |
| [Yarn](https://yarnpkg.com/) | 1.x | Sim | Gerenciador de pacotes (lockfile: `yarn.lock`) |
| [Git](https://git-scm.com/) | 2.x | Sim | Controle de versão |
| Backend Mission App | — | Recomendado | API em `http://localhost:3333` (quando não estiver em mock) |

---

<a name="configurando-o-ambiente"></a>

## Configurando o ambiente

```bash
git clone <url-do-repositorio>
cd MissionAppFrontend
yarn install
cp .env.example .env.local
yarn dev
```

Ajuste `.env.local` conforme `.env.example`. App em [http://localhost:3000](http://localhost:3000).

---

<a name="fluxo-de-trabalho"></a>

## Fluxo de trabalho

### Branches

Crie sempre uma branch a partir de `main`:

```bash
git checkout main
git pull origin main
git checkout -b <tipo>/<descricao-curta>
```

| Prefixo | Quando usar |
| ------- | ----------- |
| `feat/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `docs/` | Documentação |
| `refactor/` | Refatoração sem mudança de comportamento |
| `test/` | Adição ou correção de testes |
| `chore/` | Configuração, CI, dependências |

### Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/), em português, no imperativo e em minúsculas:

```
<tipo>(<escopo opcional>): <descrição imperativa em minúsculas>
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
feat(auth): adicionar tela de redefinição de senha
fix(theme): corrigir contraste de botões no modo escuro
refactor(register): extrair passo de credenciais compartilhadas
chore(deps): atualizar next para a versão mais recente
docs: adicionar guia de contribuição
```

Evite:

```
Update files
Ajustes
feat: Adicionar Tela De Login.
fix: bug
```

Um commit deve ter **uma intenção** — não misture `feat`, `fix` e `chore` no mesmo commit.

---

<a name="padroes-de-codigo"></a>

## Padrões de código

### Lint e formatação

```bash
yarn lint
yarn format
yarn format:check
```

### Convenções do front

- **App Router** (`src/app/`) para rotas e metadata.
- **Componentes** em `src/components/`; formulários em `src/forms/`.
- **Chamadas à API / BFF** em `src/services/` e `src/app/api/`.
- **Tema e tokens** em `src/theme/theme.ts` — não hardcode cores de marca fora do tema.
- Enquanto o backend não estiver ligado, fluxos de auth podem usar mocks em `src/mocks/` (`USE_AUTH_MOCKS`).

### Idioma

Código (identificadores) em **inglês**. Commits, PRs e docs de contribuição em **português (pt-BR)**.

---

<a name="abrindo-um-pull-request"></a>

## Abrindo um Pull Request

1. Abra uma issue para mudanças maiores (recomendado).
2. Crie a branch com o prefixo correto a partir de `main`.
3. Rode `yarn lint` e `yarn format:check`.
4. Abra o PR descrevendo **o que** mudou e **por quê**.
5. Mantenha o escopo focado: uma mudança por PR.

---

<a name="codigo-de-conduta"></a>

## Código de Conduta

Ao participar deste projeto, você concorda em seguir o [Código de Conduta](./CODE_OF_CONDUCT.md). Violações podem ser reportadas em **missionapp.faithtech@gmail.com**.

---

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [MIT](./LICENSE).
