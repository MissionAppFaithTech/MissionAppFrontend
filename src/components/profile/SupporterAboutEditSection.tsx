'use client';

import type { FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { profileLocations } from '@/lib/profileOptions';
import type { ProfileAboutData } from '@/types/profile';

type SupporterAboutEditSectionProps = {
  data: ProfileAboutData;
  onBack: () => void;
};

type FieldProps = {
  id: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
  minRows?: number;
  select?: boolean;
};

function EditField({ id, label, defaultValue, multiline, minRows, select }: FieldProps) {
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
        multiline={multiline}
        minRows={minRows}
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

export default function SupporterAboutEditSection({
  data,
  onBack,
}: SupporterAboutEditSectionProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              Editar informação do sobre
            </Typography>

            <EditField
              id="introduction"
              label="Bio / Apresentação"
              defaultValue={data.introduction}
              multiline
              minRows={3}
            />

            <EditField
              id="originLocation"
              label="Local de origem"
              defaultValue={data.originLocation}
              select
            />

            <EditField
              id="currentLocation"
              label="Localização atual"
              defaultValue={data.currentLocation}
              select
            />

            <EditField
              id="faithCommunity"
              label="Comunidade de fé"
              defaultValue={data.faithCommunity}
            />

            <EditField id="lifeVerse" label="Versículo para a vida" defaultValue={data.lifeVerse} />

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
