'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { focusVisibleSx } from '@/theme/theme';
import type { ProfileAboutData } from '@/types/profile';
import AboutDivider from '@/components/profile/AboutDivider';

type ProfileAboutSectionProps = {
  data: ProfileAboutData;
  onEditAction: () => void;
};

const textSx = { whiteSpace: 'pre-line', overflowWrap: 'anywhere' } as const;

/** What the owner sees for a field they have not filled yet. */
export const ABOUT_EMPTY_VALUE = 'A definir';

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

type FieldValueProps = {
  label: string;
  value?: string;
  quote?: boolean;
  /** Opens the "Sobre" editor. */
  onEdit: () => void;
};

/**
 * The value, or a "A definir" button that opens the editor (muted italics; the
 * text itself says it is empty, so color is not the only cue).
 */
function FieldValue({ label, value, quote = false, onEdit }: FieldValueProps) {
  if (!hasText(value)) {
    return (
      <ButtonBase
        onClick={onEdit}
        aria-label={`Definir ${label}`}
        sx={(theme) => ({
          minHeight: 44,
          px: 0.5,
          ml: -0.5,
          borderRadius: 1,
          justifyContent: 'flex-start',
          color: 'text.secondary',
          fontStyle: 'italic',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          // Clear in both themes: the text takes the main text color over a 14% tint
          // of that same color (navy on light, white on dark).
          '&:hover, &:active': {
            color: 'text.primary',
            bgcolor: 'color-mix(in srgb, var(--mui-palette-text-primary) 14%, transparent)',
            textDecorationThickness: '2px',
          },
          ...focusVisibleSx(theme),
        })}
      >
        <Typography component="span" variant="body2" sx={{ fontStyle: 'inherit' }}>
          {ABOUT_EMPTY_VALUE}
        </Typography>
      </ButtonBase>
    );
  }
  return (
    <Typography variant="body2" sx={{ ...textSx, fontStyle: quote ? 'italic' : undefined }}>
      {value}
    </Typography>
  );
}

type FieldProps = { label: string; value?: string; onEdit: () => void };

function LabeledText({ label, value, onEdit }: FieldProps) {
  return (
    <Box>
      <Typography component="h3" variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {label}
      </Typography>
      <FieldValue label={label} value={value} onEdit={onEdit} />
    </Box>
  );
}

/** Prayer requests and life verse are shown as quotes (RF 10.7.1). */
function QuoteBlock({ label, value, onEdit }: FieldProps) {
  if (!hasText(value)) return <LabeledText label={label} value={value} onEdit={onEdit} />;
  return (
    <Box component="figure" sx={{ m: 0 }}>
      <Typography component="figcaption" variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
        {label}
      </Typography>
      <Box
        component="blockquote"
        sx={{
          m: 0,
          pl: 2,
          py: 0.5,
          borderLeft: '4px solid',
          borderColor: 'secondary.main',
        }}
      >
        <FieldValue label={label} value={value} quote onEdit={onEdit} />
      </Box>
    </Box>
  );
}

/**
 * The owner's "Sobre": every field they can fill is listed, with "A definir"
 * where nothing was filled yet, so it is clear what is still missing.
 */
export default function ProfileAboutSection({ data, onEditAction }: ProfileAboutSectionProps) {
  const details = [
    { label: 'Local de origem', value: data.originLocation },
    { label: 'Local de atuação atual', value: data.currentLocation },
    { label: 'Agência missionária', value: data.missionaryAgency },
    { label: 'Comunidade de fé', value: data.faithCommunity },
  ];

  const blocks = [
    <LabeledText key="bio" label="Biografia" value={data.introduction} onEdit={onEditAction} />,
    <LabeledText
      key="story"
      label="Resumo da minha história em missões"
      value={data.missionHistory}
      onEdit={onEditAction}
    />,
    <Box
      key="details"
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'max-content 1fr' },
        columnGap: 2,
        rowGap: { xs: 0.25, sm: 1.25 },
      }}
    >
      {details.map(({ label, value }) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Typography component="dt" variant="body2" sx={{ fontWeight: 700, mt: { xs: 1, sm: 0 } }}>
            {label}
          </Typography>
          <Box component="dd" sx={{ m: 0, minWidth: 0 }}>
            <FieldValue label={label} value={value} onEdit={onEditAction} />
          </Box>
        </Box>
      ))}
    </Box>,
    <QuoteBlock
      key="prayer"
      label="Pedidos de oração"
      value={data.prayerRequests}
      onEdit={onEditAction}
    />,
    <QuoteBlock
      key="verse"
      label="Versículo para a vida"
      value={data.lifeVerse}
      onEdit={onEditAction}
    />,
  ];

  return (
    <Card
      component="section"
      aria-labelledby="profile-about-title"
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
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography
              id="profile-about-title"
              component="h2"
              variant="h6"
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              Sobre
            </Typography>
            <PillButton
              tone="primarySoftOutline"
              size="small"
              aria-label="Editar informações do Sobre"
              onClick={onEditAction}
              startIcon={<EditOutlinedIcon aria-hidden />}
              sx={{
                minWidth: 44,
                px: { xs: 1, sm: 1.75 },
                '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.5 }, ml: 0 },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Editar
              </Box>
            </PillButton>
          </Stack>

          {/* NOTE: a divider between every part (bio, story, details, prayer, verse) */}
          {blocks.map((block, index) => (
            <Stack key={index} spacing={{ xs: 2, sm: 2.5 }}>
              {index > 0 ? <AboutDivider /> : null}
              {block}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
