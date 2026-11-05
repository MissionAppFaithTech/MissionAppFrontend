import Divider from '@mui/material/Divider';

/**
 * Line between the parts of a "Sobre". Darker than the default divider so the
 * parts read apart: 3.7:1 on white and 3.2:1 on dark paper (WCAG 1.4.11).
 */
export default function AboutDivider() {
  return <Divider sx={{ borderColor: 'var(--mui-palette-action2-fieldBorder)' }} />;
}
