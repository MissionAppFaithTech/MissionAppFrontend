@AGENTS.md

## Mobile-First Responsiveness Guidelines

- **Mobile-first base styles:** Always design base styles for small screens (`xs: ~360px`), adding overrides for `sm`, `md`, `lg`.
- **MUI breakpoint objects:** Use `direction={{ xs: 'column', sm: 'row' }}` and responsive `sx` properties instead of fixed widths.
- **No horizontal scrollbars:** Use `minWidth: 0` for flexing children and ensure flex wrapping on small viewports.
- **Touch targets:** Ensure minimum 44px tap targets for mobile interactions.
