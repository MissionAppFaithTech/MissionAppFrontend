'use client';

import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import type { ProfileAboutData } from '@/types/profile';

type ProfileAboutSectionProps = {
  data: ProfileAboutData;
  onEditAction: () => void;
};

const textSx = { whiteSpace: 'pre-line', overflowWrap: 'anywhere' } as const;

function hasText(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function LabeledText({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography component="h3" variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={textSx}>
        {value}
      </Typography>
    </Box>
  );
}

/** Prayer requests and life verse are shown as quotes (RF 10.7.1). */
function QuoteBlock({ label, value }: { label: string; value: string }) {
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
        <Typography variant="body2" sx={{ ...textSx, fontStyle: 'italic' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ProfileAboutSection({ data, onEditAction }: ProfileAboutSectionProps) {
  const details = [
    { label: 'Local de origem', value: data.originLocation },
    { label: 'Local de atuação atual', value: data.currentLocation },
    { label: 'Agência missionária', value: data.missionaryAgency },
    // The faith community stays loaded in the profile store but is not shown here.
  ].filter((row): row is { label: string; value: string } => hasText(row.value));

  const quotes = [
    { label: 'Pedidos de oração', value: data.prayerRequests },
    { label: 'Versículo para a vida', value: data.lifeVerse },
  ].filter((row): row is { label: string; value: string } => hasText(row.value));

  const hasStory = hasText(data.introduction) || hasText(data.missionHistory);
  const hasEditableContent =
    hasStory || quotes.length > 0 || hasText(data.originLocation) || hasText(data.currentLocation);

  const blocks = [
    hasStory ? (
      <Stack key="story" spacing={2}>
        {hasText(data.introduction) ? (
          <Typography variant="body1" sx={textSx}>
            {data.introduction}
          </Typography>
        ) : null}
        {hasText(data.missionHistory) ? (
          <LabeledText label="Resumo da minha história em missões" value={data.missionHistory} />
        ) : null}
      </Stack>
    ) : null,
    details.length > 0 ? (
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
            <Typography
              component="dt"
              variant="body2"
              sx={{ fontWeight: 700, mt: { xs: 1, sm: 0 } }}
            >
              {label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ ...textSx, m: 0 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    ) : null,
    quotes.length > 0 ? (
      <Stack key="quotes" spacing={2.5}>
        {quotes.map((quote) => (
          <QuoteBlock key={quote.label} {...quote} />
        ))}
      </Stack>
    ) : null,
  ].filter(Boolean);

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

          {!hasEditableContent ? (
            <Box
              sx={{
                py: { xs: 3.5, sm: 5 },
                px: { xs: 2, sm: 3 },
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                border: '1.5px dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <AutoStoriesOutlinedIcon
                aria-hidden
                sx={{ fontSize: 32, color: 'primary.main', mb: 1.5 }}
              />
              <Typography
                component="h3"
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1rem', sm: '1.125rem' } }}
              >
                Compartilhe sua história em missões
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 460, mb: 3, lineHeight: 1.6 }}
              >
                Conte sua trajetória, onde você atua, pedidos de oração e seu versículo. Assim
                apoiadores conhecem melhor o seu chamado.
              </Typography>
              <PillButton
                tone="mission"
                size="medium"
                onClick={onEditAction}
                sx={{ px: 3, width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
              >
                Preencher o Sobre
              </PillButton>
            </Box>
          ) : null}

          {blocks.map((block, index) => (
            <Stack key={index} spacing={{ xs: 2, sm: 2.5 }}>
              {index > 0 ? <Divider /> : null}
              {block}
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
