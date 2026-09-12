'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PillButton from '@/components/common/PillButton';

export type AccountSettingsViewProps = {
  role: 'missionary' | 'supporter';
};

export default function AccountSettingsView({ role }: AccountSettingsViewProps) {
  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        pb: 8,
        '& .MuiOutlinedInput-root': {
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'action2.fieldBg' : 'background.paper'),
          '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
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
      <Stack spacing={4}>
        {/* Credenciais de Acesso */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardHeader title="Credenciais de Acesso" slotProps={{ title: { sx: { fontWeight: 700 } } }} />
          <Divider />
          <CardContent>
            <Stack spacing={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Alteração de E-mail
                </Typography>
                <Stack spacing={2}>
                  <TextField 
                    label="Novo E-mail" 
                    type="email" 
                    size="small" 
                    fullWidth 
                    autoComplete="off" 
                  />
                  <TextField 
                    label="Senha Atual (para confirmar)" 
                    type="password" 
                    size="small" 
                    fullWidth 
                    autoComplete="current-password" 
                  />
                  <Box>
                    <PillButton tone="primaryFilled" size="small">Atualizar E-mail</PillButton>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Redefinição de Senha
                </Typography>
                <Stack spacing={2}>
                  <TextField 
                    label="Senha Atual" 
                    type="password" 
                    size="small" 
                    fullWidth 
                    autoComplete="current-password" 
                  />
                  <TextField 
                    label="Nova Senha" 
                    type="password" 
                    size="small" 
                    fullWidth 
                    autoComplete="new-password" 
                  />
                  <TextField 
                    label="Confirmar Nova Senha" 
                    type="password" 
                    size="small" 
                    fullWidth 
                    autoComplete="new-password" 
                  />
                  <Box>
                    <PillButton tone="primaryFilled" size="small">Alterar Senha</PillButton>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Dados Eclesiásticos */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardHeader title="Dados Eclesiásticos" slotProps={{ title: { sx: { fontWeight: 700 } } }} />
          <Divider />
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Comunidade de Fé (Igreja)
                </Typography>
                <Stack spacing={2}>
                  <TextField 
                    label="Nome da Comunidade de Fé" 
                    defaultValue="Igreja Batista Central" 
                    size="small" 
                    fullWidth 
                  />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Endereço e Contato da Igreja
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Endereço 1" size="small" fullWidth />
                    <TextField label="Endereço 2" size="small" fullWidth />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="País" size="small" fullWidth />
                    <TextField label="Estado/Província" size="small" fullWidth />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Cidade" size="small" fullWidth />
                    <TextField label="CEP ou Código Postal" size="small" fullWidth />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Website" size="small" fullWidth />
                    <TextField label="Telefone da Igreja" size="small" fullWidth />
                  </Stack>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Liderança
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Nome do Pastor responsável" size="small" fullWidth />
                  <TextField label="Telefone do Pastor" size="small" fullWidth />
                </Stack>
              </Box>

              <Box sx={{ pt: 1 }}>
                <PillButton tone="primaryFilled" size="small">Salvar Dados Eclesiásticos</PillButton>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Agência Missionária (Only for missionaries) */}
        {role === 'missionary' && (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Agência Missionária" slotProps={{ title: { sx: { fontWeight: 700 } } }} />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField label="Nome da Agência Missionária" size="small" fullWidth />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Endereço 1" size="small" fullWidth />
                  <TextField label="Endereço 2" size="small" fullWidth />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="País" size="small" fullWidth />
                  <TextField label="Estado/Província" size="small" fullWidth />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Cidade" size="small" fullWidth />
                  <TextField label="CEP ou Código Postal" size="small" fullWidth />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Website" size="small" fullWidth />
                  <TextField label="Telefone de contato" size="small" fullWidth />
                </Stack>
                <Box>
                  <PillButton tone="primaryFilled" size="small">Salvar Agência Missionária</PillButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card variant="outlined" sx={{ borderRadius: 3, borderColor: 'error.main' }}>
          <CardHeader 
            title="Zona de Perigo" 
            slotProps={{ title: { sx: { fontWeight: 700, color: 'error.main' } } }} 
          />
          <Divider sx={{ borderColor: 'error.light', opacity: 0.2 }} />
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {role === 'missionary' 
                ? 'Ao encerrar sua conta de missionário, seu perfil será ocultado e ficará inacessível ao público (Soft Delete), mas seus dados serão preservados internamente para integridade.'
                : 'Ao excluir sua conta de apoiador, todos os seus dados pessoais serão removidos definitivamente do sistema (Hard Delete).'
              }
            </Typography>
            <Button variant="outlined" color="error">
              {role === 'missionary' ? 'Desativar Conta' : 'Excluir Conta'}
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
