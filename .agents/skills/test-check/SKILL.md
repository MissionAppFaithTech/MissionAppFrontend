---
name: test-check
description: >-
  Run Vitest before any git commit in MissionApp Frontend. Use before
  creating a commit, when the user asks to commit, or when CI fails on
  pnpm test. Update specs in the same change when a visible label or
  link changes.
---

# Tests before commit

CI runs `pnpm test` (`vitest run`). Do not create a commit while a spec that covers the change fails.

## Before `git commit`

From the MissionApp Frontend repo root, after the edits and before the commit:

1. Run every spec that imports a file you changed:

```bash
node node_modules/vitest/vitest.mjs run path/to/Component.test.tsx
```

Use `pnpm test` for the full suite when it will not start a `pnpm install`. That is the CI command.

2. If a test looks for a label, link, or role that the UI no longer renders, update the spec to the current accessible name. Do not leave the old text in the assertion.

3. Commit only after the affected specs, and `pnpm test` when you ran it, exit 0.

A small UI change is not a reason to skip the specs. A renamed menu item fails CI the same way a broken assertion does.
