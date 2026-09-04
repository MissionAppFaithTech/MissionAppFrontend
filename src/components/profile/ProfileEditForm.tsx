'use client';

import { useState, type FormEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { profileLocations } from '@/lib/profileOptions';
import type { ProfileData } from '@/types/profile';

type ProfileEditFormProps = {
  profile: ProfileData;
};

type ProfileFieldProps = {
  id: string;
  label: string;
  defaultValue: string;
  select?: boolean;
  type?: string;
  placeholder?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
};

function ProfileField({
  id,
  label,
  defaultValue,
  select = false,
  type = 'text',
  placeholder,
  helperText,
  startAdornment,
}: ProfileFieldProps) {
  return (
    <Stack spacing={0.75}>
      <Typography
        component="label"
        htmlFor={id}
        variant="body2"
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        {label}:
      </Typography>
      <TextField
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        helperText={helperText}
        select={select}
        fullWidth
        size="small"
        slotProps={{
          input: {
            startAdornment: startAdornment ? (
              <InputAdornment position="start">{startAdornment}</InputAdornment>
            ) : undefined,
          },
        }}
      >
        {select
          ? profileLocations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))
          : null}
      </TextField>
    </Stack>
  );
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToastOpen(true);
  };

  return (
    <>
      <Card
        component="section"
        elevation={0}
        sx={{
          minHeight: { md: 660 },
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 3, sm: 4 }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                Editar perfil
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: { xs: 88, sm: 104 },
                      height: { xs: 88, sm: 104 },
                      bgcolor: 'supporter.light',
                      color: 'common.black',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: { xs: 48, sm: 56 } }} />
                  </Avatar>

                  <IconButton
                    component="label"
                    aria-label="Alterar foto de perfil"
                    size="small"
                    sx={{
                      position: 'absolute',
                      right: -2,
                      bottom: 2,
                      width: 30,
                      height: 30,
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      border: '2px solid',
                      borderColor: 'background.paper',
                      '&:hover': { bgcolor: 'primary.dark', color: 'common.white' },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                    <Box component="input" type="file" accept="image/*" hidden />
                  </IconButton>
                </Box>
              </Box>

              {/* Seção 1: Informações Gerais */}
              <Stack spacing={{ xs: 2.5, sm: 3 }}>
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  sx={{ fontWeight: 700, fontSize: { xs: '0.9375rem', sm: '1rem' } }}
                >
                  Informações Básicas
                </Typography>
                <ProfileField
                  id="username"
                  label="Nome de usuário"
                  defaultValue={profile.username}
                />
                <ProfileField
                  id="displayName"
                  label="Nome completo"
                  defaultValue={profile.displayName}
                />
                <ProfileField id="bio" label="Bio" defaultValue={profile.roleDescription} />
                <ProfileField
                  id="currentLocation"
                  label="Local de atuação atual"
                  defaultValue={profile.about.currentLocation}
                  select
                />
              </Stack>

              <Divider />

              {/* Seção 2: Contatos Públicos */}
              <Stack spacing={{ xs: 2.5, sm: 3 }}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    color="primary.main"
                    sx={{ fontWeight: 700, fontSize: { xs: '0.9375rem', sm: '1rem' } }}
                  >
                    Contatos Públicos
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Essas informações serão exibidas publicamente para visitantes e apoiadores no
                    modal de contato.
                  </Typography>
                </Box>

                <ProfileField
                  id="publicEmail"
                  label="E-mail de contato público"
                  type="email"
                  defaultValue={profile.contact?.publicEmail || ''}
                  placeholder="exemplo@dominio.com"
                  startAdornment={
                    <EmailOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  }
                />

                <ProfileField
                  id="publicPhone"
                  label="Telefone de contato público"
                  type="tel"
                  defaultValue={profile.contact?.publicPhone || ''}
                  placeholder="+55 (21) 98765-4321"
                  startAdornment={
                    <PhoneOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  }
                />

                <ProfileField
                  id="whatsappNumber"
                  label="Número do WhatsApp"
                  type="tel"
                  defaultValue={profile.contact?.whatsappNumber || ''}
                  placeholder="+5521987654321"
                  helperText="Inclua o DDI e DDD (ex: +5521987654321) para facilitar o link direto"
                  startAdornment={<WhatsAppIcon sx={{ fontSize: 20, color: '#25D366' }} />}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: 'flex-end',
                  pt: { xs: 1, sm: 3, md: 4 },
                  '& .MuiButton-root': { flex: { xs: 1, sm: 'initial' } },
                }}
              >
                <PillButton href="/profile/sobre" tone="primarySoftOutline" size="small">
                  Voltar
                </PillButton>
                <PillButton type="submit" tone="primaryFilled" size="small">
                  Salvar
                </PillButton>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
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
          Perfil atualizado com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
}
