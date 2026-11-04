/**
 * Hides content visually but keeps it for screen readers (canonical recipe:
 * 1px box clipped with `clip-path: inset(50%)`). Pixel strings: in MUI `sx`, a
 * bare 1 means 100%.
 */
export const visuallyHiddenSx = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;
