@AGENTS.md

## ⚠️ CRITICAL REQUIREMENT SOURCE OF TRUTH

O site (https://missionappfaithtech.github.io/MissionAppRequirementsList/) contém todos os requisitos a serem implementados. Tais requisitos devem ser lidos e consultados antes de qualquer agente de IA ou IA fazer qualquer coisa.

---

## 📱 Mobile-First Design & Coding Directive (MANDATORY FOR EVERYTHING)

**This frontend is strictly Mobile-First.** Desktop is never the starting point. Every layout, page, component, form, card, and dialog must be designed, styled, and coded for mobile screens (`xs: ~360px`) first, then progressively enhanced for larger viewports (`sm: 600px`, `md: 900px`, `lg: 1200px`).

### 1. Button Stacking & Action Groups on Mobile

- **Buttons must stack on mobile:** In cards, hero sections, modal footers, and content blocks, interactive button groups and CTAs must default to stacking vertically on top of each other on mobile (`direction="column"` or `width: { xs: '100%', sm: 'auto' }`).
- **Never allow horizontal collision:** Buttons must never squeeze, collide, or awkwardly indent on narrow viewports. On mobile, set `width: '100%'` and `justifyContent: 'center'` on `PillButton` so each button forms an accessible, clean touch target.

### 2. Mandatory `useFlexGap` on MUI `Stack`

- Whenever using `flexWrap: 'wrap'` on an MUI `<Stack>`, **always** add `useFlexGap`.
- Without `useFlexGap`, MUI applies directional margins (`margin-left`) that do not reset on line-wrap, causing wrapped items to overlap preceding rows.

### 3. Zero Horizontal Overflow

- The page must **never** scroll horizontally on mobile.
- Use `minWidth: 0` on flex children that wrap or truncate text (`textOverflow: 'ellipsis'`).
- Containers must use `maxWidth: '100%'` and responsive padding (`p: { xs: 2, sm: 3, md: 4 }`).
- Never hardcode desktop fixed pixel widths (e.g. `width: 480px`). Always use responsive object syntax (`width: { xs: '100%', md: 480 }`).

### 4. Fluid Typography & Spacing

- All font sizes and spacing scales must be defined mobile-first:
  ```tsx
  sx={{
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
    p: { xs: 2, sm: 3, md: 4 },
  }}
  ```

### 5. Touch Targets (Minimum 44x44px)

- All interactive controls (buttons, chips, tabs, icon buttons) must meet the minimum 44x44px touch target requirement on mobile viewports.
- Never rely on `:hover` for critical information or interactions (mobile devices have no hover). Touch states must use `:active` and visible `:focus-visible`.

### 6. Double-Viewport Verification

- Verify every UI change at small mobile (~360px) **first**, then verify at desktop width (~1280px).

---

## ♿ Accessibility Guidelines (WCAG 2.2 AA)

- **Semantic HTML & Landmarks:** Single `<main id="main-content" tabIndex={-1}>`, explicit `<nav>`, `<header>`, and `<section aria-labelledby="...">`.
- **Skip Links:** Include accessible "Pular para o conteúdo principal" link for keyboard navigation.
- **Accessible Naming & Labels:** Every interactive icon, dialog, and form input must have localized `aria-label`, `aria-labelledby`, or `htmlFor`.
- **Keyboard & Focus:** Visible `:focus-visible` rings, dialog focus trapping and Escape handling.
- **Daltonism (WCAG 1.4.1):** Never use color as the sole cue for state, errors, or requirements. Pair with text or icons.
- **Automated Audits:** Integrate `@axe-core/playwright` to prevent accessibility regressions.
