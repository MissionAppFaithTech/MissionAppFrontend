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
import RichTextEditor from '@/components/common/RichTextEditor';
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('draft_profile_about_intro');
        localStorage.removeItem('draft_profile_about_mission_history');
        localStorage.removeItem('draft_profile_about_prayer_requests');
        localStorage.removeItem('draft_profile_about_life_verse');
      } catch {
        // Ignore
      }
    }
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
        boxShadow: 'var(--app-shadow-md)',
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

            <Controller
              name="introduction"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  id="profile-about-introduction"
                  label="Sobre mim"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={4}
                  draftKey="profile_about_intro"
                  placeholder="Compartilhe sua trajetória, testemunho e dedicação ministerial..."
                  error={Boolean(errors.introduction)}
                  helperText={errors.introduction?.message}
                />
              )}
            />

            <Controller
              name="missionHistory"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  id="profile-about-mission-history"
                  label="Resumo da minha história em missões"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={4}
                  draftKey="profile_about_mission_history"
                  placeholder="Conte sobre os países, comunidades e marcos por onde você serviu..."
                  error={Boolean(errors.missionHistory)}
                  helperText={errors.missionHistory?.message}
                />
              )}
            />

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

            <Controller
              name="prayerRequests"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  id="profile-about-prayer-requests"
                  label="Pedidos de oração"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={3}
                  draftKey="profile_about_prayer_requests"
                  placeholder="Liste pedidos de oração pelo seu ministério, saúde e família..."
                  error={Boolean(errors.prayerRequests)}
                  helperText={errors.prayerRequests?.message}
                />
              )}
            />

            <Controller
              name="lifeVerse"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  id="profile-about-life-verse"
                  label="Versículo para a vida"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={2}
                  draftKey="profile_about_life_verse"
                  placeholder="Insira sua citação bíblica ou lema de fé (ex: 'Tudo posso naquele que me fortalece')..."
                  error={Boolean(errors.lifeVerse)}
                  helperText={errors.lifeVerse?.message}
                />
              )}
            />

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                pt: 1.5,
                justifyContent: 'flex-end',
                '& .MuiButton-root': {
                  minHeight: { xs: 48, sm: 40 },
                  flex: { xs: 1, sm: 'initial' },
                },
              }}
            >
              <PillButton type="button" tone="primarySoftOutline" size="medium" onClick={onBack}>
                Voltar
              </PillButton>
              <PillButton type="submit" tone="primaryFilled" size="medium">
                Salvar
              </PillButton>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
