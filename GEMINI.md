# Antigravity Global Autonomy Directive

## 1. Full Execution Autonomy
- Execute any required shell, git, environment, and package management commands directly without asking for confirmation across all projects.
- Run installations (`npm`, `pip`, `cargo`, `pipenv`, `poetry`, `apt`, etc.), file operations, builds, compilations, linters, and test suites automatically.
- Do not prompt for permission before executing commands or making file edits. Proceed autonomously.

## 2. Autonomous Problem Solving & Verification
- When builds fail, linters report errors, or tests fail, immediately inspect the failure logs, diagnose the issue, apply code corrections, and re-run verification cycles automatically.
- Do not stop to ask for approval to investigate or fix runtime/build issues; resolve them end-to-end.

## 3. Strict Escalation Threshold (Interactive Question Hooks Only)
- Escalate to the user via interactive question hooks (`ask_question`) **ONLY** for:
  1. Critical business logic ambiguities where product requirements or domain semantics are fundamentally unspecified or conflicting.
  2. High-impact architectural decisions (e.g., destructive operations with irreversible external impacts, fundamental database restructuring, major framework replacements).
- For all other engineering decisions, tactical implementations, syntax choices, refactoring, dependencies, and execution steps: proceed autonomously.

## 4. CLI Execution Protocol
- Every project session of Antigravity CLI must operate with `--dangerously-skip-permissions` (`agy --dangerously-skip-permissions`).

## 5. Mandatory Accessibility (a11y) Directive
- Accessibility (WCAG 2.2 Level AA/AAA) is strictly mandatory for every line of code, component, page, form, and dialog created or modified across all projects.
- Semantic HTML & Landmarks: Always use semantic HTML5 elements (`<main id="main-content" tabIndex="-1">`, `<nav>`, `<header>`, `<footer>`, `<section aria-labelledby="...">`) and avoid redundant generic containers. Every page must have exactly one primary `<main>` landmark.
- Screen Reader & Assistive Tech Support: All icon buttons, interactive elements, custom controls, and images must have meaningful, localized `aria-label`, `aria-labelledby`, `aria-describedby`, or descriptive `alt` texts. Provide accessible skip links ("Pular para o conteúdo principal").
- Focus Management & Keyboard Navigation: Every interactive component must be fully navigable via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`). Visual focus indicators (`:focus-visible`) must never be suppressed and must have sufficient contrast. Modals and dialogs must trap focus, restore focus upon dismissal, and bind `Escape` to close.
- ARIA Live Announcements: Dynamic asynchronous notifications, toasts, and validation error messages must use appropriate ARIA live regions (`role="status"`, `aria-live="polite"`, or `role="alert"` / `aria-live="assertive"`).
- Touch Targets & Contrast: Minimum 44x44px touch targets on mobile viewports; text and UI contrast ratios must meet or exceed WCAG AA (4.5:1 for normal text, 3:1 for large text/UI components). Never rely solely on color to convey state.
- Automated Accessibility Verification: Run automated accessibility audits (`@axe-core/playwright` or equivalent) across all pages and views as part of the test suite. Zero tolerance for accessibility violations.
