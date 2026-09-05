'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import PillButton from '@/components/common/PillButton';
import DonationModal from '@/components/profile/DonationModal';
import type { BankAccountType, FinancialConfigData, PixKeyType } from '@/types/profile';

type FinancialSettingsFormProps = {
  initialData?: FinancialConfigData;
  missionaryName?: string;
  onSave?: (data: FinancialConfigData) => void;
};

const defaultFinancialData: FinancialConfigData = {
  supporterMessage:
    'Sua oferta voluntária sustenta nossa atuação missionária e projetos sociais. Que Deus abençoe ricamente sua generosidade!',
  pix: {
    enabled: true,
    key: '',
    keyType: 'email',
    qrCodeUrl: '',
  },
  bankTransfer: {
    enabled: false,
    bankName: '',
    bankNumber: '',
    agency: '',
    account: '',
    accountType: 'corrente',
    holderName: '',
    holderDocument: '',
  },
};

export default function FinancialSettingsForm({
  initialData,
  missionaryName = 'Samuel Mendonça',
  onSave,
}: FinancialSettingsFormProps) {
  const source = initialData ?? defaultFinancialData;

  const [supporterMessage, setSupporterMessage] = useState(source.supporterMessage);

  // Pix state
  const [pixEnabled, setPixEnabled] = useState(source.pix.enabled);
  const [pixKey, setPixKey] = useState(source.pix.key);
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>(source.pix.keyType);
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState<string>(source.pix.qrCodeUrl || '');

  // Bank transfer state
  const [bankEnabled, setBankEnabled] = useState(source.bankTransfer.enabled);
  const [bankName, setBankName] = useState(source.bankTransfer.bankName);
  const [bankNumber, setBankNumber] = useState(source.bankTransfer.bankNumber);
  const [agency, setAgency] = useState(source.bankTransfer.agency);
  const [account, setAccount] = useState(source.bankTransfer.account);
  const [accountType, setAccountType] = useState<BankAccountType>(source.bankTransfer.accountType);
  const [holderName, setHolderName] = useState(source.bankTransfer.holderName);
  const [holderDocument, setHolderDocument] = useState(source.bankTransfer.holderDocument);

  // UI state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validation calculations
  const isPixComplete = pixEnabled ? pixKey.trim().length > 0 : false;
  const isBankComplete = bankEnabled
    ? bankName.trim().length > 0 &&
      agency.trim().length > 0 &&
      account.trim().length > 0 &&
      holderName.trim().length > 0 &&
      holderDocument.trim().length > 0
    : false;

  const isGloballyActive = isPixComplete || isBankComplete;

  const currentFinancialConfig: FinancialConfigData = {
    supporterMessage,
    pix: {
      enabled: pixEnabled,
      key: pixKey,
      keyType: pixKeyType,
      qrCodeUrl: pixQrCodeUrl || undefined,
    },
    bankTransfer: {
      enabled: bankEnabled,
      bankName,
      bankNumber,
      agency,
      account,
      accountType,
      holderName,
      holderDocument,
    },
  };

  const handleQrCodeFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPixQrCodeUrl(previewUrl);
    }
  };

  const handleRemoveQrCode = () => {
    setPixQrCodeUrl('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: string[] = [];

    if (pixEnabled && !pixKey.trim()) {
      errors.push('Pix está ativado, mas a chave Pix não foi informada.');
    }

    if (bankEnabled) {
      if (!bankName.trim()) errors.push('Informe o nome da instituição bancária.');
      if (!agency.trim()) errors.push('Informe a agência bancária.');
      if (!account.trim()) errors.push('Informe o número da conta com dígito.');
      if (!holderName.trim()) errors.push('Informe o nome do titular da conta.');
      if (!holderDocument.trim()) errors.push('Informe o CPF/CNPJ do titular da conta.');
    }

    if (!pixEnabled && !bankEnabled) {
      errors.push('Recomendado: ative ao menos um método de doação (Pix ou Transferência).');
    }

    setValidationErrors(errors);
    onSave?.(currentFinancialConfig);
    setToastOpen(true);
  };

  return (
    <>
      <Card
        component="section"
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 3, sm: 3.5 }}>
              {/* Header com Status Geral e Ações */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                    <Typography
                      variant="h5"
                      component="h1"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      Configurações Financeiras
                    </Typography>
                    <Chip
                      icon={isGloballyActive ? <CheckCircleIcon /> : <WarningAmberIcon />}
                      label={isGloballyActive ? 'Status: Ativo' : 'Status: Pendente'}
                      color={isGloballyActive ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Configure os canais de recebimento de ofertas voluntárias e mensagens aos
                    apoiadores.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  <PillButton
                    href="/profile/sobre"
                    tone="primarySoftOutline"
                    size="small"
                    aria-label="Voltar para o perfil"
                    sx={{ minHeight: 44, px: 2, flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 18, mr: 0.75 }} />
                    Voltar
                  </PillButton>

                  <PillButton
                    type="button"
                    tone="primarySoftOutline"
                    size="small"
                    onClick={() => setPreviewOpen(true)}
                    sx={{ minHeight: 44, px: 2, flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                    Visualizar Prévia do Apoiador
                  </PillButton>
                </Stack>
              </Box>

              {/* Banner Informativo de Segurança (RF 12.3) */}
              <Alert
                severity="info"
                icon={<SecurityOutlinedIcon fontSize="inherit" />}
                sx={{ borderRadius: 2, fontSize: '0.8125rem', bgcolor: 'rgba(13, 43, 92, 0.05)' }}
              >
                <strong>Ambiente Seguro:</strong> A plataforma MissionApp não intermedia nem
                armazena dados de cartões de crédito ou senhas bancárias. As doações são voluntárias
                e realizadas diretamente de banco a banco através do aplicativo do apoiador.
              </Alert>

              {!isGloballyActive && (
                <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.8125rem' }}>
                  <strong>Atenção:</strong> Seus métodos de doação ainda constam como pendentes.
                  Para que apoiadores consigam realizar doações no seu perfil, ative e preencha
                  todos os dados obrigatórios de ao menos uma modalidade (Pix ou Transferência
                  Bancária).
                </Alert>
              )}

              <Divider />

              {/* 1. Mensagem aos Apoiadores (RF 12.1.1) */}
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Mensagem aos Apoiadores
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Esta mensagem de gratidão e prestação de propósito é apresentada aos doadores no
                  momento da oferta.
                </Typography>

                <TextField
                  label="Mensagem de Gratidão e Direcionamento"
                  multiline
                  rows={3}
                  fullWidth
                  value={supporterMessage}
                  onChange={(e) => setSupporterMessage(e.target.value.slice(0, 500))}
                  helperText={`${supporterMessage.length}/500 caracteres`}
                  placeholder="Ex: Sua contribuição sustenta nossa atuação no campo missionário..."
                />

                {/* Prévia dinâmica da mensagem */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(13, 43, 92, 0.03)',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}
                  >
                    Prévia ao vivo no modal de doação:
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                    &ldquo;{supporterMessage || 'Escreva sua mensagem acima...'}&rdquo;
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* 2. Configuração do Pix Simples (RF 12.1.2 A) */}
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: pixEnabled ? 'primary.light' : 'divider',
                  boxShadow: pixEnabled ? '0 2px 8px rgba(13, 43, 92, 0.06)' : 'none',
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <QrCode2Icon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Doação via Pix Simples
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Transferência instantânea via chave Pix e QR Code estático.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={!pixEnabled ? 'Desativado' : isPixComplete ? 'Ativo' : 'Incompleto'}
                      color={!pixEnabled ? 'default' : isPixComplete ? 'success' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={pixEnabled}
                          onChange={(e) => setPixEnabled(e.target.checked)}
                          color="primary"
                          slotProps={{ input: { 'aria-label': 'Ativar Doação via Pix' } }}
                        />
                      }
                      label={pixEnabled ? 'Ativado' : 'Desativado'}
                      sx={{ m: 0 }}
                    />
                  </Stack>
                </Box>

                {pixEnabled && (
                  <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="pix-key-type-label">Tipo de Chave Pix</InputLabel>
                          <Select
                            labelId="pix-key-type-label"
                            id="pix-key-type-select"
                            value={pixKeyType}
                            label="Tipo de Chave Pix"
                            onChange={(e) => setPixKeyType(e.target.value as PixKeyType)}
                          >
                            <MenuItem value="cpf">CPF</MenuItem>
                            <MenuItem value="cnpj">CNPJ</MenuItem>
                            <MenuItem value="email">E-mail</MenuItem>
                            <MenuItem value="phone">Telefone / Celular</MenuItem>
                            <MenuItem value="random">Chave Aleatória</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                          label="Chave Pix"
                          size="small"
                          fullWidth
                          required={pixEnabled}
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder={
                            pixKeyType === 'email'
                              ? 'exemplo@email.com'
                              : pixKeyType === 'phone'
                                ? '+55 (11) 99999-9999'
                                : pixKeyType === 'cpf'
                                  ? '000.000.000-00'
                                  : pixKeyType === 'cnpj'
                                    ? '00.000.000/0001-00'
                                    : 'Chave aleatória EVP'
                          }
                          helperText="Chave Pix registrada na sua instituição financeira"
                          error={pixEnabled && !pixKey.trim()}
                        />
                      </Grid>
                    </Grid>

                    {/* QR Code Estático */}
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        QR Code Estático (Opcional)
                      </Typography>

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{ alignItems: 'flex-start' }}
                      >
                        {pixQrCodeUrl ? (
                          <Box
                            sx={{
                              position: 'relative',
                              width: 120,
                              height: 120,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'common.white',
                            }}
                          >
                            <Image
                              src={pixQrCodeUrl}
                              alt="Prévia do QR Code Pix"
                              fill
                              sizes="120px"
                              style={{ objectFit: 'contain' }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: 2,
                              border: '2px dashed',
                              borderColor: 'divider',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'action.hover',
                            }}
                          >
                            <QrCode2Icon sx={{ color: 'text.secondary', fontSize: 40 }} />
                            <Typography variant="caption" color="text.secondary">
                              Sem QR Code
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ flex: 1 }}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1.5}
                            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, mb: 1 }}
                          >
                            <PillButton
                              component="label"
                              tone="primarySoftOutline"
                              size="small"
                              sx={{
                                minHeight: 44,
                                px: 2,
                                cursor: 'pointer',
                                justifyContent: 'center',
                              }}
                            >
                              <CloudUploadOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                              {pixQrCodeUrl ? 'Substituir imagem' : 'Enviar imagem do QR Code'}
                              <Box
                                component="input"
                                type="file"
                                accept="image/*"
                                aria-label="Upload de imagem do QR Code"
                                hidden
                                onChange={handleQrCodeFileChange}
                              />
                            </PillButton>

                            {pixQrCodeUrl && (
                              <PillButton
                                type="button"
                                tone="outline"
                                size="small"
                                onClick={handleRemoveQrCode}
                                sx={{ minHeight: 44, px: 1.5, justifyContent: 'center' }}
                              >
                                <DeleteOutlinedIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                Remover
                              </PillButton>
                            )}
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            Envie a imagem do QR Code Pix gerado no seu app bancário para facilitar
                            o pagamento de apoiadores.
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </Card>

              {/* 3. Configuração de Transferência Bancária (RF 12.1.2 B) */}
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: bankEnabled ? 'primary.light' : 'divider',
                  boxShadow: bankEnabled ? '0 2px 8px rgba(13, 43, 92, 0.06)' : 'none',
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Transferência Bancária (TED / DOC / Mesma Instituição)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Dados de conta corrente ou poupança para transferências diretas.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={!bankEnabled ? 'Desativado' : isBankComplete ? 'Ativo' : 'Incompleto'}
                      color={!bankEnabled ? 'default' : isBankComplete ? 'success' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={bankEnabled}
                          onChange={(e) => setBankEnabled(e.target.checked)}
                          color="primary"
                          slotProps={{ input: { 'aria-label': 'Ativar Transferência Bancária' } }}
                        />
                      }
                      label={bankEnabled ? 'Ativado' : 'Desativado'}
                      sx={{ m: 0 }}
                    />
                  </Stack>
                </Box>

                {bankEnabled && (
                  <Stack spacing={2} sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                          label="Instituição Bancária"
                          size="small"
                          fullWidth
                          required={bankEnabled}
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Ex: Banco do Brasil, Bradesco, Nubank..."
                          error={bankEnabled && !bankName.trim()}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Código do Banco (opcional)"
                          size="small"
                          fullWidth
                          value={bankNumber}
                          onChange={(e) => setBankNumber(e.target.value)}
                          placeholder="Ex: 001, 237, 260"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Agência"
                          size="small"
                          fullWidth
                          required={bankEnabled}
                          value={agency}
                          onChange={(e) => setAgency(e.target.value)}
                          placeholder="Ex: 1234 ou 1234-5"
                          error={bankEnabled && !agency.trim()}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Número da Conta com Dígito"
                          size="small"
                          fullWidth
                          required={bankEnabled}
                          value={account}
                          onChange={(e) => setAccount(e.target.value)}
                          placeholder="Ex: 98765-4"
                          error={bankEnabled && !account.trim()}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="account-type-label">Tipo de Conta</InputLabel>
                          <Select
                            labelId="account-type-label"
                            id="account-type-select"
                            value={accountType}
                            label="Tipo de Conta"
                            onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                          >
                            <MenuItem value="corrente">Conta Corrente</MenuItem>
                            <MenuItem value="poupanca">Conta Poupança</MenuItem>
                            <MenuItem value="pagamento">Conta de Pagamento</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 7 }}>
                        <TextField
                          label="Nome Completo do Titular"
                          size="small"
                          fullWidth
                          required={bankEnabled}
                          value={holderName}
                          onChange={(e) => setHolderName(e.target.value)}
                          placeholder="Ex: Samuel Mendonça"
                          error={bankEnabled && !holderName.trim()}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          label="CPF / CNPJ do Titular"
                          size="small"
                          fullWidth
                          required={bankEnabled}
                          value={holderDocument}
                          onChange={(e) => setHolderDocument(e.target.value)}
                          placeholder="000.000.000-00"
                          error={bankEnabled && !holderDocument.trim()}
                        />
                      </Grid>
                    </Grid>

                    <FormHelperText>
                      Apoiadores poderão copiar todos os dados com 1 clique para colar no aplicativo
                      bancário.
                    </FormHelperText>
                  </Stack>
                )}
              </Card>

              <Divider />

              {/* Botões de Ação Final */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  justifyContent: 'flex-end',
                  gap: 1.5,
                  pt: 1,
                }}
              >
                <PillButton
                  href="/profile/sobre"
                  tone="primarySoftOutline"
                  size="medium"
                  aria-label="Voltar para o perfil"
                  sx={{ minHeight: 44, px: 3, width: { xs: '100%', sm: 'auto' } }}
                >
                  <ArrowBackIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Voltar
                </PillButton>

                <PillButton
                  type="button"
                  tone="primarySoftOutline"
                  size="medium"
                  onClick={() => setPreviewOpen(true)}
                  sx={{ minHeight: 44, px: 3, width: { xs: '100%', sm: 'auto' } }}
                >
                  <VisibilityOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Visualizar Prévia
                </PillButton>

                <PillButton
                  type="submit"
                  tone="missionFilled"
                  size="medium"
                  sx={{ minHeight: 44, px: 4, width: { xs: '100%', sm: 'auto' } }}
                >
                  <SaveOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Salvar Configurações
                </PillButton>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Modal de Prévia do Apoiador */}
      <DonationModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        missionaryName={missionaryName}
        isOwnProfile={true}
        financialConfig={currentFinancialConfig}
      />

      {/* Toast Feedback */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={validationErrors.length > 0 && !isGloballyActive ? 'warning' : 'success'}
          variant="filled"
          role="status"
          aria-live="polite"
          sx={{
            bgcolor:
              validationErrors.length > 0 && !isGloballyActive ? 'warning.main' : 'primary.main',
            color: 'common.white',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              color: 'common.white',
            },
          }}
        >
          {validationErrors.length > 0 && !isGloballyActive
            ? 'Configurações salvas, mas alguns dados estão incompletos.'
            : 'Configurações financeiras salvas com sucesso!'}
        </Alert>
      </Snackbar>
    </>
  );
}
