import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Chip, { type ChipProps } from '@mui/material/Chip';

type ExampleDataBadgeProps = Pick<ChipProps, 'sx'> & {
  /** Extra context read by screen readers, e.g. "estatísticas". */
  subject?: string;
};

/**
 * Marks placeholder data shown while the backend has no source for it.
 * Uses an icon + text, never color alone (WCAG 1.4.1).
 */
export default function ExampleDataBadge({ subject, sx }: ExampleDataBadgeProps) {
  return (
    <Chip
      icon={<InfoOutlinedIcon aria-hidden />}
      label="Dados de exemplo"
      size="small"
      variant="outlined"
      color="warning"
      aria-label={subject ? `Dados de exemplo: ${subject} ainda não disponíveis` : undefined}
      sx={[{ fontWeight: 600, maxWidth: '100%' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  );
}
