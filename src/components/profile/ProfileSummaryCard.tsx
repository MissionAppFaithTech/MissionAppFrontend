'use client';

import { useState } from 'react';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonIcon from '@mui/icons-material/Person';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import ProfilePhotoAddButton from '@/components/profile/ProfilePhotoAddButton';
import ContactModal from '@/components/profile/ContactModal';
import DonationModal from '@/components/profile/DonationModal';
import type { ProfileData } from '@/types/profile';

type ProfileSummaryCardProps = {
  profile: ProfileData;
  isOwnProfile?: boolean;
  viewerRole?: 'visitor' | 'supporter' | 'missionary';
  followHref?: string;
  supportHref?: string;
  contactHref?: string;
  isFollowingInitial?: boolean;
  onFollowToggle?: (following: boolean) => void;
  onDonate?: () => void;
};

const actionSx = {
  px: { xs: 1.5, sm: 1.75 },
  py: { xs: 0.5, sm: 0.25 },
  fontSize: { xs: '0.8125rem', sm: '0.8125rem' },
  fontWeight: 600,
  whiteSpace: 'nowrap' as const,
  minHeight: { xs: 44, sm: 32 },
  justifyContent: 'center',
};

export default function ProfileSummaryCard({
  profile,
  isOwnProfile = true,
  viewerRole = 'visitor',
  followHref,
  supportHref,
  isFollowingInitial = false,
  onFollowToggle,
  onDonate,
}: ProfileSummaryCardProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);

  const {
    username,
    displayName,
    roleDescription,
    location = 'Cidade do Cabo, África do Sul',
    projectsCount = 25,
    postsCount = 3,
    campaignsCount = 4,
    supportersCount = '1.2k',
    followingCount = 12,
    role = 'missionary',
  } = profile;

  const isSupporterProfile = role === 'supporter';
  const isOwnSupporter = isOwnProfile && isSupporterProfile;
  const showPhotoButton = isOwnProfile;
  const showLocation = !isSupporterProfile;
  const showShare = !isOwnSupporter;

  const statsList = isSupporterProfile
    ? []
    : isOwnProfile
      ? [
          { label: 'projetos', value: projectsCount },
          { label: 'postagens', value: postsCount },
          { label: 'campanhas', value: campaignsCount },
          { label: 'apoiadores', value: supportersCount },
          { label: 'seguindo', value: followingCount },
        ]
      : [
          { label: 'projetos', value: projectsCount },
          { label: 'postagens', value: postsCount },
          { label: 'campanhas', value: campaignsCount },
        ];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToastOpen(true);
    }
  };

  const editHref = isSupporterProfile ? '/profile/supporter/edit-profile' : '/profile/edit-profile';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'var(--app-shadow-sm)',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          '&:last-child': { pb: { xs: 2, sm: 3 } },
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            sx={{
              alignItems: { xs: 'stretch', sm: 'flex-start' },
              justifyContent: 'space-between',
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 1.75, sm: 2.5 }}
              sx={{ alignItems: 'flex-start', minWidth: 0, flex: 1 }}
            >
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  sx={{
                    width: { xs: 72, sm: 88, md: 96 },
                    height: { xs: 72, sm: 88, md: 96 },
                    bgcolor: 'avatar.main',
                    color: 'avatar.contrastText',
                    border: '1.5px solid',
                    borderColor: 'divider',
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: 44, sm: 54, md: 60 } }} />
                </Avatar>
                {showPhotoButton ? <ProfilePhotoAddButton /> : null}
              </Box>

              <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                >
                  @{username}
                </Typography>
                <Typography
                  variant="h5"
                  component="h1"
                  color="text.primary"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {displayName}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    pt: 0.25,
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
                  }}
                >
                  {roleDescription}
                </Typography>
                {showLocation ? (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      alignItems: 'center',
                      pt: 0.25,
                      color: (theme) =>
                        theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main',
                    }}
                  >
                    <PlaceOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        color: 'inherit',
                        wordBreak: 'break-word',
                      }}
                    >
                      {location}
                    </Typography>
                  </Stack>
                ) : null}
              </Stack>
            </Stack>

            {isOwnSupporter ? (
              <PillButton
                href={editHref}
                tone="cta"
                size="small"
                sx={{ ...actionSx, alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
              >
                Editar perfil
              </PillButton>
            ) : null}

            {statsList.length > 0 ? (
              <Stack
                direction="row"
                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                useFlexGap
                sx={{
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                  alignItems: 'flex-start',
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                {statsList.map((stat) => (
                  <Stack
                    key={stat.label}
                    spacing={0.25}
                    sx={{ alignItems: 'center', minWidth: { xs: 56, sm: 64 } }}
                  >
                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.125rem', sm: '1.25rem' },
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : null}
          </Stack>

          {!isOwnSupporter ? (
            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 1.25 }}
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {isOwnProfile ? (
                <>
                  <PillButton href={editHref} tone="cta" size="small" sx={actionSx}>
                    Editar perfil
                  </PillButton>
                  <PillButton
                    tone="primarySoftOutline"
                    size="small"
                    onClick={() => setContactModalOpen(true)}
                    sx={actionSx}
                  >
                    Contato
                  </PillButton>
                </>
              ) : (
                <>
                  {followHref && viewerRole === 'visitor' ? (
                    <PillButton href={followHref} tone="cta" size="small" sx={actionSx}>
                      Seguir
                    </PillButton>
                  ) : (
                    <PillButton
                      tone="cta"
                      size="small"
                      onClick={() => {
                        const next = !isFollowing;
                        setIsFollowing(next);
                        onFollowToggle?.(next);
                      }}
                      sx={actionSx}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </PillButton>
                  )}
                  <PillButton
                    href={supportHref && viewerRole === 'visitor' ? supportHref : undefined}
                    tone="missionFilled"
                    size="small"
                    onClick={
                      supportHref && viewerRole === 'visitor'
                        ? undefined
                        : () => {
                            setDonationModalOpen(true);
                            onDonate?.();
                          }
                    }
                    sx={actionSx}
                  >
                    Ofertar
                  </PillButton>
                  <PillButton
                    tone="primarySoftOutline"
                    size="small"
                    onClick={() => setContactModalOpen(true)}
                    sx={actionSx}
                  >
                    Entrar em contato
                  </PillButton>
                </>
              )}

              {showShare ? (
                <PillButton
                  tone="primarySoftOutline"
                  size="small"
                  aria-label="Compartilhar perfil"
                  onClick={handleShare}
                  sx={{
                    ...actionSx,
                    px: { xs: 1.25, sm: 0.75 },
                    minWidth: { xs: 44, sm: 32 },
                  }}
                >
                  <ShareOutlinedIcon sx={{ fontSize: 20 }} aria-hidden />
                </PillButton>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>

      <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        contact={profile.contact}
        isOwnProfile={isOwnProfile}
      />

      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        missionaryName={displayName}
        isOwnProfile={isOwnProfile}
        financialConfig={profile.financial}
      />

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'brandFill.main' : 'primary.main'),
            color: 'common.white',
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
          Link do perfil copiado para compartilhamento
        </Alert>
      </Snackbar>
    </Card>
  );
}
