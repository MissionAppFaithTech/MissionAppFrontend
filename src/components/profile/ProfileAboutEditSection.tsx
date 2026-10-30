'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import StyledTextArea from '@/components/common/StyledTextArea';
import { useCatalogItems } from '@/forms/register/shared/useCatalogItems';
import { profileAboutSchema, type ProfileAboutFormData } from '@/schemas/profile.schema';
import { listFaithCommunities } from '@/services/catalog.service';
import {
  toUpdateMissionaryAboutPayload,
  updateMissionaryAbout,
} from '@/services/missionary.service';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import { useProfileStore } from '@/stores/profileStore';
import type { ProfileAboutData } from '@/types/profile';

type ProfileAboutEditSectionProps = {
  missionaryId: string;
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
  missionaryId,
  data,
  onBack,
  onSave,
}: ProfileAboutEditSectionProps) {
  const communities = useCatalogItems(listFaithCommunities);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileAboutFormData>({
    resolver: zodResolver(profileAboutSchema),
    mode: 'onTouched',
    values: {
      introduction: data.introduction || '',
      missionHistory: data.missionHistory || '',
      missionaryAgency: data.missionaryAgency || '',
      faithCommunity: data.faithCommunity || '',
      prayerRequests: data.prayerRequests || '',
      lifeVerse: data.lifeVerse || '',
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  useEffect(() => {
    const match = communities.items.find(
      (item) => item.id === data.faithCommunity || item.name === data.faithCommunity
    );
    if (match) {
      setValue('faithCommunity', match.id);
    }
  }, [communities.items, data.faithCommunity, setValue]);

  const onSubmit = async (formData: ProfileAboutFormData) => {
    setSubmitError(null);
    try {
      await updateMissionaryAbout(missionaryId, toUpdateMissionaryAboutPayload(formData));
      useProfileStore.setState((prev) => ({
        profile: {
          ...prev.profile,
          about: {
            ...prev.profile.about,
            ...formData,
          },
        },
      }));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível salvar as informações do sobre'
      );
      return;
    }

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

    setToastOpen(true);
    onSave?.(formData);
    setTimeout(() => {
      onBack();
    }, 700);
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

            {submitError ? (
              <Alert severity="error" role="alert">
                {submitError}
              </Alert>
            ) : null}

            <Controller
              name="introduction"
              control={control}
              render={({ field }) => (
                <StyledTextArea
                  id="profile-about-introduction"
                  label="Sobre mim"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={4}
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
                <StyledTextArea
                  id="profile-about-mission-history"
                  label="Resumo da minha história em missões"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={4}
                  placeholder="Conte sobre os países, comunidades e marcos por onde você serviu..."
                  error={Boolean(errors.missionHistory)}
                  helperText={errors.missionHistory?.message}
                />
              )}
            />

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
                    {(() => {
                      const options =
                        communities.items.length > 0
                          ? communities.items
                          : faithCommunities.map((name) => ({ id: name, name }));
                      const hasCurrentValue = options.some((opt) => opt.id === field.value);
                      const menuItems = options.map((community) => (
                        <MenuItem key={community.id} value={community.id}>
                          {community.name}
                        </MenuItem>
                      ));
                      if (!hasCurrentValue && field.value) {
                        menuItems.unshift(
                          <MenuItem key={field.value} value={field.value} sx={{ display: 'none' }}>
                            {field.value}
                          </MenuItem>
                        );
                      }
                      return menuItems;
                    })()}
                  </TextField>
                )}
              />
            </LabeledField>

            <Controller
              name="prayerRequests"
              control={control}
              render={({ field }) => (
                <StyledTextArea
                  id="profile-about-prayer-requests"
                  label="Pedidos de oração"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={3}
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
                <StyledTextArea
                  id="profile-about-life-verse"
                  label="Versículo para a vida"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={2}
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
                  ...FORM_ACTION_BUTTON_SX,
                  flex: { xs: 1, sm: 'initial' },
                },
              }}
            >
              <PillButton type="button" tone="primarySoftOutline" size="medium" onClick={onBack}>
                Voltar
              </PillButton>
              <PillButton type="submit" tone="primaryFilled" size="medium" loading={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </PillButton>
            </Stack>
          </Stack>
        </Box>
      </CardContent>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          role="status"
          sx={{
            width: '100%',
            fontWeight: 600,
            borderRadius: 2,
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid var(--mui-palette-action2-borderSubtle)'
                : 'none',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark' ? 'var(--app-shadow-overlay)' : 'var(--app-shadow-sm)',
            '& .MuiAlert-icon': {
              color: (theme) => (theme.palette.mode === 'dark' ? 'success.light' : 'common.white'),
            },
          }}
        >
          Informações da seção Sobre salvas com sucesso!
        </Alert>
      </Snackbar>
    </Card>
  );
}
