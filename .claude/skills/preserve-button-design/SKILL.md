---
name: preserve-button-design
description: >-
  Protects the button and color design built by Allana in MissionApp Frontend.
  Use whenever an edit touches buttons, PillButton, tones, colors, the theme,
  hover/focus/dark-mode styles, or any visual refactor, merge or conflict
  resolution that could change them.
---

# Preserve Allana's button and color design

The buttons and the color system were designed by Allana and are the visual identity of the product.
**Never remove, flatten, restyle or "simplify" them**, even when it looks like a harmless cleanup,
a lint fix, a merge resolution or a dependency of another task.

## What is protected

- `src/components/common/PillButton.tsx`: every `tone` (`cta`, `mission`, `missionFlat`, `missionOutline`,
  `primaryOutline`, `outline`, `ghost`, `primarySoftOutline`, `primaryFilled`, `missionFilled`, `danger`,
  `dangerOutline`), their light and dark variants, hover, active and `:focus-visible` states.
- `src/theme/theme.ts`: `colors`, `roleColors`, shades, semantic tokens for light and dark,
  `BUTTON_BORDER_RADIUS` (`10px`, a rounded rectangle, never a stadium) and `FORM_ACTION_BUTTON_SX`.
- Action hierarchy: primary = orange fill (`mission`), secondary = outline, destructive = red,
  second CTA tier = navy (light) / light blue (dark).
- How each screen already uses them (which tone sits on which button).

## Rules

1. **Reuse, never replace.** Use `PillButton` with an existing `tone`. No raw MUI `Button` for product CTAs.
2. **No call-site overrides** of `borderRadius`, background, border or text colors on a `PillButton`.
   Layout props (`width`, `alignSelf`, `justifyContent`) are fine.
3. **No hardcoded brand hex** (`#0D2B5C`, `#C2410C`, ...) outside `src/theme/theme.ts`. Use palette keys.
4. **Need something new?** Add a new `tone` or token without changing the existing ones.
   Light mode must keep its exact look; a dark-mode change must not shift light.
5. **Removing a button is a product decision.** Remove one only when the user asks for that specific
   button. Delete the button and its now-unused imports only; leave the tone and the theme as they are.
6. **Merges and conflicts:** in `PillButton.tsx` and `theme.ts`, keep both sides' visual rules.
   Never resolve by taking a simplified version.
7. Keep the mobile-first and accessibility rules from `AGENTS.md`: 44px touch target on `xs`,
   visible `:focus-visible`, contrast of 4.5:1 for text and 3:1 for controls.

## Before finishing a change that touches UI

- Run `git diff -- src/components/common/PillButton.tsx src/theme/theme.ts`. If either file changed
  and the user did not ask for it, undo that part.
- Confirm no tone, color token or radius was removed or renamed.
- Run the affected unit tests and, for visible changes, the Playwright spec and the axe scan in
  light and dark.
