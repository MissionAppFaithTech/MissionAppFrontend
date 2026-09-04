'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { profileLocations } from '@/lib/profileOptions';
import type { ReactNode } from 'react';
import type { ProfileAboutData } from '@/types/profile';

type ProfileAboutEditSectionProps = {
  data: ProfileAboutData;
  onBack: () => void;
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

export default function ProfileAboutEditSection({ data, onBack }: ProfileAboutEditSectionProps) {
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
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Typography variant="h6" color="primary.main">
            Editar sobre
          </Typography>

          <LabeledField htmlFor="profile-about-introduction" label="Sobre mim">
            <TextField
              id="profile-about-introduction"
              defaultValue={data.introduction}
              multiline
              minRows={4}
              fullWidth
            />
          </LabeledField>

          <LabeledField
            htmlFor="profile-about-mission-history"
            label="Resumo da minha história em missões"
          >
            <TextField
              id="profile-about-mission-history"
              defaultValue={data.missionHistory}
              multiline
              minRows={4}
              fullWidth
            />
          </LabeledField>

          <LabeledField htmlFor="profile-about-origin" label="Local de origem">
            <TextField
              id="profile-about-origin"
              select
              defaultValue={data.originLocation}
              fullWidth
            >
              {profileLocations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
          </LabeledField>

          <LabeledField htmlFor="profile-about-current-location" label="Local de atuação atual">
            <TextField
              id="profile-about-current-location"
              select
              defaultValue={data.currentLocation}
              fullWidth
            >
              {profileLocations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>
          </LabeledField>

          <LabeledField htmlFor="profile-about-agency" label="Agência missionária">
            <TextField
              id="profile-about-agency"
              select
              defaultValue={data.missionaryAgency}
              fullWidth
            >
              {missionaryAgencies.map((agency) => (
                <MenuItem key={agency} value={agency}>
                  {agency}
                </MenuItem>
              ))}
            </TextField>
          </LabeledField>

          <LabeledField htmlFor="profile-about-faith-community" label="Comunidade de fé">
            <TextField
              id="profile-about-faith-community"
              select
              defaultValue={data.faithCommunity}
              fullWidth
            >
              {faithCommunities.map((community) => (
                <MenuItem key={community} value={community}>
                  {community}
                </MenuItem>
              ))}
            </TextField>
          </LabeledField>

          <LabeledField htmlFor="profile-about-prayer-requests" label="Pedidos de oração">
            <TextField
              id="profile-about-prayer-requests"
              defaultValue={data.prayerRequests}
              multiline
              minRows={3}
              fullWidth
            />
          </LabeledField>

          <LabeledField htmlFor="profile-about-life-verse" label="Versículo para a vida">
            <TextField
              id="profile-about-life-verse"
              defaultValue={data.lifeVerse}
              multiline
              minRows={3}
              fullWidth
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
            <PillButton type="button" tone="primaryFilled" size="small">
              Salvar
            </PillButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
