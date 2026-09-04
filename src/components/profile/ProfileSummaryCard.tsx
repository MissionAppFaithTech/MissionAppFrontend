'use client';

import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonIcon from '@mui/icons-material/Person';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
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

export default function ProfileSummaryCard({
  profile,
  isOwnProfile = true,
  viewerRole = 'visitor',
  followHref,
  supportHref,
  isFollowingInitial = true,
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
    supportedCampaignsCount = 4,
    role = 'missionary',
  } = profile;

  const isSupporter = role === 'supporter';

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToastOpen(true);
    }
  };

  /** Itens de estatísticas exibidos conforme o tipo de perfil */
  const statsList = isSupporter
    ? [
        { label: 'seguindo', value: followingCount },
        { label: 'campanhas apoiadas', value: supportedCampaignsCount },
      ]
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

  const actionSx = {
    px: { xs: 2, sm: 2.5 },
    py: { xs: 0.75, sm: 1 },
    fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    minHeight: 44,
    flex: { xs: '1 1 auto', sm: 'none' },
    justifyContent: 'center',
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 3.5 } },
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          {/* Seção Superior: Avatar e Identificação do Usuário */}
          <Stack
            direction={{ xs: 'row', sm: 'row' }}
            spacing={{ xs: 1.75, sm: 2.5, md: 3 }}
            sx={{ alignItems: 'flex-start', minWidth: 0 }}
          >
            {/* Avatar com Badge Plus Azul em Fundo Branco */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                sx={{
                  width: { xs: 72, sm: 88, md: 100 },
                  height: { xs: 72, sm: 88, md: 100 },
                  bgcolor: 'supporter.light',
                  color: 'common.black',
                  border: '1.5px solid',
                  borderColor: 'divider',
                }}
              >
                <PersonIcon sx={{ fontSize: { xs: 44, sm: 54, md: 64 } }} />
              </Avatar>
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  right: -2,
                  bottom: 2,
                  width: { xs: 24, sm: 28 },
                  height: { xs: 24, sm: 28 },
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                  border: '1.5px solid',
                  borderColor: 'divider',
                  boxShadow: 1,
                }}
              >
                <AddIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
              </Box>
            </Box>

            {/* Informações Textuais */}
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
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.625rem' },
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {displayName}
              </Typography>
              <Typography
                variant="body1"
                color="primary.main"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  pt: 0.25,
                }}
              >
                {roleDescription}
              </Typography>

              {/* Localização com ícone de pin */}
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', pt: 0.25, color: 'primary.main' }}
              >
                <PlaceOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  }}
                >
                  {location}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Linha Divisora Superior */}
          <Divider />

          {/* Seção Central de Estatísticas (Centralizada em Celular e Tablet) */}
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2.5, md: 4 }}
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              py: 0.5,
              width: '100%',
            }}
          >
            {statsList.map((stat) => (
              <Stack
                key={stat.label}
                spacing={0.25}
                sx={{
                  alignItems: 'center',
                  minWidth: { xs: 60, sm: 80, md: 90 },
                  textAlign: 'center',
                  flex: { xs: '1 1 calc(33.333% - 16px)', sm: '1 1 auto' },
                  maxWidth: { xs: 'calc(50% - 12px)', sm: 'none' },
                }}
              >
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
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

          {/* Linha Divisora Inferior */}
          <Divider />

          {/* Seção Inferior: Botões de Ação */}
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            useFlexGap
            sx={{
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {isOwnProfile ? (
              <>
                <PillButton
                  href={isSupporter ? '/profile/supporter/edit-profile' : '/profile/edit-profile'}
                  tone="missionFilled"
                  size="medium"
                  sx={{
                    ...actionSx,
                    bgcolor: 'mission.main',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'mission.dark' },
                  }}
                >
                  Editar perfil
                </PillButton>
                {!isSupporter && (
                  <PillButton
                    href="/profile/financeiro"
                    tone="primarySoftOutline"
                    size="medium"
                    sx={actionSx}
                  >
                    Configurar Doações
                  </PillButton>
                )}
                <PillButton
                  tone="primarySoftOutline"
                  size="medium"
                  onClick={() => setContactModalOpen(true)}
                  sx={actionSx}
                >
                  Contato
                </PillButton>
              </>
            ) : (
              <>
                {/* Botão Ofertar para apoiadores / visitantes (não possui editar perfil) */}
                <PillButton
                  href={supportHref && viewerRole === 'visitor' ? supportHref : undefined}
                  tone="missionFilled"
                  size="medium"
                  onClick={
                    supportHref && viewerRole === 'visitor'
                      ? undefined
                      : () => {
                          setDonationModalOpen(true);
                          onDonate?.();
                        }
                  }
                  sx={{
                    ...actionSx,
                    bgcolor: 'mission.main',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'mission.dark' },
                  }}
                >
                  <VolunteerActivismIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Ofertar
                </PillButton>

                {/* Botão Seguir / Seguindo com suporte a link ou toggle */}
                {followHref && viewerRole === 'visitor' ? (
                  <PillButton
                    href={followHref}
                    tone="primarySoftOutline"
                    size="medium"
                    sx={actionSx}
                  >
                    Seguir
                  </PillButton>
                ) : (
                  <PillButton
                    tone={isFollowing ? 'primarySoftOutline' : 'cta'}
                    size="medium"
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
                  tone="primarySoftOutline"
                  size="medium"
                  onClick={() => setContactModalOpen(true)}
                  sx={actionSx}
                >
                  Contato
                </PillButton>
              </>
            )}

            {/* Botão de Compartilhar com Ícone e Copiar URL */}
            <PillButton
              tone="primarySoftOutline"
              size="medium"
              aria-label="Compartilhar perfil"
              onClick={handleShare}
              sx={{
                ...actionSx,
                px: { xs: 1.5, sm: 1.75 },
                minWidth: 44,
              }}
            >
              <ShareOutlinedIcon sx={{ fontSize: 20 }} />
            </PillButton>
          </Stack>
        </Stack>
      </CardContent>

      {/* Modal de Contato com WhatsApp e E-mail */}
      <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        contact={profile.contact}
        isOwnProfile={isOwnProfile}
      />

      {/* Modal de Doação / Oferta */}
      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        missionaryName={displayName}
        isOwnProfile={isOwnProfile}
        financialConfig={profile.financial}
      />

      {/* Toast Notification no Padrão de Cores do Sistema */}
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
            bgcolor: 'primary.main',
            color: 'common.white',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              color: 'common.white',
            },
          }}
        >
          Link do perfil copiado para compartilhamento
        </Alert>
      </Snackbar>
    </Card>
  );
}
