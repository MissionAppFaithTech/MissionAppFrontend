'use client';

import type { FormEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
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
};

function ProfileField({ id, label, defaultValue, select = false }: ProfileFieldProps) {
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
        defaultValue={defaultValue}
        select={select}
        fullWidth
        size="small"
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
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
            <Typography variant="h6" color="primary.main">
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

            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              <ProfileField id="username" label="Nome de usuário" defaultValue={profile.username} />
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

            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: 'flex-end',
                pt: { xs: 1, sm: 3, md: 8 },
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
  );
}
