@AGENTS.md

## Mobile-First Responsiveness Guidelines

- **Mobile-first base styles:** Always design base styles for small screens (`xs: ~360px`), adding overrides for `sm`, `md`, `lg`.
- **MUI breakpoint objects:** Use `direction={{ xs: 'column', sm: 'row' }}` and responsive `sx` properties instead of fixed widths.
- **No horizontal scrollbars:** Use `minWidth: 0` for flexing children and ensure flex wrapping on small viewports.
- **Touch targets:** Ensure minimum 44px tap targets for mobile interactions.

## Accessibility Guidelines (WCAG 2.2 AA)

- **Semantic HTML & Landmarks:** Single `<main id="main-content" tabIndex={-1}>`, explicit `<nav>`, `<header>`, and `<section>`.
- **Skip Links:** Include accessible "Pular para o conteúdo principal" link for keyboard navigation.
- **Accessible Naming & Labels:** Every interactive icon, dialog, and form input must have localized `aria-label`, `aria-labelledby`, or `htmlFor`.
- **Keyboard & Focus:** Visible `:focus-visible` rings, dialog focus trapping and Escape handling.
- **Automated Audits:** Integrate `@axe-core/playwright` to prevent accessibility regressions.
