import ChurchIcon from '@mui/icons-material/Church';
import PillButton, { type PillButtonProps } from '@/components/common/PillButton';
import { BRING_MISSION_APP_PATH } from '@/lib/church/paths';

type BringMissionAppButtonProps = Omit<PillButtonProps, 'href' | 'tone' | 'children'> & {
  /** Defaults to "Leve o Mission App para sua igreja". */
  label?: string;
};

/**
 * The highlighted call to action that takes a church leader to adopt the
 * Mission App (kit, official day, QR code). Full width on phones.
 */
export default function BringMissionAppButton({
  label = 'Leve o Mission App para sua igreja',
  sx,
  ...props
}: BringMissionAppButtonProps) {
  return (
    <PillButton
      href={BRING_MISSION_APP_PATH}
      tone="missionFilled"
      startIcon={<ChurchIcon aria-hidden />}
      // NOTE: one object, so PillButton can lift the scalar minHeight over its own
      sx={{
        minHeight: 48,
        px: 3,
        fontWeight: 700,
        fontSize: { xs: '0.9375rem', md: '1rem' },
        justifyContent: 'center',
        width: { xs: '100%', sm: 'auto' },
        boxShadow: 'var(--app-shadow-accent)',
        ...(sx as object),
      }}
      {...props}
    >
      {label}
    </PillButton>
  );
}
