'use client';

import { useState, type FormEvent } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PillButton from '@/components/common/PillButton';
import { mockFaithCommunities, mockMissionaryAgencies } from '@/mocks/ecclesiastical';
import type { FaithCommunityData, MissionaryAgencyData } from '@/types/account';

export type AccountSettingsViewProps = {
  role: 'missionary' | 'supporter';
  initialEmail?: string;
  initialFaithCommunity?: Partial<FaithCommunityData>;
  initialAgency?: Partial<MissionaryAgencyData>;
};

export default function AccountSettingsView({
  role,
  initialEmail,
  initialFaithCommunity,
  initialAgency,
}: AccountSettingsViewProps) {
  // Current user email
  const [currentEmail, setCurrentEmail] = useState(
    initialEmail || (role === 'missionary' ? 'samuelhe@gmail.com' : 'soraia.santos@email.com')
  );

  // Email update form state
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{ newEmail?: string; password?: string }>({});

  // Faith Community Form State (RF 15.3)
  const [faithCommunity, setFaithCommunity] = useState<FaithCommunityData>({
    name: initialFaithCommunity?.name || (role === 'missionary' ? 'Igreja Batista Central' : ''),
    address1: initialFaithCommunity?.address1 || (role === 'missionary' ? 'Av. Brasil, 1500' : ''),
    address2: initialFaithCommunity?.address2 || (role === 'missionary' ? 'Bairro Centro' : ''),
    country: initialFaithCommunity?.country || (role === 'missionary' ? 'Brasil' : ''),
    state: initialFaithCommunity?.state || (role === 'missionary' ? 'RJ' : ''),
    city: initialFaithCommunity?.city || (role === 'missionary' ? 'Rio de Janeiro' : ''),
    zipCode: initialFaithCommunity?.zipCode || (role === 'missionary' ? '20040-002' : ''),
    website:
      initialFaithCommunity?.website || (role === 'missionary' ? 'https://ibcentral.org.br' : ''),
    churchPhone:
      initialFaithCommunity?.churchPhone || (role === 'missionary' ? '+55 (21) 3214-5500' : ''),
    pastorName:
      initialFaithCommunity?.pastorName ||
      (role === 'missionary' ? 'Pr. Carlos Alberto Santos' : ''),
    pastorPhone:
      initialFaithCommunity?.pastorPhone || (role === 'missionary' ? '+55 (21) 99876-1234' : ''),
  });
  const [ecclesiasticalError, setEcclesiasticalError] = useState<string | null>(null);

  // Missionary Agency Form State (RF 3.1.2, only for missionaries)
  const [agency, setAgency] = useState<MissionaryAgencyData>({
    name: initialAgency?.name || (role === 'missionary' ? 'JOCUM (Jovens com uma Missão)' : ''),
    address1: initialAgency?.address1 || (role === 'missionary' ? 'Estrada da Missão, 100' : ''),
    address2: initialAgency?.address2 || (role === 'missionary' ? 'Base Missionária' : ''),
    country: initialAgency?.country || (role === 'missionary' ? 'Brasil' : ''),
    state: initialAgency?.state || (role === 'missionary' ? 'PR' : ''),
    city: initialAgency?.city || (role === 'missionary' ? 'Curitiba' : ''),
    zipCode: initialAgency?.zipCode || (role === 'missionary' ? '80010-000' : ''),
    website: initialAgency?.website || (role === 'missionary' ? 'https://jocum.org.br' : ''),
    phone: initialAgency?.phone || (role === 'missionary' ? '+55 (41) 3657-2200' : ''),
  });
  const [agencyError, setAgencyError] = useState<string | null>(null);

  // Danger Zone dialogs & state (RF 15.5)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Toast notification state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Scroll to section helper
  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Email update handler (RF 15.2.1, RF 15.4)
  const handleUpdateEmail = (e: FormEvent) => {
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
    showToast(
      `E-mail alterado com sucesso para ${updatedEmail}. Uma notificação de segurança foi enviada.`,
      'success'
    );
  };

  // Password reset via secure email link handler (RF 15.2.2)
  const handleSendResetPasswordLink = () => {
    showToast(
      `Link seguro de redefinição de senha enviado para ${currentEmail}. Verifique sua caixa de entrada e spam.`,
      'info'
    );
  };

  // Ecclesiastical data save handler (RF 15.3)
  const handleSaveEcclesiastical = (e: FormEvent) => {
    e.preventDefault();

    if (role === 'missionary' && !faithCommunity.name.trim()) {
      setEcclesiasticalError('O nome da comunidade de fé é obrigatório para missionários.');
      return;
    }

    setEcclesiasticalError(null);
    showToast(
      'Dados eclesiásticos atualizados com sucesso! Alterações salvas na plataforma.',
      'success'
    );
  };

  // Clear faith community data (for supporters)
  const handleClearFaithCommunity = () => {
    setFaithCommunity({
      name: '',
      address1: '',
      address2: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      website: '',
      churchPhone: '',
      pastorName: '',
      pastorPhone: '',
    });
    setEcclesiasticalError(null);
    showToast('Vínculo com comunidade de fé removido.', 'info');
  };

  // Select existing faith community from autocomplete
  const handleSelectFaithCommunity = (selectedCommunity: FaithCommunityData | null) => {
    if (selectedCommunity) {
      setFaithCommunity({ ...selectedCommunity });
      setEcclesiasticalError(null);
    }
  };

  // Missionary agency save handler (RF 3.1.2)
  const handleSaveAgency = (e: FormEvent) => {
    e.preventDefault();

    if (!agency.name.trim()) {
      setAgencyError('O nome da agência missionária é obrigatório.');
      return;
    }

    setAgencyError(null);
    showToast('Dados da agência missionária atualizados com sucesso!', 'success');
  };

  // Select existing agency from autocomplete
  const handleSelectAgency = (selectedAgency: MissionaryAgencyData | null) => {
    if (selectedAgency) {
      setAgency({ ...selectedAgency });
      setAgencyError(null);
    }
  };

  // Soft delete confirmation (RF 15.5 - Missionary)
  const handleConfirmDeactivateAccount = () => {
    setIsDeactivateDialogOpen(false);
    showToast(
      'Conta de missionário desativada com sucesso (soft delete aplicado). Perfil ocultado do público.',
      'info'
    );
  };

  // Hard delete confirmation (RF 15.5 - Supporter)
  const handleConfirmDeleteAccount = () => {
    if (deleteConfirmationText.trim() !== 'EXCLUIR') return;
    setIsDeleteDialogOpen(false);
    setDeleteConfirmationText('');
    showToast('Conta excluída definitivamente com sucesso (hard delete aplicado).', 'info');
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
                  ? '0 0 0 1000px #1c1c1c inset !important'
                  : '0 0 0 1000px #ffffff inset !important',
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0 0 0 1000px #1c1c1c inset !important'
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
            icon={<LockOutlinedIcon fontSize="small" />}
            label="Credenciais"
            clickable
            onClick={() => handleScrollTo('credentials-section')}
            sx={{ minHeight: 36, fontWeight: 600 }}
          />
          <Chip
            icon={<ChurchOutlinedIcon fontSize="small" />}
            label="Dados Eclesiásticos"
            clickable
            onClick={() => handleScrollTo('ecclesiastical-section')}
            sx={{ minHeight: 36, fontWeight: 600 }}
          />
          {role === 'missionary' && (
            <Chip
              icon={<BusinessOutlinedIcon fontSize="small" />}
              label="Agência Missionária"
              clickable
              onClick={() => handleScrollTo('agency-section')}
              sx={{ minHeight: 36, fontWeight: 600 }}
            />
          )}
          <Chip
            icon={<WarningAmberOutlinedIcon fontSize="small" color="error" />}
            label="Zona de Perigo"
            clickable
            onClick={() => handleScrollTo('danger-section')}
            sx={{ minHeight: 36, fontWeight: 600, color: 'error.main' }}
          />
        </Stack>
      </Card>

      <Stack spacing={4}>
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
                  Alteração de E-mail de Login (RF 15.2.1)
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
                  <Box sx={{ pt: 0.5 }}>
                    <PillButton type="submit" tone="primaryFilled" size="small">
                      Atualizar E-mail
                    </PillButton>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* 1.2 Redefinição de Senha (RF 15.2.2) */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Redefinição de Senha (RF 15.2.2)
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

        {/* ========================================================================= */}
        {/* 2. DADOS ECLESIÁSTICOS (RF 15.3)                                          */}
        {/* ========================================================================= */}
        <Card
          id="ecclesiastical-section"
          variant="outlined"
          sx={{ borderRadius: 3, scrollMarginTop: 80 }}
        >
          <CardHeader
            avatar={<ChurchOutlinedIcon color="primary" />}
            title="Dados Eclesiásticos"
            subheader="Atualize os dados da sua Comunidade de Fé (Igreja) e do Pastor responsável"
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
            <Box component="form" onSubmit={handleSaveEcclesiastical} noValidate>
              <Stack spacing={3.5}>
                {/* 2.1 Identificação e Busca da Comunidade de Fé */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}
                  >
                    Comunidade de Fé (Igreja){' '}
                    {role === 'supporter' && (
                      <Typography component="span" variant="caption" color="text.secondary">
                        (Opcional)
                      </Typography>
                    )}
                  </Typography>

                  <Autocomplete
                    freeSolo
                    options={mockFaithCommunities}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                    value={faithCommunity.name}
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                        setFaithCommunity((prev) => ({ ...prev, name: newValue }));
                      } else if (newValue) {
                        handleSelectFaithCommunity(newValue);
                      }
                    }}
                    onInputChange={(_, newInputValue) => {
                      setFaithCommunity((prev) => ({ ...prev, name: newInputValue }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="ecclesiastical-church-name"
                        label="Nome da Comunidade de Fé (Igreja)"
                        placeholder="Busque ou digite o nome da sua igreja..."
                        size="small"
                        fullWidth
                        error={Boolean(ecclesiasticalError)}
                        helperText={
                          ecclesiasticalError ||
                          'Digite para pesquisar comunidades cadastradas ou insira um novo nome.'
                        }
                      />
                    )}
                  />
                </Box>

                {/* 2.2 Endereço e Localização da Igreja */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
                  >
                    Endereço da Comunidade de Fé
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        id="ecclesiastical-address1"
                        label="Endereço 1 (Rua, Avenida, Número)"
                        size="small"
                        fullWidth
                        value={faithCommunity.address1}
                        onChange={(e) =>
                          setFaithCommunity({ ...faithCommunity, address1: e.target.value })
                        }
                      />
                      <TextField
                        id="ecclesiastical-address2"
                        label="Endereço 2 (Complemento, Bairro)"
                        size="small"
                        fullWidth
                        value={faithCommunity.address2 || ''}
                        onChange={(e) =>
                          setFaithCommunity({ ...faithCommunity, address2: e.target.value })
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        id="ecclesiastical-country"
                        label="País"
                        size="small"
                        fullWidth
                        value={faithCommunity.country}
                        onChange={(e) =>
                          setFaithCommunity({ ...faithCommunity, country: e.target.value })
                        }
                      />
                      <TextField
                        id="ecclesiastical-state"
                        label="Estado / Província"
                        size="small"
                        fullWidth
                        value={faithCommunity.state}
                        onChange={(e) =>
                          setFaithCommunity({ ...faithCommunity, state: e.target.value })
                        }
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        id="ecclesiastical-city"
                        label="Cidade"
                        size="small"
                        fullWidth
                        value={faithCommunity.city}
                        onChange={(e) =>
                          setFaithCommunity({ ...faithCommunity, city: e.target.value })
                        }
                      />
                      <TextField
                        id="ecclesiastical-zipcode"
                        label="CEP ou Código Postal"
                        size="small"
                        fullWidth
                        value={faithCommunity.zipCode}
                        onChange={(e) =>
                          setFaithCommunity({ ...faithCommunity, zipCode: e.target.value })
                        }
                      />
                    </Stack>
                  </Stack>
                </Box>

                {/* 2.3 Contato e Website da Igreja */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
                  >
                    Contato da Igreja
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      id="ecclesiastical-website"
                      label="Website da Igreja"
                      placeholder="https://suaigreja.org.br"
                      size="small"
                      fullWidth
                      value={faithCommunity.website || ''}
                      onChange={(e) =>
                        setFaithCommunity({ ...faithCommunity, website: e.target.value })
                      }
                    />
                    <TextField
                      id="ecclesiastical-church-phone"
                      label="Telefone da Igreja"
                      placeholder="+55 (11) 3456-7890"
                      size="small"
                      fullWidth
                      value={faithCommunity.churchPhone}
                      onChange={(e) =>
                        setFaithCommunity({ ...faithCommunity, churchPhone: e.target.value })
                      }
                    />
                  </Stack>
                </Box>

                {/* 2.4 Liderança Pastoral */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
                  >
                    Liderança Pastoral Responsável
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      id="ecclesiastical-pastor-name"
                      label="Nome do Pastor Responsável"
                      size="small"
                      fullWidth
                      value={faithCommunity.pastorName}
                      onChange={(e) =>
                        setFaithCommunity({ ...faithCommunity, pastorName: e.target.value })
                      }
                    />
                    <TextField
                      id="ecclesiastical-pastor-phone"
                      label="Telefone do Pastor"
                      placeholder="+55 (11) 98765-4321"
                      size="small"
                      fullWidth
                      value={faithCommunity.pastorPhone}
                      onChange={(e) =>
                        setFaithCommunity({ ...faithCommunity, pastorPhone: e.target.value })
                      }
                    />
                  </Stack>
                </Box>

                {/* Botões de Ação */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                  <PillButton type="submit" tone="primaryFilled" size="small">
                    Salvar Dados Eclesiásticos
                  </PillButton>

                  {role === 'supporter' && faithCommunity.name && (
                    <Button
                      type="button"
                      variant="text"
                      color="inherit"
                      size="small"
                      onClick={handleClearFaithCommunity}
                      sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                      Remover vínculo com comunidade de fé
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 3. AGÊNCIA MISSIONÁRIA (Apenas para Missionários - RF 3.1.2)              */}
        {/* ========================================================================= */}
        {role === 'missionary' && (
          <Card
            id="agency-section"
            variant="outlined"
            sx={{ borderRadius: 3, scrollMarginTop: 80 }}
          >
            <CardHeader
              avatar={<BusinessOutlinedIcon color="primary" />}
              title="Agência Missionária"
              subheader="Gerencie a organização missionária à qual seu ministério está vinculado"
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
              <Box component="form" onSubmit={handleSaveAgency} noValidate>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}
                    >
                      Identificação da Agência
                    </Typography>
                    <Autocomplete
                      freeSolo
                      options={mockMissionaryAgencies}
                      getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.name
                      }
                      value={agency.name}
                      onChange={(_, newValue) => {
                        if (typeof newValue === 'string') {
                          setAgency((prev) => ({ ...prev, name: newValue }));
                        } else if (newValue) {
                          handleSelectAgency(newValue);
                        }
                      }}
                      onInputChange={(_, newInputValue) => {
                        setAgency((prev) => ({ ...prev, name: newInputValue }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          id="agency-name"
                          label="Nome da Agência Missionária"
                          placeholder="Busque ou digite o nome da agência..."
                          size="small"
                          fullWidth
                          error={Boolean(agencyError)}
                          helperText={
                            agencyError ||
                            'Digite para buscar agências cadastradas ou insira um novo nome.'
                          }
                        />
                      )}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
                    >
                      Endereço da Agência
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          id="agency-address1"
                          label="Endereço 1"
                          size="small"
                          fullWidth
                          value={agency.address1}
                          onChange={(e) => setAgency({ ...agency, address1: e.target.value })}
                        />
                        <TextField
                          id="agency-address2"
                          label="Endereço 2"
                          size="small"
                          fullWidth
                          value={agency.address2 || ''}
                          onChange={(e) => setAgency({ ...agency, address2: e.target.value })}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          id="agency-country"
                          label="País"
                          size="small"
                          fullWidth
                          value={agency.country}
                          onChange={(e) => setAgency({ ...agency, country: e.target.value })}
                        />
                        <TextField
                          id="agency-state"
                          label="Estado / Província"
                          size="small"
                          fullWidth
                          value={agency.state}
                          onChange={(e) => setAgency({ ...agency, state: e.target.value })}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          id="agency-city"
                          label="Cidade"
                          size="small"
                          fullWidth
                          value={agency.city}
                          onChange={(e) => setAgency({ ...agency, city: e.target.value })}
                        />
                        <TextField
                          id="agency-zipcode"
                          label="CEP ou Código Postal"
                          size="small"
                          fullWidth
                          value={agency.zipCode}
                          onChange={(e) => setAgency({ ...agency, zipCode: e.target.value })}
                        />
                      </Stack>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
                    >
                      Contato da Agência
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        id="agency-website"
                        label="Website"
                        placeholder="https://agencia.org"
                        size="small"
                        fullWidth
                        value={agency.website || ''}
                        onChange={(e) => setAgency({ ...agency, website: e.target.value })}
                      />
                      <TextField
                        id="agency-phone"
                        label="Telefone de Contato"
                        placeholder="+55 (41) 3657-2200"
                        size="small"
                        fullWidth
                        value={agency.phone}
                        onChange={(e) => setAgency({ ...agency, phone: e.target.value })}
                      />
                    </Stack>
                  </Box>

                  <Box sx={{ pt: 1 }}>
                    <PillButton type="submit" tone="primaryFilled" size="small">
                      Salvar Agência Missionária
                    </PillButton>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}

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
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Desativação de Conta Missionária (RF 15.5)
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Exclusão Definitiva de Conta de Apoiador (RF 15.5)
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
            preservados internamente para integridade do sistema (RF 15.5).
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
            apagados permanentemente dos servidores (RF 15.5).
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

      {/* Toast Feedback Notification (RNF 3.1, WCAG live region) */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3, fontWeight: 600 }}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
