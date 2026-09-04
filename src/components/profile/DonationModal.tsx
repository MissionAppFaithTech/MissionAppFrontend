'use client';

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import type { FinancialConfigData } from '@/types/profile';
import PillButton from '@/components/common/PillButton';
import Image from 'next/image';

type DonationModalProps = {
  open: boolean;
  onClose: () => void;
  missionaryName?: string;
  isOwnProfile?: boolean;
  financialConfig?: FinancialConfigData;
};

const pixKeyTypeLabels: Record<string, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave Aleatória',
};

export default function DonationModal({
  open,
  onClose,
  missionaryName = 'Samuel Mendonça',
  isOwnProfile = false,
  financialConfig,
}: DonationModalProps) {
  const hasPix = financialConfig ? financialConfig.pix.enabled && Boolean(financialConfig.pix.key) : true;
  const hasBank = financialConfig
    ? financialConfig.bankTransfer.enabled &&
      Boolean(financialConfig.bankTransfer.bankName && financialConfig.bankTransfer.account)
    : true;

  const defaultTab = hasPix ? 'pix' : hasBank ? 'bank' : 'pix';
  const [activeTab, setActiveTab] = useState<'pix' | 'bank'>(defaultTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const supporterMessage =
    financialConfig?.supporterMessage ||
    'Sua contribuição sustenta o trabalho de evangelização, distribuição de bíblias e construção da escola cristã na África do Sul. Que Deus abençoe sua generosidade!';

  const pixKey = financialConfig?.pix.key || 'samuelhe@gmail.com';
  const pixKeyType = financialConfig?.pix.keyType || 'email';
  const pixQrCodeUrl = financialConfig?.pix.qrCodeUrl;

  const bankData = financialConfig?.bankTransfer
    ? {
        banco: financialConfig.bankTransfer.bankNumber
          ? `${financialConfig.bankTransfer.bankNumber} - ${financialConfig.bankTransfer.bankName}`
          : financialConfig.bankTransfer.bankName,
        agencia: financialConfig.bankTransfer.agency,
        conta: financialConfig.bankTransfer.account,
        tipo:
          financialConfig.bankTransfer.accountType === 'corrente'
            ? 'Conta Corrente'
            : financialConfig.bankTransfer.accountType === 'poupanca'
              ? 'Conta Poupança'
              : 'Conta de Pagamento',
        titular: financialConfig.bankTransfer.holderName || missionaryName,
        documento: financialConfig.bankTransfer.holderDocument || '123.456.789-00',
      }
    : {
        banco: '033 - Banco Santander',
        agencia: '1234',
        conta: '00123456-7',
        tipo: 'Conta Corrente',
        titular: missionaryName,
        documento: '123.456.789-00',
      };

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setToastMessage(`${label} copiado com sucesso!`);
    }
  };

  const handleCopyAllBank = () => {
    const fullText = `Dados Bancários de ${missionaryName}:
Banco: ${bankData.banco}
Agência: ${bankData.agencia}
Conta: ${bankData.conta} (${bankData.tipo})
Titular: ${bankData.titular}
CPF/CNPJ: ${bankData.documento}`;

    handleCopy(fullText, 'Dados bancários completos');
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="donation-modal-title"
        aria-describedby="donation-modal-subtitle"
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
          <Box>
            <Typography
              id="donation-modal-title"
              variant="h6"
              component="h2"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Ofertar na Missão
            </Typography>
            <Typography id="donation-modal-subtitle" variant="caption" sx={{ color: 'text.secondary' }}>
              Apoie o ministério de {missionaryName}
            </Typography>
          </Box>
          <IconButton
            aria-label="Fechar modal de doação"
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

        <DialogContent sx={{ px: 2, pb: 2, pt: 1 }}>
          <Stack spacing={2}>
            {isOwnProfile && (
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8125rem' }}>
                Você está visualizando a experiência de oferta exatamente como seus apoiadores
                verão.
              </Alert>
            )}

            <Box
              sx={{
                bgcolor: 'rgba(13, 43, 92, 0.04)',
                borderRadius: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}
              >
                Mensagem aos Apoiadores:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                &ldquo;{supporterMessage}&rdquo;
              </Typography>
            </Box>

            {/* Quando não há métodos ativos */}
            {!hasPix && !hasBank && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                O missionário ainda não concluiu a configuração de métodos de doação.
              </Alert>
            )}

            {/* Alternância de Métodos: Se ambos ativos, mostra Tabs */}
            {hasPix && hasBank && (
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="fullWidth"
                sx={{
                  minHeight: 44,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  p: 0.5,
                  '& .MuiTabs-indicator': {
                    height: '100%',
                    bgcolor: 'mission.main',
                    borderRadius: 1.5,
                    zIndex: 0,
                  },
                  '& .MuiTab-root': {
                    minHeight: 36,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    zIndex: 1,
                    color: 'text.secondary',
                    transition: 'color 0.2s ease',
                    '&.Mui-selected': {
                      color: 'common.white',
                    },
                  },
                }}
              >
                <Tab value="pix" label="Pix Simples" disableRipple />
                <Tab value="bank" label="Transferência Bancária" disableRipple />
              </Tabs>
            )}

            {/* Seção Pix */}
            {(activeTab === 'pix' && hasPix) || (!hasBank && hasPix) ? (
              <Stack spacing={2} sx={{ pt: 1, alignItems: 'center' }}>
                <Box
                  sx={{
                    bgcolor: 'common.white',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {pixQrCodeUrl ? (
                    <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                      <Image
                        src={pixQrCodeUrl}
                        alt="QR Code Pix"
                        fill
                        sizes="140px"
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  ) : (
                    <QrCode2Icon sx={{ fontSize: 130, color: 'primary.main' }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', textAlign: 'center' }}
                  >
                    Escaneie o QR Code no app do seu banco
                  </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Chave Pix ({pixKeyTypeLabels[pixKeyType] || 'E-mail'}):
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{
                      mt: 0.5,
                      bgcolor: 'background.default',
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        wordBreak: 'break-all',
                        textAlign: { xs: 'center', sm: 'left' },
                      }}
                    >
                      {pixKey}
                    </Typography>
                    <PillButton
                      tone="missionFilled"
                      size="small"
                      onClick={() => handleCopy(pixKey, 'Chave Pix')}
                      sx={{
                        minHeight: 44,
                        px: 2,
                        fontSize: '0.8125rem',
                        flexShrink: 0,
                        width: { xs: '100%', sm: 'auto' },
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      Copiar chave Pix
                    </PillButton>
                  </Stack>
                </Box>
              </Stack>
            ) : (activeTab === 'bank' && hasBank) || (!hasPix && hasBank) ? (
              <Stack spacing={1.5} sx={{ pt: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Dados da Conta para Transferência:
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    bgcolor: 'background.default',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Banco:</strong> {bankData.banco}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Agência:</strong> {bankData.agencia}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Conta:</strong> {bankData.conta} ({bankData.tipo})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Titular:</strong> {bankData.titular}
                    </Typography>
                    <Typography variant="body2">
                      <strong>CPF:</strong> {bankData.documento}
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ pt: 1 }}>
                  <PillButton
                    tone="missionFilled"
                    size="medium"
                    onClick={handleCopyAllBank}
                    sx={{ width: '100%', minHeight: 44, fontSize: '0.875rem' }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 16, mr: 0.75 }} />
                    Copiar todos os dados bancários
                  </PillButton>
                </Box>
              </Stack>
            ) : null}

            <Divider />

            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}
            >
              O pagamento ocorre de forma segura e direta fora do app, pelo seu aplicativo bancário.
            </Typography>
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
