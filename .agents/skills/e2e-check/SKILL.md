---
name: e2e-check
description: >-
  Run the Playwright spec that covers a change before any git commit in
  MissionApp Frontend. Use before creating a commit, when the user asks to
  commit, or when CI fails on pnpm test:e2e. Keyboard, focus, and form-error
  flows in e2e/ must pass, not be deleted.
---

# End-to-end tests before commit

CI runs `pnpm test:e2e` (`playwright test`) after the production build. Do not create a commit while the spec that covers the change fails.

## Before `git commit`

From the MissionApp Frontend repo root, when the diff touches a screen, form, dialog, or keyboard behavior that `e2e/` already exercises:

1. Run that spec. Prefer the direct CLI so `pnpm exec` does not start an install:

```bash
node node_modules/@playwright/test/cli.js test e2e/a11y.spec.ts
```

`pnpm test:e2e` is the full CI command. Use it when it will not start a `pnpm install`.

2. The config starts `pnpm start` on port 3000 unless a server is already there (`reuseExistingServer`). A focused spec is enough when only one flow changed. Run the full suite before a PR that touches shared layout, auth, or the profile shell.

3. If a locator is visible and invalid but not focused, fix the focus in the component. Do not remove `toBeFocused()` or lengthen the timeout to hide a focus move that loses to the submit button.

4. Commit only after the spec exits 0.

A passing unit test is not a substitute. jsdom does not restore focus to the clicked button the way Chrome does.
