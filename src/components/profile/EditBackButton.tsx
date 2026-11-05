'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PillButton from '@/components/common/PillButton';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';

type EditBackButtonProps = {
  /** The user's own profile home. */
  href: string;
  /** The form has unsaved changes: ask before leaving. */
  dirty: boolean;
  /** Drops the unsaved changes (and announces it) before leaving. */
  onDiscard: () => void;
  disabled?: boolean;
};

/**
 * "Voltar" of the edit forms. With unsaved changes it asks first; the safe
 * choice ("Continuar editando") keeps the user on the page.
 */
export default function EditBackButton({ href, dirty, onDiscard, disabled }: EditBackButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const sx = {
    ...FORM_ACTION_BUTTON_SX,
    width: { xs: '100%', sm: 'auto' },
    justifyContent: 'center',
  };

  return (
    <>
      <PillButton
        {...(dirty ? { type: 'button' as const, onClick: () => setConfirming(true) } : { href })}
        tone="primarySoftOutline"
        size="medium"
        startIcon={<ArrowBackIcon />}
        aria-label="Voltar para o perfil"
        disabled={disabled}
        sx={sx}
      >
        Voltar
      </PillButton>
      <ConfirmDialog
        open={confirming}
        title="Descartar alterações não salvas?"
        description="Você tem alterações que ainda não foram salvas. Se voltar agora, elas serão perdidas."
        cancelLabel="Continuar editando"
        confirmLabel="Descartar e voltar"
        confirmTone="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onDiscard();
          router.push(href);
        }}
      />
    </>
  );
}
