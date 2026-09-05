'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { profileLocations } from '@/lib/profileOptions';
import { profileAboutSchema, type ProfileAboutFormData } from '@/schemas/profile.schema';
import type { ProfileAboutData } from '@/types/profile';
import type { ReactNode } from 'react';

type ProfileAboutEditSectionProps = {
  data: ProfileAboutData;
  onBack: () => void;
  onSave?: (data: ProfileAboutFormData) => void;
};

const missionaryAgencies = [
  'JOCUM (Jovens com uma Missão)',
  'Missão do Interior',
  'Agência Missionária Independente',
] as const;

const faithCommunities = ['Igreja Batista', 'Igreja Presbiteriana', 'Comunidade Cristã'] as const;

type LabeledFieldProps = {
  children: ReactNode;
  htmlFor: string;
  label: string;
};

function LabeledField({ children, htmlFor, label }: LabeledFieldProps) {
  return (
    <Stack spacing={0.75}>
      <Typography
        component="label"
        htmlFor={htmlFor}
        variant="body2"
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        {label}:
      </Typography>
      {children}
    </Stack>
  );
}

export default function ProfileAboutEditSection({
  data,
  onBack,
  onSave,
}: ProfileAboutEditSectionProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileAboutFormData>({
    resolver: zodResolver(profileAboutSchema),
    mode: 'onTouched',
    defaultValues: {
      introduction: data.introduction || '',
      missionHistory: data.missionHistory || '',
      originLocation: data.originLocation || '',
      currentLocation: data.currentLocation || '',
      missionaryAgency: data.missionaryAgency || '',
      faithCommunity: data.faithCommunity || '',
      prayerRequests: data.prayerRequests || '',
      lifeVerse: data.lifeVerse || '',
    },
  });

  const onSubmit = (formData: ProfileAboutFormData) => {
    onSave?.(formData);
    onBack();
  };

  return (
    <Card
      component="section"
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.16)',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={{ xs: 2, sm: 2.5 }}>
            <Typography variant="h6" color="primary.main">
              Editar sobre
            </Typography>

            <LabeledField htmlFor="profile-about-introduction" label="Sobre mim">
              <TextField
                id="profile-about-introduction"
                {...register('introduction')}
                multiline
                minRows={4}
                fullWidth
                error={Boolean(errors.introduction)}
                helperText={errors.introduction?.message}
              />
            </LabeledField>

            <LabeledField
              htmlFor="profile-about-mission-history"
              label="Resumo da minha história em missões"
            >
              <TextField
                id="profile-about-mission-history"
                {...register('missionHistory')}
                multiline
                minRows={4}
                fullWidth
                error={Boolean(errors.missionHistory)}
                helperText={errors.missionHistory?.message}
              />
            </LabeledField>

            <LabeledField htmlFor="profile-about-origin" label="Local de origem">
              <Controller
                name="originLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="profile-about-origin"
                    select
                    fullWidth
                    error={Boolean(errors.originLocation)}
                    helperText={errors.originLocation?.message}
                  >
                    {profileLocations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </LabeledField>

            <LabeledField htmlFor="profile-about-current-location" label="Local de atuação atual">
              <Controller
                name="currentLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="profile-about-current-location"
                    select
                    fullWidth
                    error={Boolean(errors.currentLocation)}
                    helperText={errors.currentLocation?.message}
                  >
                    {profileLocations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </LabeledField>

            <LabeledField htmlFor="profile-about-agency" label="Agência missionária">
              <Controller
                name="missionaryAgency"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="profile-about-agency"
                    select
                    fullWidth
                    error={Boolean(errors.missionaryAgency)}
                    helperText={errors.missionaryAgency?.message}
                  >
                    {missionaryAgencies.map((agency) => (
                      <MenuItem key={agency} value={agency}>
                        {agency}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </LabeledField>

            <LabeledField htmlFor="profile-about-faith-community" label="Comunidade de fé">
              <Controller
                name="faithCommunity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="profile-about-faith-community"
                    select
                    fullWidth
                    error={Boolean(errors.faithCommunity)}
                    helperText={errors.faithCommunity?.message}
                  >
                    {faithCommunities.map((community) => (
                      <MenuItem key={community} value={community}>
                        {community}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </LabeledField>

            <LabeledField htmlFor="profile-about-prayer-requests" label="Pedidos de oração">
              <TextField
                id="profile-about-prayer-requests"
                {...register('prayerRequests')}
                multiline
                minRows={3}
                fullWidth
                error={Boolean(errors.prayerRequests)}
                helperText={errors.prayerRequests?.message}
              />
            </LabeledField>

            <LabeledField htmlFor="profile-about-life-verse" label="Versículo para a vida">
              <TextField
                id="profile-about-life-verse"
                {...register('lifeVerse')}
                multiline
                minRows={3}
                fullWidth
                error={Boolean(errors.lifeVerse)}
                helperText={errors.lifeVerse?.message}
              />
            </LabeledField>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                pt: 1,
                justifyContent: 'flex-end',
                '& .MuiButton-root': {
                  flex: { xs: 1, sm: 'initial' },
                },
              }}
            >
              <PillButton type="button" tone="primarySoftOutline" size="small" onClick={onBack}>
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
