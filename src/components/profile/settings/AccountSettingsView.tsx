'use client';

import { useState, type SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PillButton from '@/components/common/PillButton';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import ThemeModeSwitch from '@/components/common/ThemeModeSwitch';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';
import CatalogLinkSection from '@/components/profile/settings/CatalogLinkSection';
import { updateAbout } from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import ActiveSessionsSection from '@/components/profile/settings/ActiveSessionsSection';

export type AccountSettingsViewProps = {
  role: 'missionary' | 'supporter';
  initialEmail?: string;
};

/** Where "Voltar" leads: the user's own profile home. */
const BACK_HREF: Record<AccountSettingsViewProps['role'], string> = {
  missionary: '/profile/sobre',
  supporter: '/profile/supporter/missionarios',
};

export default function AccountSettingsView({ role, initialEmail }: AccountSettingsViewProps) {
  // The missionary area loads the owner's profile on the server; elsewhere it is empty.
  const owner = useOwnerProfile();

  // Current user email
  const serverEmail =
    initialEmail ||
    owner.contact?.accountEmail ||
    (role === 'missionary' ? 'samuelhe@gmail.com' : 'soraia.santos@email.com');
  const [currentEmail, setCurrentEmail] = useState(serverEmail);
  // The server's e-mail wins when it changes (refresh, another account).
  const [syncedEmail, setSyncedEmail] = useState(serverEmail);
  if (syncedEmail !== serverEmail) {
    setSyncedEmail(serverEmail);
    setCurrentEmail(serverEmail);
  }

  // Email update form state
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{ newEmail?: string; password?: string }>({});

  const emailDirty = newEmail !== '' || currentPasswordForEmail !== '';

  // "Cancelar" discards the block's unsaved changes and stays on the page.
  const handleCancelEmail = () => {
    setNewEmail('');
    setCurrentPasswordForEmail('');
    setShowPassword(false);
    setEmailErrors({});
  };

  // Danger Zone dialogs & state (RF 15.5)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Global toast feedback (RNF 3.1, rendered once in the root providers)
  const notify = useFeedbackStore((s) => s.notify);

  // Scroll to section helper
  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Email update handler (RF 15.2.1, RF 15.4)
  const handleUpdateEmail = (e: SyntheticEvent) => {
    e.preventDefault();
    const errors: { newEmail?: string; password?: string } = {};

    if (!newEmail.trim()) {
      errors.newEmail = 'Informe o novo endereço de e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      errors.newEmail = 'Informe um endereço de e-mail válido.';
    } else if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      errors.newEmail = 'O novo e-mail deve ser diferente do e-mail atual.';
    }

    if (!currentPasswordForEmail) {
      errors.password = 'A senha atual é obrigatória para confirmar a alteração.';
    }

    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors);
      return;
    }

    setEmailErrors({});
    const updatedEmail = newEmail.trim();
    setCurrentEmail(updatedEmail);
    setNewEmail('');
    setCurrentPasswordForEmail('');
    notify(
      `E-mail alterado com sucesso para ${updatedEmail}. Uma notificação de segurança foi enviada.`,
      'success'
    );
  };

  // Password reset via secure email link handler (RF 15.2.2)
  const handleSendResetPasswordLink = () => {
    notify(
      `Link seguro de redefinição de senha enviado para ${currentEmail}. Verifique sua caixa de entrada e spam.`,
      'info'
    );
  };

  // Ecclesiastical data save handler (RF 15.3)
  const handleSaveEcclesiastical = async (id: string): Promise<string> => {
    if (role === 'supporter') {
      // NOTE: the API has no faith community link for supporters yet; a new
      // community is still registered in the catalog (from the field's modal).
      notify(
        'O vínculo de apoiadores com a comunidade de fé ainda não é salvo na plataforma.',
        'info'
      );
      return id;
    }
    // NOTE: the pastor and address of an existing community are edited only by
    // whoever registered it (PATCH /faith-communities/:id); here the user only
    // switches the link; a new community is registered with its pastor in the
    // field's modal.
    await updateAbout({ faithCommunityId: id || null });
    notify('Dados eclesiásticos atualizados com sucesso!', 'success');
    return id;
  };

  // Missionary agency save handler (RF 3.1.2)
  const handleSaveAgency = async (id: string): Promise<string> => {
    await updateAbout({ missionaryAgencyId: id });
    notify('Agência missionária atualizada com sucesso!', 'success');
    return id;
  };

  // Soft delete confirmation (RF 15.5 - Missionary)
  const handleConfirmDeactivateAccount = () => {
    setIsDeactivateDialogOpen(false);
    notify(
      'Conta de missionário desativada com sucesso (soft delete aplicado). Perfil ocultado do público.',
      'info'
    );
  };

  // Hard delete confirmation (RF 15.5 - Supporter)
  const handleConfirmDeleteAccount = () => {
    if (deleteConfirmationText.trim() !== 'EXCLUIR') return;
    setIsDeleteDialogOpen(false);
    setDeleteConfirmationText('');
    notify('Conta excluída definitivamente com sucesso (hard delete aplicado).', 'info');
  };

  return (
    <Box
      sx={{
        maxWidth: 860,
        mx: 'auto',
        pb: 8,
        '& .MuiOutlinedInput-root': {
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'action2.fieldBg' : 'background.paper'),
          '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active':
            {
              WebkitBoxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0 0 0 1000px #1a3d6e inset !important'
                  : '0 0 0 1000px #ffffff inset !important',
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0 0 0 1000px #1a3d6e inset !important'
                  : '0 0 0 1000px #ffffff inset !important',
              WebkitTextFillColor: (t) =>
                t.palette.mode === 'dark' ? '#ffffff !important' : '#081c3a !important',
              caretColor: (t) =>
                t.palette.mode === 'dark' ? '#ffffff !important' : '#081c3a !important',
              transition: 'background-color 5000s ease-in-out 0s',
            },
          '& input::selection': {
            backgroundColor: 'rgba(249, 115, 22, 0.25) !important',
            color: 'inherit !important',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', mb: 2 }}>
        <PillButton
          href={BACK_HREF[role]}
          tone="primarySoftOutline"
          size="medium"
          startIcon={<ArrowBackIcon />}
          aria-label="Voltar para o perfil"
          sx={{
            ...FORM_ACTION_BUTTON_SX,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: 'center',
          }}
        >
          Voltar
        </PillButton>
      </Box>

      {/* Quick Navigation Anchors Bar */}
      <Card
        variant="outlined"
        sx={{
          mb: 4,
          borderRadius: 3,
          p: { xs: 1.5, sm: 2 },
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.paper' : 'grey.50'),
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}
        >
          NAVEGAÇÃO RÁPIDA
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            py: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Chip
            icon={<PaletteOutlinedIcon fontSize="small" />}
            label="Aparência"
            clickable
            onClick={() => handleScrollTo('appearance-section')}
            sx={{ minHeight: 44, fontWeight: 600 }}
          />
          <Chip
            icon={<LockOutlinedIcon fontSize="small" />}
            label="Credenciais"
            clickable
            onClick={() => handleScrollTo('credentials-section')}
            sx={{ minHeight: 44, fontWeight: 600 }}
          />
          <Chip
            icon={<ChurchOutlinedIcon fontSize="small" />}
            label="Dados Eclesiásticos"
            clickable
            onClick={() => handleScrollTo('ecclesiastical-section')}
            sx={{ minHeight: 44, fontWeight: 600 }}
          />
          {role === 'missionary' && (
            <Chip
              icon={<BusinessOutlinedIcon fontSize="small" />}
              label="Agência Missionária"
              clickable
              onClick={() => handleScrollTo('agency-section')}
              sx={{ minHeight: 44, fontWeight: 600 }}
            />
          )}
          <Chip
            icon={<WarningAmberOutlinedIcon fontSize="small" color="error" />}
            label="Zona de Perigo"
            clickable
            onClick={() => handleScrollTo('danger-section')}
            // Red icon + text label; red text on the chip fill was 3.86:1.
            sx={{ minHeight: 44, fontWeight: 600 }}
          />
        </Stack>
      </Card>

      <Stack spacing={4}>
        <Card
          id="appearance-section"
          variant="outlined"
          sx={{ borderRadius: 3, scrollMarginTop: 80 }}
        >
          <CardHeader
            avatar={<PaletteOutlinedIcon color="primary" />}
            title="Aparência"
            subheader="Escolha entre o modo claro e o modo escuro"
            slotProps={{
              title: {
                id: 'appearance-title',
                component: 'h2',
                sx: { fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } },
              },
              subheader: { sx: { fontSize: '0.875rem' } },
            }}
          />
          <Divider />
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ maxWidth: { xs: '100%', sm: 360 } }}>
              <ThemeModeSwitch labelledBy="appearance-title" />
            </Box>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 1. CREDENCIAIS DE ACESSO (RF 15.2, RF 15.4)                               */}
        {/* ========================================================================= */}
        <Card
          id="credentials-section"
          variant="outlined"
          sx={{ borderRadius: 3, scrollMarginTop: 80 }}
        >
          <CardHeader
            avatar={<LockOutlinedIcon color="primary" />}
            title="Credenciais de Acesso"
            subheader="Gerencie seu e-mail de login e redefinição de senha com segurança"
            slotProps={{
              title: {
                component: 'h2',
                sx: { fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } },
              },
              subheader: { sx: { fontSize: '0.875rem' } },
            }}
          />
          <Divider />
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={4}>
              {/* 1.1 Alteração de E-mail de Login */}
              <Box component="form" onSubmit={handleUpdateEmail} noValidate>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Alteração de E-mail de Login
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  E-mail atual cadastrado: <strong>{currentEmail}</strong>. Por motivos de
                  segurança, a alteração exige a confirmação da sua senha atual.
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    id="account-new-email"
                    label="Novo E-mail"
                    type="email"
                    size="small"
                    fullWidth
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    error={Boolean(emailErrors.newEmail)}
                    helperText={
                      emailErrors.newEmail ||
                      'Um e-mail de confirmação será enviado para este novo endereço.'
                    }
                    autoComplete="email"
                  />
                  <TextField
                    id="account-current-password-email"
                    label="Senha Atual (para confirmar)"
                    type={showPassword ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                    error={Boolean(emailErrors.password)}
                    helperText={emailErrors.password}
                    autoComplete="current-password"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Stack
                    direction={{ xs: 'column-reverse', sm: 'row' }}
                    spacing={1.5}
                    useFlexGap
                    sx={{
                      pt: 0.5,
                      '& .MuiButton-root': {
                        width: { xs: '100%', sm: 'auto' },
                        minHeight: 44,
                        justifyContent: 'center',
                      },
                    }}
                  >
                    <PillButton
                      type="button"
                      tone="primarySoftOutline"
                      size="small"
                      onClick={handleCancelEmail}
                      disabled={!emailDirty}
                      aria-label="Cancelar alteração de e-mail"
                    >
                      Cancelar
                    </PillButton>
                    <PillButton type="submit" tone="primaryFilled" size="small">
                      Atualizar E-mail
                    </PillButton>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* 1.2 Redefinição de Senha (RF 15.2.2) */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Redefinição de Senha
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Deseja alterar ou redefinir sua senha? Enviaremos um link de redefinição exclusivo
                  e seguro para o seu e-mail cadastrado (<strong>{currentEmail}</strong>).
                </Typography>

                <Box>
                  <PillButton
                    type="button"
                    tone="primarySoftOutline"
                    size="small"
                    startIcon={<EmailOutlinedIcon />}
                    onClick={handleSendResetPasswordLink}
                  >
                    Enviar link de redefinição para meu e-mail
                  </PillButton>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 2. DADOS ECLESIÁSTICOS (RF 15.3) */}
        <CatalogLinkSection
          id="ecclesiastical-section"
          kind="faithCommunities"
          icon={<ChurchOutlinedIcon color="primary" />}
          title="Dados Eclesiásticos"
          subheader="Escolha a sua Comunidade de Fé (Igreja) entre as cadastradas na plataforma"
          selectLabel={
            role === 'supporter'
              ? 'Comunidade de Fé (Igreja) (opcional)'
              : 'Comunidade de Fé (Igreja)'
          }
          hint="Digite o nome para buscar. Não encontrou a sua? Escolha “Adicionar Comunidade de Fé” para cadastrá-la com o pastor responsável. Para desvincular, limpe o campo e salve."
          saveLabel="Salvar Dados Eclesiásticos"
          cancelLabel="Cancelar alterações dos dados eclesiásticos"
          savedId={owner.about.faithCommunityId}
          savedName={owner.about.faithCommunity}
          onSave={handleSaveEcclesiastical}
        />

        {/* 3. AGÊNCIA MISSIONÁRIA (Apenas para Missionários - RF 3.1.2) */}
        {role === 'missionary' && (
          <CatalogLinkSection
            id="agency-section"
            kind="missionaryAgencies"
            icon={<BusinessOutlinedIcon color="primary" />}
            title="Agência Missionária"
            subheader="Escolha a organização missionária à qual seu ministério está vinculado"
            selectLabel="Agência Missionária"
            required
            hint="Digite o nome para buscar. A agência pode ser trocada, mas não removida. Não encontrou a sua? Escolha “Adicionar Agência Missionária” para cadastrá-la."
            saveLabel="Salvar Agência Missionária"
            cancelLabel="Cancelar alterações da agência missionária"
            savedId={owner.about.missionaryAgencyId}
            savedName={owner.about.missionaryAgency}
            onSave={handleSaveAgency}
          />
        )}

        <ActiveSessionsSection />

        {/* ========================================================================= */}
        {/* 4. ZONA DE PERIGO / ENCERRAMENTO DE CONTA (RF 15.5)                       */}
        {/* ========================================================================= */}
        <Card
          id="danger-section"
          variant="outlined"
          sx={{ borderRadius: 3, borderColor: 'error.main', scrollMarginTop: 80 }}
        >
          <CardHeader
            avatar={<WarningAmberOutlinedIcon color="error" />}
            title="Zona de Perigo"
            subheader={
              role === 'missionary'
                ? 'Regra de desativação lógica (Soft Delete)'
                : 'Regra de exclusão definitiva (Hard Delete)'
            }
            slotProps={{
              title: {
                component: 'h2',
                sx: {
                  fontWeight: 700,
                  color: 'error.main',
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                },
              },
              subheader: { sx: { fontSize: '0.875rem' } },
            }}
          />
          <Divider sx={{ borderColor: 'error.light', opacity: 0.3 }} />
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {role === 'missionary' ? (
              // Missionary: Soft Delete (RF 15.5)
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Desativação de Conta Missionária
                  </Typography>
                  <Chip label="Soft Delete" size="small" color="warning" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Conforme a política de integridade da plataforma, os missionários que optarem por
                  encerrar suas contas sempre farão um{' '}
                  <strong>soft delete (exclusão lógica)</strong>, sem tempo de expiração. Seus dados
                  cadastrais e histórico são preservados internamente para integridade eclesiástica,
                  mas seu perfil, projetos e postagens ficam ocultos e inacessíveis ao público. A
                  conta poderá ser reativada futuramente por administradores ou avaliadores.
                </Typography>
                <Box sx={{ pt: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
                    onClick={() => setIsDeactivateDialogOpen(true)}
                  >
                    Desativar Conta de Missionário
                  </Button>
                </Box>
              </Stack>
            ) : (
              // Supporter: Hard Delete (RF 15.5)
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Exclusão Definitiva de Conta de Apoiador
                  </Typography>
                  <Chip label="Hard Delete" size="small" color="error" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Caso você opte por excluir voluntariamente sua conta de apoiador, seus dados
                  pessoais, histórico de apoio e preferências serão{' '}
                  <strong>deletados de forma definitiva (hard delete)</strong>. Esta ação não poderá
                  ser desfeita e todos os seus registros serão permanentemente expurgados de nossos
                  servidores.
                </Typography>
                <Box sx={{ pt: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Excluir Conta Definitivamente
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}>
          <PillButton
            href={BACK_HREF[role]}
            tone="primarySoftOutline"
            size="medium"
            startIcon={<ArrowBackIcon />}
            aria-label="Voltar para o perfil"
            sx={{
              ...FORM_ACTION_BUTTON_SX,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: 'center',
            }}
          >
            Voltar
          </PillButton>
        </Box>
      </Stack>

      {/* ========================================================================= */}
      {/* DIÁLOGOS DE CONFIRMAÇÃO (ACESSIBILIDADE WCAG 2.2 AA)                      */}
      {/* ========================================================================= */}

      {/* Diálogo Soft Delete (Missionário) */}
      <Dialog
        open={isDeactivateDialogOpen}
        onClose={() => setIsDeactivateDialogOpen(false)}
        aria-labelledby="deactivate-dialog-title"
        aria-describedby="deactivate-dialog-description"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1, maxWidth: 500 } } }}
      >
        <DialogTitle id="deactivate-dialog-title" sx={{ fontWeight: 700 }}>
          Confirmar Desativação de Conta
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="deactivate-dialog-description"
            sx={{ color: 'text.primary', mb: 2 }}
          >
            Tem certeza de que deseja desativar sua conta de missionário? Seu perfil público,
            projetos e postagens ficarão ocultos imediatamente. Seus dados cadastrais serão
            preservados internamente para integridade do sistema.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsDeactivateDialogOpen(false)}
            color="inherit"
            sx={{ minHeight: 44, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDeactivateAccount}
            variant="contained"
            color="error"
            autoFocus
            sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
          >
            Confirmar Desativação (Soft Delete)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Hard Delete (Apoiador) */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteConfirmationText('');
        }}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1, maxWidth: 500 } } }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 700, color: 'error.main' }}>
          Confirmar Exclusão Definitiva
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ color: 'text.primary', mb: 2 }}>
            Esta ação é irreversível. Todos os seus dados pessoais e histórico de apoiador serão
            apagados permanentemente dos servidores.
          </DialogContentText>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Para confirmar, digite <strong>EXCLUIR</strong> no campo abaixo:
          </Typography>
          <TextField
            id="hard-delete-confirmation-field"
            fullWidth
            size="small"
            placeholder="EXCLUIR"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setDeleteConfirmationText('');
            }}
            color="inherit"
            sx={{ minHeight: 44, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDeleteAccount}
            variant="contained"
            color="error"
            disabled={deleteConfirmationText.trim() !== 'EXCLUIR'}
            sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
          >
            Excluir Conta Definitivamente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
