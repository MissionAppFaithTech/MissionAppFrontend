# AGENTS.md

Guidance for AI agents operating in this repository (Cursor, Claude Code, Codex, Copilot, Gemini, etc.).

> **Response language:** Always respond in **Brazilian Portuguese (pt-BR)**, regardless of the language used in the user's message or this file.

---

## Mandatory contribution standards

**Before creating commits, branches, or pull requests, read and follow [`CONTRIBUTING.md`](./CONTRIBUTING.md).**

Also follow the community [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) in all interactions (issues, PRs, reviews, chat). Report concerns to **missionapp.faithtech@gmail.com**.

Security vulnerabilities: follow [`SECURITY.md`](./SECURITY.md) — **do not** open a public GitHub issue. Email **missionapp.faithtech@gmail.com** with `[SECURITY]` in the subject.
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

| Item                             | Value                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------ |
| Framework                        | Next.js 16 (App Router)                                                        |
| UI                               | React 19 + MUI 9 + Tailwind 4                                                  |
| Node.js                          | Pin in `.node-version` (align with backend)                                    |
| Package manager                  | pnpm (`pnpm@11.9.0`, lockfile: `pnpm-lock.yaml`) — never npm/yarn in this repo |
| Theme / tokens                   | `src/theme/theme.ts`                                                           |
| Auth mocks (until backend ready) | `src/mocks/` + `USE_AUTH_MOCKS`                                                |
| CI                               | `.github/workflows/ci.yml` — lint, format:check, typecheck, build              |

See `README.md` for setup. Env template: `.env.example`. PR/issue templates live under `.github/`.

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
- **Responsiveness is mandatory** on every UI change (see section below)
- Identifiers in code: **English**
- Commit messages: **English** (Conventional Commits)
- Contributor docs / PR discussion with the team: **pt-BR** when writing for humans; agent chat: **pt-BR**

---

## Responsiveness (mandatory)

**Always implement responsive layouts.** Phone is a first-class target, not an afterthought. Every single component must be designed and built **mobile-first**.

### Rules

1. **Mobile-first approach:** Write default base styles targeting small mobile screens (`xs: ~360px`) first, then layer breakpoint overrides progressively for larger viewports (`sm: 600px`, `md: 900px`, `lg: 1200px`).
2. **MUI Breakpoint Props over Fixed Units:** Always use object syntax for MUI breakpoint props (`direction={{ xs: 'column', md: 'row' }}`, `sx={{ fontSize: { xs: '0.875rem', md: '1.25rem' } }}`) instead of hardcoded desktop pixel widths or fixed flex sizes.
3. **Prevent Horizontal Overflow:** Ensure all container boxes wrap, truncate text, or reflow cleanly. Apply `minWidth: 0` on flex children that need to truncate (`textOverflow: 'ellipsis'`) or shrink without overflowing.
4. **Fluid Stats & Action Grids:** On mobile screens, multi-column statistics or button groups must automatically wrap or scale (e.g., flex-wrap or auto-fit grids) rather than squeeze or overflow horizontally.
5. **Touch-Friendly Controls:** Interactive elements (buttons, icons, chips) must have adequate tap targets (minimum 44x44px touch area) and accessible labels (`aria-label`). Never rely on hover-only affordances for critical interactions.
6. **Double-Viewport Sanity Check:** Verify all UI changes at both small mobile width (~360px) and standard desktop width (~1280px).

### Examples in this codebase

- `ProfileSummaryCard`: on `xs`, avatar/info stack vertically or wrap cleanly; stats reflow onto mobile-friendly grids; primary action buttons wrap smoothly without clipping.
- `ProfileAboutSection` edit control: icon-only on `xs`, icon + “Editar” text label from `sm` up.

---

## Accessibility (mandatory — WCAG 2.2 AA/AAA)

**Accessibility (a11y) is strictly mandatory for every line of code, component, page, form, and dialog created or modified.** The app must be fully operable by blind users, screen reader users, keyboard-only users, and individuals with visual, motor, or cognitive disabilities.

### Rules

1. **Semantic HTML5 & Landmarks:** Always use semantic elements (`<main id="main-content" tabIndex={-1}>`, `<nav>`, `<header>`, `<footer>`, `<section aria-labelledby="...">`) rather than generic `<div>` wrappers. Every page must contain exactly one `<main>` landmark.
2. **Skip Links:** Provide an accessible "Pular para o conteúdo principal" (Skip to main content) link at the top of every page layout, visible upon keyboard focus.
3. **Screen Reader & Labeling Standards:**
   - All icon buttons (`IconButton`) and interactive controls without visible text **must** have an explicit, localized `aria-label`.
   - Modals and dialogs (`Dialog`) **must** declare `aria-labelledby` linking to the title and `aria-describedby` linking to descriptions.
   - All images (`next/image`) must have meaningful `alt` text or `alt=""` with `aria-hidden="true"` for purely decorative elements.
4. **Keyboard Navigation & Focus Management:**
   - Every interactive control must be reachable and actionable via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`).
   - Visual focus indicators (`:focus-visible`) must **never** be removed (`outline: none` without replacement is strictly forbidden). Use high-contrast focus rings.
   - Dialogs and drawers must trap focus while open, close on `Escape`, and restore focus to the trigger upon dismissal.
5. **Forms & Input Accessibility:**
   - All form inputs must have associated `<label>` elements via `htmlFor` / `id` or `aria-labelledby`.
   - Error messages must be linked to inputs via `aria-describedby` and `aria-invalid="true"`.
   - Dynamic validation updates and toast notifications must use ARIA live regions (`role="status"`, `aria-live="polite"` or `role="alert"`).
6. **Touch Targets & Color Contrast:**
   - Minimum 44x44px touch targets on mobile viewports.
   - Color contrast must meet or exceed WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text and UI components).
   - Never use color alone as the single visual cue for status or errors (always pair with icons or explicit text).
7. **Automated Verification:**
   - Run automated accessibility tests via `@axe-core/playwright` across all routes. Zero tolerance for critical or serious accessibility violations.

---

## UI component reuse (mandatory)

**Reuse first. Create only when nothing similar exists.**

Before adding a new component or one-off MUI styling for a repeated pattern:

1. Check `src/components/common/`
2. Check the domain folder (`landing/`, `layout/`, `profile/`, `register/`, …)
3. Check `src/forms/` for form flows
4. Prefer extending an existing API (new `tone`, prop, size) over a parallel component

### Shared atoms (`src/components/common/`)

| Component                   | When to use                            | Notes                                                                                                   |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `PillButton`                | Any branded button / CTA / link-button | Prefer over raw MUI `Button` for product UI. Pick a `tone` — do **not** invent a second button wrapper. |
| `Logo`                      | Brand mark                             | Sizes: `sm` \| `md` \| `lg` \| `xl`. `variant`: `auto` \| `light` \| `dark`.                            |
| `SectionHeader`             | Section title + optional subtitle      | Landing and content blocks.                                                                             |
| `PhoneField`                | International phone inputs             | Also exports `isValidInternationalPhone`.                                                               |
| `PasswordStrengthIndicator` | Password strength meter                | Pair with `validateStrongPassword` from `@/lib/passwordStrength`.                                       |

### `PillButton` tones (do not reinvent)

| Tone                                         | Typical use                                                         |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `cta`                                        | Primary navy CTA (header, select-role)                              |
| `mission` / `missionFlat` / `missionOutline` | Orange / landing CTAs                                               |
| `primaryOutline` / `outline`                 | Outline on light surfaces                                           |
| `ghost`                                      | On dark / gradient surfaces                                         |
| `primarySoftOutline`                         | Profile secondary actions (Contato, Compartilhar, Editar)           |
| `primaryFilled` / `missionFilled`            | Profile primary actions (Editar perfil / Seguidores) — Figma filled |

Landing/header tones must keep their current look when changing profile tones.

### Layout / chrome

| Component                            | When to use                  |
| ------------------------------------ | ---------------------------- |
| `PageNavbar` (+ `PageNavbarActions`) | Sticky app bar shell         |
| `SiteHeader`                         | Marketing landing navigation |
| `ThemeToggle`                        | Light/dark switch            |

### Domain components

Keep page-specific UI in the matching folder; extract to `common/` only when reused in **2+** domains:

- `components/landing/` — landing sections, badges, audience cards
- `components/profile/` — summary, about, navigation, account menu
- `components/register/` — wizards / contexts
- `components/select-role/` — role selection page
- `components/user/` — public user header

### Forms (`src/forms/`)

| Area                      | Reuse                                                                  |
| ------------------------- | ---------------------------------------------------------------------- |
| Auth                      | `LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`                 |
| Register shared           | `AccessCredentialsStep`, `RegistrationEmailConfirmation`, `options.ts` |
| Missionaries / supporters | Step components under `forms/register/…`                               |

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
