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
import { supporterAboutSchema, type SupporterAboutFormData } from '@/schemas/profile.schema';
import type { ProfileAboutData } from '@/types/profile';

type SupporterAboutEditSectionProps = {
  data: ProfileAboutData;
  onBack: () => void;
};

export default function SupporterAboutEditSection({
  data,
  onBack,
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

  const onSubmit = () => {
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
          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              Editar informação do sobre
            </Typography>

            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="introduction"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Bio / Apresentação:
              </Typography>
              <TextField
                id="introduction"
                {...register('introduction')}
                multiline
                minRows={3}
                fullWidth
                size="small"
                error={Boolean(errors.introduction)}
                helperText={errors.introduction?.message}
              />
            </Stack>

            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="originLocation"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Local de origem:
              </Typography>
              <Controller
                name="originLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="originLocation"
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
            </Stack>

            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="currentLocation"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Localização atual:
              </Typography>
              <Controller
                name="currentLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="currentLocation"
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
            </Stack>

            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="faithCommunity"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Comunidade de fé:
              </Typography>
              <TextField
                id="faithCommunity"
                {...register('faithCommunity')}
                fullWidth
                size="small"
                error={Boolean(errors.faithCommunity)}
                helperText={errors.faithCommunity?.message}
              />
            </Stack>

            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="lifeVerse"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Versículo para a vida:
              </Typography>
              <TextField
                id="lifeVerse"
                {...register('lifeVerse')}
                fullWidth
                size="small"
                error={Boolean(errors.lifeVerse)}
                helperText={errors.lifeVerse?.message}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: 'flex-end',
                pt: { xs: 1, sm: 2 },
                '& .MuiButton-root': { flex: { xs: 1, sm: 'initial' } },
              }}
            >
              <PillButton tone="primarySoftOutline" size="small" onClick={onBack}>
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
