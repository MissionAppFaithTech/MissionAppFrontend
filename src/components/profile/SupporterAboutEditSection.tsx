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
import { supporterAboutSchema, type SupporterAboutFormData } from '@/schemas/profile.schema';
import type { ProfileAboutData } from '@/types/profile';
import type { ReactNode } from 'react';

type SupporterAboutEditSectionProps = {
  data: ProfileAboutData;
  onBack: () => void;
  onSave?: (data: SupporterAboutFormData) => void;
};

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

export default function SupporterAboutEditSection({
  data,
  onBack,
  onSave,
}: SupporterAboutEditSectionProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SupporterAboutFormData>({
    resolver: zodResolver(supporterAboutSchema),
    mode: 'onTouched',
    defaultValues: {
      introduction: data.introduction || '',
      originLocation: data.originLocation || '',
      currentLocation: data.currentLocation || '',
      faithCommunity: data.faithCommunity || '',
      lifeVerse: data.lifeVerse || '',
    },
  });

  const onSubmit = (formData: SupporterAboutFormData) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('draft_supporter_about_intro');
        localStorage.removeItem('draft_supporter_about_life_verse');
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
          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              Editar informação do sobre
            </Typography>

            <Controller
              name="introduction"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  id="supporter-about-introduction"
                  label="Bio / Apresentação"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={4}
                  draftKey="supporter_about_intro"
                  placeholder="Escreva uma breve apresentação sobre sua caminhada cristã e ministério..."
                  error={Boolean(errors.introduction)}
                  helperText={errors.introduction?.message}
                />
              )}
            />

            <LabeledField htmlFor="supporter-about-origin" label="Local de origem">
              <Controller
                name="originLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="supporter-about-origin"
                    select
                    fullWidth
                    size="small"
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

            <LabeledField htmlFor="supporter-about-current" label="Localização atual">
              <Controller
                name="currentLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="supporter-about-current"
                    select
                    fullWidth
                    size="small"
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

            <LabeledField htmlFor="supporter-about-faith" label="Comunidade de fé">
              <TextField
                id="supporter-about-faith"
                {...register('faithCommunity')}
                fullWidth
                size="small"
                error={Boolean(errors.faithCommunity)}
                helperText={errors.faithCommunity?.message}
              />
            </LabeledField>

            <Controller
              name="lifeVerse"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  id="supporter-about-life-verse"
                  label="Versículo para a vida"
                  value={field.value}
                  onChange={field.onChange}
                  minRows={2}
                  draftKey="supporter_about_life_verse"
                  placeholder="Insira seu versículo bíblico favorito ou lema de fé..."
                  error={Boolean(errors.lifeVerse)}
                  helperText={errors.lifeVerse?.message}
                />
              )}
            />

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                justifyContent: 'flex-end',
                pt: { xs: 1.5, sm: 2 },
                '& .MuiButton-root': {
                  minHeight: { xs: 48, sm: 40 },
                  flex: { xs: 1, sm: 'initial' },
                },
              }}
            >
              <PillButton tone="primarySoftOutline" size="medium" onClick={onBack}>
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
