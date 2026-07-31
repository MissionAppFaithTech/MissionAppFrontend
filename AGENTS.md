# AGENTS.md

Guidance for AI agents operating in this repository (Cursor, Claude Code, Codex, Copilot, Gemini, etc.).

> **Response language:** Always respond in **Brazilian Portuguese (pt-BR)**, regardless of the language used in the user's message or this file.

---

## Mandatory contribution standards

**Before creating commits, branches, or pull requests, read and follow [`CONTRIBUTING.md`](./CONTRIBUTING.md).**

Also follow the community [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) in all interactions (issues, PRs, reviews, chat). Report concerns to **missionapp.faithtech@gmail.com**.

`CONTRIBUTING.md` is the source of truth for:

- Branch prefixes (`feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`)
- Conventional Commits (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`)
- Lint / format checks before PR
- PR scope and description expectations

Do **not** invent alternate commit message styles. Align with the MissionApp Backend `CONTRIBUTING.md` conventions.

### Commit format (summary)

```
<tipo>(<escopo opcional>): <descrição imperativa em minúsculas>
```

Examples:

```
feat(auth): adicionar tela de redefinição de senha
fix(theme): corrigir contraste de botões no modo escuro
chore(deps): atualizar next para a versão mais recente
```

Only create a git commit when the user explicitly asks.

---

## Project

MissionApp Frontend is the **Next.js** web client for Mission App (missionaries and supporters). Maintained by FaithTech.

| Item | Value |
|------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + MUI 9 + Tailwind 4 |
| Package manager | Yarn (`yarn.lock`) |
| Theme / tokens | `src/theme/theme.ts` |
| Auth mocks (until backend ready) | `src/mocks/` + `USE_AUTH_MOCKS` |

See `README.md` for setup. Env template: `.env.example`.

---

## Next.js notes

This project may use Next.js APIs that differ from older training data. Prefer patterns already used in `src/app/` and the installed Next.js version in `node_modules/next`. Heed deprecation notices.

---

## Code conventions (short)

- Routes / metadata: `src/app/`
- UI components: `src/components/`
- Forms: `src/forms/`
- API client / BFF helpers: `src/services/`, `src/app/api/`, `src/lib/api/`
- Brand colors via theme tokens — avoid hardcoding outside `src/theme/`
- Identifiers in code: **English**. Commits, PR text, and contributor docs: **pt-BR**

---

## Safety

- Do not commit secrets (`.env`, credentials).
- Do not push, force-push, or amend unless the user explicitly requests it (and amend rules are safe).
- Do not skip git hooks unless the user explicitly requests it.
