'use client';

import { useState, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PasswordStrengthIndicator from '@/components/common/PasswordStrengthIndicator';
import PillButton from '@/components/common/PillButton';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import ThemeModeSwitch from '@/components/common/ThemeModeSwitch';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';
import CatalogLinkSection from '@/components/profile/settings/CatalogLinkSection';
import ActiveSessionsSection from '@/components/profile/settings/ActiveSessionsSection';
import { ApiError } from '@/lib/api/client';
import { validateStrongPassword } from '@/lib/passwordStrength';
import { requestPasswordReset } from '@/services/auth.service';
import {
  changeAccountEmail,
  changeAccountPassword,
  updateAbout,
  updateHeader,
} from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { clearUserStores } from '@/stores/sessionStore';

export type AccountSettingsViewProps = {
  role: 'missionary' | 'supporter';
  initialEmail?: string;
};

/** Where "Voltar" leads: the user's own profile home. */
const BACK_HREF: Record<AccountSettingsViewProps['role'], string> = {
  missionary: '/profile/sobre',
  supporter: '/profile/supporter/missionarios',
};

/** Quick-nav chips: a control edge of ≥3:1 in both themes (WCAG 1.4.11). */
const quickNavChipSx = {
  minHeight: 44,
  fontWeight: 600,
  borderWidth: '2px',
  borderColor: 'var(--mui-palette-action2-controlBorder)',
  color: 'text.primary',
  '& .MuiChip-icon': { color: 'inherit' },
} as const;

export default function AccountSettingsView({ role, initialEmail }: AccountSettingsViewProps) {
  const router = useRouter();
  // The missionary/supporter area loads the owner's profile on the server; elsewhere it is empty.
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
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{
    newEmail?: string;
    password?: string;
    form?: string;
  }>({});

  const emailDirty = newEmail !== '' || currentPasswordForEmail !== '';

  // "Cancelar" discards the block's unsaved changes and stays on the page.
  const handleCancelEmail = () => {
    setNewEmail('');
    setCurrentPasswordForEmail('');
    setShowPassword(false);
    setEmailErrors({});
  };

  // Password change form state (RF 15.2.2)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingResetLink, setSendingResetLink] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    form?: string;
  }>({});

  const passwordDirty = currentPassword !== '' || newPassword !== '' || confirmNewPassword !== '';

  const handleCancelPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setPasswordErrors({});
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
  const handleUpdateEmail = async (e: SyntheticEvent) => {
    e.preventDefault();
    const errors: { newEmail?: string; password?: string } = {};
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      errors.newEmail = 'Informe o novo endereço de e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.newEmail = 'Informe um endereço de e-mail válido.';
    } else if (trimmedEmail.toLowerCase() === currentEmail.toLowerCase()) {
      errors.newEmail = 'O novo e-mail deve ser diferente do e-mail atual.';
    }

    if (!currentPasswordForEmail) {
      errors.password = 'A senha atual é obrigatória para confirmar a alteração.';
    }

    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors);
      const firstId = errors.newEmail ? 'account-new-email' : 'account-current-password-email';
      document.getElementById(firstId)?.focus();
      return;
    }

    setEmailErrors({});
    setSavingEmail(true);
    try {
      const updatedUser = await changeAccountEmail({
        email: trimmedEmail,
        currentPassword: currentPasswordForEmail,
      });
      const resolvedEmail = updatedUser?.email || trimmedEmail;
      setCurrentEmail(resolvedEmail);
      setNewEmail('');
      setCurrentPasswordForEmail('');
      setShowPassword(false);
      notify(
        `E-mail alterado com sucesso para ${resolvedEmail}. Uma notificação de segurança foi enviada.`,
        'success'
      );
      router.refresh();
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
      if (fieldErrors.email || fieldErrors.currentPassword) {
        setEmailErrors({
          newEmail: fieldErrors.email,
          password: fieldErrors.currentPassword,
        });
        const firstId = fieldErrors.email ? 'account-new-email' : 'account-current-password-email';
        document.getElementById(firstId)?.focus();
      } else {
        const message =
          error instanceof Error ? error.message : 'Não foi possível atualizar o e-mail.';
        setEmailErrors({ form: message });
        notify(message, 'error');
      }
    } finally {
      setSavingEmail(false);
    }
  };

  // Direct password change handler (RF 15.2.2, RF 15.4)
  const handleUpdatePassword = async (e: SyntheticEvent) => {
    e.preventDefault();
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmNewPassword?: string;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = 'Informe a senha atual.';
    }

    if (!newPassword) {
      errors.newPassword = 'Informe a nova senha.';
    } else if (newPassword.length > 32) {
      errors.newPassword = 'A nova senha deve ter no máximo 32 caracteres.';
    } else {
      const strength = validateStrongPassword(newPassword);
      if (strength !== true) {
        errors.newPassword = strength;
      }
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = 'Confirme a nova senha.';
    } else if (newPassword && newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'As senhas não coincidem.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      const firstId = errors.currentPassword
        ? 'account-current-password'
        : errors.newPassword
          ? 'account-new-password'
          : 'account-confirm-password';
      document.getElementById(firstId)?.focus();
      return;
    }

    setPasswordErrors({});
    setSavingPassword(true);
    try {
      await changeAccountPassword({
        currentPassword,
        newPassword,
        newPasswordConfirmation: confirmNewPassword,
      });
      handleCancelPassword();
      clearUserStores();
      notify(
        'Senha alterada com sucesso. Uma notificação de segurança foi enviada. Entre novamente com a nova senha.',
        'success'
      );
      router.replace('/login');
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
      const nextErrors = {
        currentPassword: fieldErrors.currentPassword,
        newPassword: fieldErrors.newPassword,
        confirmNewPassword: fieldErrors.newPasswordConfirmation,
      };
      if (nextErrors.currentPassword || nextErrors.newPassword || nextErrors.confirmNewPassword) {
        setPasswordErrors(nextErrors);
        const firstId = nextErrors.currentPassword
          ? 'account-current-password'
          : nextErrors.newPassword
            ? 'account-new-password'
            : 'account-confirm-password';
        document.getElementById(firstId)?.focus();
      } else {
        const message =
          error instanceof Error ? error.message : 'Não foi possível alterar a senha.';
        setPasswordErrors({ form: message });
        notify(message, 'error');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // Password reset via secure email link handler (RF 15.2.2)
  const handleSendResetPasswordLink = async () => {
    setSendingResetLink(true);
    try {
      await requestPasswordReset({ login: currentEmail });
      notify(
        `Link seguro de redefinição de senha enviado para ${currentEmail}. Verifique sua caixa de entrada e spam.`,
        'info'
      );
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o link de redefinição de senha.',
        'error'
      );
    } finally {
      setSendingResetLink(false);
    }
  };

  // Ecclesiastical data save handler (RF 15.3)
  const handleSaveEcclesiastical = async (id: string): Promise<string> => {
    if (role === 'supporter') {
      await updateHeader({ faithCommunityId: id || null });
    } else {
      await updateAbout({ faithCommunityId: id || null });
    }
    notify('Dados eclesiásticos atualizados com sucesso!', 'success');
    router.refresh();
    return id;
  };

  // Missionary agency save handler (RF 3.1.2)
  const handleSaveAgency = async (id: string): Promise<string> => {
    await updateAbout({ missionaryAgencyId: id });
    notify('Agência missionária atualizada com sucesso!', 'success');
    router.refresh();
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
            variant="outlined"
            sx={quickNavChipSx}
          />
          <Chip
            icon={<LockOutlinedIcon fontSize="small" />}
            label="Credenciais"
            clickable
            onClick={() => handleScrollTo('credentials-section')}
            variant="outlined"
            sx={quickNavChipSx}
          />
          <Chip
            icon={<ChurchOutlinedIcon fontSize="small" />}
            label="Dados Eclesiásticos"
            clickable
            onClick={() => handleScrollTo('ecclesiastical-section')}
            variant="outlined"
            sx={quickNavChipSx}
          />
          {role === 'missionary' && (
            <Chip
              icon={<BusinessOutlinedIcon fontSize="small" />}
              label="Agência Missionária"
              clickable
              onClick={() => handleScrollTo('agency-section')}
              variant="outlined"
              sx={quickNavChipSx}
            />
          )}
          <Chip
            icon={<WarningAmberOutlinedIcon fontSize="small" color="error" />}
            label="Zona de Perigo"
            clickable
            onClick={() => handleScrollTo('danger-section')}
            // Red icon + text label; red text on the chip fill was 3.86:1.
            variant="outlined"
            sx={quickNavChipSx}
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
              <Box
                component="form"
                aria-labelledby="email-change-heading"
                onSubmit={handleUpdateEmail}
                noValidate
                aria-busy={savingEmail || undefined}
              >
                <Typography
                  id="email-change-heading"
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  Alteração de E-mail de Login
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  E-mail atual cadastrado: <strong>{currentEmail}</strong>. Por motivos de
                  segurança, a alteração exige a confirmação da sua senha atual.
                </Typography>

                <Stack spacing={2.5}>
                  {emailErrors.form ? (
                    <Alert severity="error" role="alert">
                      {emailErrors.form}
                    </Alert>
                  ) : null}

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
                    slotProps={{
                      htmlInput: {
                        autoCapitalize: 'none',
                        autoCorrect: 'off',
                        spellCheck: false,
                      },
                    }}
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
                      htmlInput: {
                        spellCheck: false,
                      },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ minWidth: 44, minHeight: 44 }}
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
                      disabled={!emailDirty || savingEmail}
                      aria-label="Cancelar alteração de e-mail"
                    >
                      Cancelar
                    </PillButton>
                    <PillButton
                      type="submit"
                      tone="primaryFilled"
                      size="small"
                      loading={savingEmail}
                    >
                      Atualizar E-mail
                    </PillButton>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* 1.2 Redefinição de Senha (RF 15.2.2) */}
              <Stack spacing={3}>
                <Box
                  component="form"
                  aria-labelledby="password-change-heading"
                  onSubmit={handleUpdatePassword}
                  noValidate
                  aria-busy={savingPassword || undefined}
                >
                  <Typography
                    id="password-change-heading"
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    Redefinição de Senha
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Altere sua senha informando a senha atual, ou solicite abaixo um link seguro de
                    redefinição para o seu e-mail cadastrado (<strong>{currentEmail}</strong>).
                  </Typography>

                  <Stack spacing={2.5}>
                    {passwordErrors.form ? (
                      <Alert severity="error" role="alert">
                        {passwordErrors.form}
                      </Alert>
                    ) : null}

                    <TextField
                      id="account-current-password"
                      label="Senha Atual"
                      type={showCurrentPassword ? 'text' : 'password'}
                      size="small"
                      fullWidth
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      error={Boolean(passwordErrors.currentPassword)}
                      helperText={passwordErrors.currentPassword}
                      autoComplete="current-password"
                      slotProps={{
                        htmlInput: {
                          spellCheck: false,
                        },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showCurrentPassword ? 'Ocultar senha atual' : 'Exibir senha atual'
                                }
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                                size="small"
                                sx={{ minWidth: 44, minHeight: 44 }}
                              >
                                {showCurrentPassword ? (
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

                    <TextField
                      id="account-new-password"
                      label="Nova Senha"
                      type={showNewPassword ? 'text' : 'password'}
                      size="small"
                      fullWidth
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={Boolean(passwordErrors.newPassword)}
                      helperText={passwordErrors.newPassword}
                      autoComplete="new-password"
                      slotProps={{
                        htmlInput: {
                          spellCheck: false,
                        },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showNewPassword ? 'Ocultar nova senha' : 'Exibir nova senha'
                                }
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                                size="small"
                                sx={{ minWidth: 44, minHeight: 44 }}
                              >
                                {showNewPassword ? (
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

                    <PasswordStrengthIndicator password={newPassword} />

                    <TextField
                      id="account-confirm-password"
                      label="Confirmar Nova Senha"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      size="small"
                      fullWidth
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      error={Boolean(passwordErrors.confirmNewPassword)}
                      helperText={passwordErrors.confirmNewPassword}
                      autoComplete="new-password"
                      slotProps={{
                        htmlInput: {
                          spellCheck: false,
                        },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showConfirmNewPassword
                                    ? 'Ocultar confirmação da nova senha'
                                    : 'Exibir confirmação da nova senha'
                                }
                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                edge="end"
                                size="small"
                                sx={{ minWidth: 44, minHeight: 44 }}
                              >
                                {showConfirmNewPassword ? (
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
                        onClick={handleCancelPassword}
                        disabled={!passwordDirty || savingPassword}
                        aria-label="Cancelar alteração de senha"
                      >
                        Cancelar
                      </PillButton>
                      <PillButton
                        type="submit"
                        tone="primaryFilled"
                        size="small"
                        loading={savingPassword}
                      >
                        Alterar Senha
                      </PillButton>
                    </Stack>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Prefere redefinir via e-mail seguro?
                  </Typography>
                  <PillButton
                    type="button"
                    tone="primarySoftOutline"
                    size="small"
                    startIcon={<EmailOutlinedIcon />}
                    onClick={handleSendResetPasswordLink}
                    loading={sendingResetLink}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minHeight: 44,
                      justifyContent: 'center',
                    }}
                  >
                    Enviar link de redefinição para meu e-mail
                  </PillButton>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* 2. DADOS ECLESIÁSTICOS (RF 15.3) */}
        <CatalogLinkSection
          id="ecclesiastical-section"
          kind="faithCommunities"
          icon={<ChurchOutlinedIcon color="primary" />}
          title="Dados Eclesiásticos"
          subheader="Escolha ou edite os dados da sua Comunidade de Fé (Igreja) na plataforma"
          selectLabel={
            role === 'supporter'
              ? 'Comunidade de Fé (Igreja) (opcional)'
              : 'Comunidade de Fé (Igreja)'
          }
          hint="Digite o nome para buscar. Não encontrou a sua? Escolha “Adicionar Comunidade de Fé” para cadastrá-la com o pastor responsável. Você também pode editar os dados da comunidade selecionada ou limpar o campo para desvincular."
          saveLabel="Salvar Dados Eclesiásticos"
          cancelLabel="Cancelar alterações dos dados eclesiásticos"
          savedId={owner.about.faithCommunityId}
          savedName={owner.about.faithCommunity}
          onSave={handleSaveEcclesiastical}
          onCommunityUpdated={() => {
            notify('Dados da comunidade de fé atualizados com sucesso!', 'success');
            router.refresh();
          }}
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
                  <PillButton
                    tone="dangerOutline"
                    sx={{ minHeight: 44, px: 2.5 }}
                    onClick={() => setIsDeactivateDialogOpen(true)}
                  >
                    Desativar Conta de Missionário
                  </PillButton>
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
                  <PillButton
                    tone="dangerOutline"
                    sx={{ minHeight: 44, px: 2.5 }}
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Excluir Conta Definitivamente
                  </PillButton>
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
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1.5,
            // NOTE: stacked full width on phones (AGENTS.md), side by side from sm up
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > *': { width: { xs: '100%', sm: 'auto' }, m: '0 !important' },
          }}
        >
          <PillButton
            onClick={() => setIsDeactivateDialogOpen(false)}
            tone="primaryOutline"
            sx={{ minHeight: 44, px: 2.5 }}
          >
            Cancelar
          </PillButton>
          <PillButton
            onClick={handleConfirmDeactivateAccount}
            tone="danger"
            autoFocus
            sx={{ minHeight: 44, px: 2.5, fontWeight: 700 }}
          >
            Confirmar Desativação (Soft Delete)
          </PillButton>
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
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1.5,
            // NOTE: stacked full width on phones (AGENTS.md), side by side from sm up
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > *': { width: { xs: '100%', sm: 'auto' }, m: '0 !important' },
          }}
        >
          <PillButton
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setDeleteConfirmationText('');
            }}
            tone="primaryOutline"
            sx={{ minHeight: 44, px: 2.5 }}
          >
            Cancelar
          </PillButton>
          <PillButton
            onClick={handleConfirmDeleteAccount}
            tone="danger"
            disabled={deleteConfirmationText.trim() !== 'EXCLUIR'}
            sx={{ minHeight: 44, px: 2.5, fontWeight: 700 }}
          >
            Excluir Conta Definitivamente
          </PillButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
