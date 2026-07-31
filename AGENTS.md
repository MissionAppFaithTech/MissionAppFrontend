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
<type>(<optional-scope>): <imperative description in lowercase English>
```

Examples:

```
feat(auth): add password reset screen
fix(theme): fix button contrast in dark mode
chore(deps): update next to the latest version
docs: add contributing guide and code of conduct
```

Commit messages must be in **English**. Chat replies to the user stay in **pt-BR**.

Only create a git commit when the user explicitly asks.

---

## Project

MissionApp Frontend is the **Next.js** web client for Mission App (missionaries and supporters). Maintained by FaithTech.

| Item | Value |
|------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + MUI 9 + Tailwind 4 |
| Package manager | Yarn Classic (`yarn@1.22.22`, lockfile: `yarn.lock`) — never npm/pnpm in this repo |
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
- Identifiers in code: **English**
- Commit messages: **English** (Conventional Commits)
- Contributor docs / PR discussion with the team: **pt-BR** when writing for humans; agent chat: **pt-BR**

---

## UI component reuse (mandatory)

**Reuse first. Create only when nothing similar exists.**

Before adding a new component or one-off MUI styling for a repeated pattern:

1. Check `src/components/common/`
2. Check the domain folder (`landing/`, `layout/`, `profile/`, `register/`, …)
3. Check `src/forms/` for form flows
4. Prefer extending an existing API (new `tone`, prop, size) over a parallel component

### Shared atoms (`src/components/common/`)

| Component | When to use | Notes |
|-----------|-------------|--------|
| `PillButton` | Any branded button / CTA / link-button | Prefer over raw MUI `Button` for product UI. Pick a `tone` — do **not** invent a second button wrapper. |
| `Logo` | Brand mark | Sizes: `sm` \| `md` \| `lg` \| `xl`. `variant`: `auto` \| `light` \| `dark`. |
| `SectionHeader` | Section title + optional subtitle | Landing and content blocks. |
| `PhoneField` | International phone inputs | Also exports `isValidInternationalPhone`. |
| `PasswordStrengthIndicator` | Password strength meter | Pair with `validateStrongPassword` from `@/lib/passwordStrength`. |

### `PillButton` tones (do not reinvent)

| Tone | Typical use |
|------|-------------|
| `cta` | Primary navy CTA (header, select-role) |
| `mission` / `missionFlat` / `missionOutline` | Orange / landing CTAs |
| `primaryOutline` / `outline` | Outline on light surfaces |
| `ghost` | On dark / gradient surfaces |
| `primarySoftOutline` | Profile secondary actions (Contato, Compartilhar, Editar) |
| `primaryFilled` / `missionFilled` | Profile primary actions (Editar perfil / Seguidores) — Figma filled |

Landing/header tones must keep their current look when changing profile tones.

### Layout / chrome

| Component | When to use |
|-----------|-------------|
| `PageNavbar` (+ `PageNavbarActions`) | Sticky app bar shell |
| `SiteHeader` | Marketing landing navigation |
| `ThemeToggle` | Light/dark switch |

### Domain components

Keep page-specific UI in the matching folder; extract to `common/` only when reused in **2+** domains:

- `components/landing/` — landing sections, badges, audience cards
- `components/profile/` — summary, about, navigation, account menu
- `components/register/` — wizards / contexts
- `components/select-role/` — role selection page
- `components/user/` — public user header

### Forms (`src/forms/`)

| Area | Reuse |
|------|--------|
| Auth | `LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm` |
| Register shared | `AccessCredentialsStep`, `RegistrationEmailConfirmation`, `options.ts` |
| Missionaries / supporters | Step components under `forms/register/…` |

Do not duplicate password/username/email confirmation UI — extend shared steps.

### Theme

- Tokens and palette: `src/theme/theme.ts` (`colors`, `roleColors`, `createAppTheme`)
- Never hardcode brand hex (`#0D2B5C`, `#F97316`, …) in new components; use palette keys (`primary`, `mission`, `supporter`, …)

### When a new component is allowed

Create a new file only if:

- No existing component covers the interaction/visual after a reasonable prop/`tone` extension, **and**
- It is clearly a reusable unit (or you are about to copy-paste the same JSX twice)

Place shared atoms in `src/components/common/`. Name in English, PascalCase.

---

## Safety

- Do not commit secrets (`.env`, credentials).
- Do not push, force-push, or amend unless the user explicitly requests it (and amend rules are safe).
- Do not skip git hooks unless the user explicitly requests it.
