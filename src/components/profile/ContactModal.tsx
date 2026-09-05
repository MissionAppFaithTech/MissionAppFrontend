'use client';

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import type { ProfileContactData } from '@/types/profile';

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  contact?: ProfileContactData;
  isOwnProfile?: boolean;
};

export default function ContactModal({
  open,
  onClose,
  contact = {
    publicEmail: 'samuelhe@gmail.com',
    publicPhone: '+55 (21) 98765-4321',
    whatsappNumber: '+5521987654321',
  },
  isOwnProfile = false,
}: ContactModalProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setToastMessage(`${label} copiado para a área de transferência!`);
    }
  };

  const cleanPhone = contact.whatsappNumber || contact.publicPhone.replace(/\D/g, '');
  const waLink = `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone}`;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby="contact-modal-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 2.5, sm: 3 },
              p: { xs: 1, sm: 1.5 },
              m: { xs: 1.5, sm: 2 },
              width: { xs: 'calc(100% - 24px)', sm: 'auto' },
              boxShadow: '0 8px 30px rgba(13, 43, 92, 0.18)',
            },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
            pt: 1.5,
            px: 2,
          }}
        >
          <Typography
            id="contact-modal-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            Contato
          </Typography>
          <IconButton
            aria-label="Fechar modal de contato"
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Stack spacing={2.5}>
            {/* Opção WhatsApp */}
            <Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(37, 211, 102, 0.12)',
                    color: '#25D366',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    WhatsApp
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      wordBreak: 'break-word',
                    }}
                  >
                    {contact.publicPhone}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ pl: { xs: 0, sm: 5.5 } }}>
                <PillButton
                  tone="primarySoftOutline"
                  size="small"
                  onClick={() => handleCopy(contact.publicPhone, 'Telefone')}
                  sx={{
                    minHeight: 44,
                    px: 2,
                    fontSize: '0.8125rem',
                    flex: { xs: 1, sm: 'initial' },
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16, mr: 0.75 }} />
                  Copiar
                </PillButton>
                <PillButton
                  tone="missionFilled"
                  size="small"
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    minHeight: 44,
                    px: 2,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#FFFFFF !important',
                    bgcolor: '#9A3412',
                    '&:hover': { bgcolor: '#7C2D12' },
                    flex: { xs: 1, sm: 'initial' },
                  }}
                >
                  Conversar
                </PillButton>
              </Stack>
            </Box>

            <Divider />

            {/* Opção E-mail */}
            <Box>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(13, 43, 92, 0.08)',
                    color: 'primary.main',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    E-mail público
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      wordBreak: 'break-all',
                    }}
                  >
                    {contact.publicEmail}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ pl: { xs: 0, sm: 5.5 } }}>
                <PillButton
                  tone="primarySoftOutline"
                  size="small"
                  onClick={() => handleCopy(contact.publicEmail, 'E-mail')}
                  sx={{
                    minHeight: 44,
                    px: 2,
                    fontSize: '0.8125rem',
                    flex: { xs: 1, sm: 'initial' },
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16, mr: 0.75 }} />
                  Copiar
                </PillButton>
              </Stack>
            </Box>

            {/* Se for o próprio missionário dono da conta */}
            {isOwnProfile && (
              <>
                <Divider />
                <Box sx={{ textAlign: 'center', pt: 0.5 }}>
                  <PillButton
                    href="/profile/edit-profile"
                    tone="primarySoftOutline"
                    size="small"
                    onClick={onClose}
                    sx={{ width: '100%', minHeight: 44, fontSize: '0.8125rem' }}
                  >
                    Editar contatos públicos
                  </PillButton>
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          variant="filled"
          role="status"
          aria-live="polite"
          sx={{
            bgcolor: 'primary.main',
            color: 'common.white',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              color: 'common.white',
            },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
