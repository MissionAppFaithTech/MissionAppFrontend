---
name: format-check
description: >-
  Run Prettier before any git commit in MissionApp Frontend. Use before
  creating a commit, when the user asks to commit, or when CI fails on
  pnpm format:check or prettier --check.
---

# Format check before commit

CI runs `pnpm format:check` (`prettier --check .`). Do not create a commit while that check fails.

## Before `git commit`

From the MissionApp Frontend repo root, after the edits and before the commit:

1. Format the files you changed:

```bash
node node_modules/prettier/bin/prettier.cjs --write path/to/file
```

Use `pnpm format` only when it will not start a `pnpm install`.

2. Confirm formatting:

```bash
pnpm format:check
```

3. If Prettier prints `[warn]`, write those files again and repeat the check.
4. Commit only after `format:check` exits 0.

A small diff is not a reason to skip the check.
