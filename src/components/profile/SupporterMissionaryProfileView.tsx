'use client';

import { useState } from 'react';
import Image from 'next/image';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import DonationModal from '@/components/profile/DonationModal';
import ImpactProjectCard from '@/components/profile/ImpactProjectCard';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import { mockProfile, mockSavedPosts } from '@/mocks/profile';
import type { ProfileAboutData, ProfileData, SavedPost } from '@/types/profile';

type SupporterTabKey = 'sobre' | 'projetos' | 'postagens' | 'campanha';

const supporterTabs: { key: SupporterTabKey; label: string; mobileLabel?: string }[] = [
  { key: 'sobre', label: 'Sobre' },
  { key: 'projetos', label: 'Projetos de Impacto', mobileLabel: 'Projetos' },
  { key: 'postagens', label: 'Postagens' },
  { key: 'campanha', label: 'Campanha' },
];

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0, color: 'primary.main' }}>
        {label}:
      </Typography>
      <Typography variant="body2" color="text.primary">
        {value}
      </Typography>
    </Stack>
  );
}

function MissionaryAboutSection({ data }: { data: ProfileAboutData }) {
  return (
    <Card
      component="section"
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
          p: { xs: 2.5, sm: 3.5, md: 4 },
          '&:last-child': { pb: { xs: 2.5, sm: 3.5, md: 4 } },
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
            Sobre
          </Typography>

          {data.introduction && (
            <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
              {data.introduction}
            </Typography>
          )}

          <Divider />

          {data.missionHistory && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                Resumo da história em missões:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {data.missionHistory}
              </Typography>
            </Box>
          )}

          <Divider />

          <Stack spacing={1.25}>
            {data.originLocation && (
              <DetailRow label="Local de origem" value={data.originLocation} />
            )}
            {data.currentLocation && (
              <DetailRow label="Local de atuação atual" value={data.currentLocation} />
            )}
            {data.missionaryAgency && (
              <DetailRow label="Agência Missionária" value={data.missionaryAgency} />
            )}
            {data.faithCommunity && (
              <DetailRow label="Comunidade de fé" value={data.faithCommunity} />
            )}
          </Stack>

          {data.prayerRequests && (
            <>
              <Divider />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                  Pedidos de oração:
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  {data.prayerRequests}
                </Typography>
              </Box>
            </>
          )}

          {data.lifeVerse && (
            <Box sx={{ pt: 1 }}>
              <DetailRow label="Versículo para a vida" value={data.lifeVerse} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

type SupporterMissionaryProfileViewProps = {
  profile?: ProfileData;
  posts?: SavedPost[];
};

export default function SupporterMissionaryProfileView({
  profile = mockProfile,
  posts = mockSavedPosts,
}: SupporterMissionaryProfileViewProps) {
  const [activeTab, setActiveTab] = useState<SupporterTabKey>('sobre');
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtra rigorosamente para exibir apenas as postagens deste missionário específico
  const missionaryPosts = posts.filter(
    (p) =>
      p.authorUsername?.toLowerCase() === profile.username.toLowerCase() ||
      p.authorName?.toLowerCase() === profile.displayName.toLowerCase()
  );

  // Estados de oração interativos para as postagens
  const [prayedState, setPrayedState] = useState<
    Record<string, { count: number; active: boolean }>
  >(() => {
    const initial: Record<string, { count: number; active: boolean }> = {};
    posts.forEach((p) => {
      initial[p.id] = { count: p.prayersCount ?? 0, active: !!p.hasPrayed };
    });
    return initial;
  });

  // Estados de curtida interativos
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  // Estados de salvos interativos
  const [savedPostsState, setSavedPostsState] = useState<Record<string, boolean>>({});

  const togglePrayer = (id: string) => {
    setPrayedState((prev) => {
      const current = prev[id] || { count: 0, active: false };
      return {
        ...prev,
        [id]: {
          count: current.active ? current.count - 1 : current.count + 1,
          active: !current.active,
        },
      };
    });
  };

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string) => {
    setSavedPostsState((prev) => {
      const isCurrentlySaved = prev[id] ?? false;
      const next = !isCurrentlySaved;
      setToastMessage(
        next ? 'Postagem salva aos seus favoritos!' : 'Postagem removida dos salvos.'
      );
      return { ...prev, [id]: next };
    });
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copiado para a área de transferência!');
    }
  };

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }}>
      {/* 1. Header do Perfil do Missionário (Modo Apoiador: sem editar perfil, com botão Ofertar) */}
      <ProfileSummaryCard profile={profile} isOwnProfile={false} viewerRole="supporter" />

      {/* 2. Navegação em Abas */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue: SupporterTabKey) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Abas do perfil missionário"
          sx={{
            minHeight: { xs: 48, sm: 52 },
            '& .MuiTabs-indicator': {
              height: 3,
              bgcolor: 'mission.main',
            },
            '& .MuiTab-root': {
              minHeight: { xs: 48, sm: 52 },
              minWidth: { xs: 'max-content', md: 0 },
              px: { xs: 2.5, sm: 3.5 },
              color: 'primary.main',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 700,
              flex: { md: 1 },
              maxWidth: 'none',
            },
            '& .Mui-selected': {
              color: 'mission.main',
            },
          }}
        >
          {supporterTabs.map(({ key, label, mobileLabel }) => (
            <Tab
              key={key}
              value={key}
              label={
                <span>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {label}
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    {mobileLabel || label}
                  </Box>
                </span>
              }
              disableRipple
            />
          ))}
        </Tabs>
      </Paper>

      {/* 3. Conteúdo da Aba Ativa */}
      {activeTab === 'sobre' && <MissionaryAboutSection data={profile.about} />}

      {activeTab === 'projetos' && (
        <ImpactProjectCard
          project={profile.impactProject}
          isOwnProfile={false}
          missionaryName={profile.displayName}
        />
      )}

      {activeTab === 'postagens' && (
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          {missionaryPosts.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 3, sm: 4 },
                textAlign: 'center',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Nenhuma postagem publicada por este missionário ainda.
              </Typography>
            </Card>
          ) : (
            missionaryPosts.map((post) => {
              const prayer = prayedState[post.id] || {
                count: post.prayersCount ?? 0,
                active: !!post.hasPrayed,
              };
              const isLiked = likedPosts[post.id] ?? false;
              const isSaved = savedPostsState[post.id] ?? false;
              const totalLikes = (post.likesCount ?? 0) + (isLiked ? 1 : 0);

              return (
                <Card
                  key={post.id}
                  component="article"
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
                    <Stack spacing={{ xs: 1.75, sm: 2 }}>
                      {/* Header da Postagem: Autor + Badge */}
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: 'center', minWidth: 0 }}
                        >
                          <Avatar
                            sx={{
                              width: { xs: 44, sm: 48 },
                              height: { xs: 44, sm: 48 },
                              bgcolor: 'supporter.light',
                              color: 'common.black',
                              border: '1.5px solid',
                              borderColor: 'divider',
                              flexShrink: 0,
                            }}
                          >
                            <PersonIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              color="text.primary"
                              sx={{ fontWeight: 700, lineHeight: 1.2 }}
                            >
                              {post.authorName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                            >
                              {post.createdAt}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          label={
                            post.type === 'prayer'
                              ? 'ORAÇÃO'
                              : post.type === 'campaign'
                                ? 'CAMPANHA'
                                : 'ATUALIZAÇÃO'
                          }
                          size="small"
                          sx={{
                            bgcolor:
                              post.type === 'prayer'
                                ? 'rgba(234, 241, 250, 0.85)'
                                : post.type === 'campaign'
                                  ? 'rgba(254, 243, 199, 0.9)'
                                  : 'rgba(234, 241, 250, 0.85)',
                            color: post.type === 'campaign' ? 'warning.dark' : 'primary.main',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            letterSpacing: '0.05em',
                            borderRadius: 1.5,
                            px: 0.5,
                          }}
                        />
                      </Stack>

                      {/* Conteúdo da Postagem */}
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          lineHeight: 1.6,
                        }}
                      >
                        {post.content}
                      </Typography>

                      {/* Imagem opcional */}
                      {post.imageUrl && (
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: { sm: 640 },
                            aspectRatio: '16 / 10',
                            alignSelf: 'center',
                            overflow: 'hidden',
                            borderRadius: 2,
                            bgcolor: 'surface.main',
                          }}
                        >
                          <Image
                            src={post.imageUrl}
                            alt="Imagem da postagem"
                            fill
                            sizes="(max-width: 600px) 100vw, 640px"
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>
                      )}

                      {/* Barra de Ações Interativas (Sem bloqueios para apoiador autenticado) */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          pt: 0.5,
                        }}
                      >
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <IconButton
                            aria-label={isLiked ? 'Descurtir postagem' : 'Curtir postagem'}
                            size="small"
                            color="primary"
                            onClick={() => toggleLike(post.id)}
                          >
                            {isLiked ? (
                              <FavoriteIcon sx={{ fontSize: 20, color: 'error.main' }} />
                            ) : (
                              <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 600, mr: 1, minWidth: 20 }}
                          >
                            {totalLikes}
                          </Typography>

                          <IconButton
                            aria-label={isSaved ? 'Remover dos salvos' : 'Salvar postagem'}
                            size="small"
                            color="primary"
                            onClick={() => toggleSave(post.id)}
                          >
                            {isSaved ? (
                              <BookmarkIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                            ) : (
                              <BookmarkBorderOutlinedIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>

                          <IconButton
                            aria-label="Compartilhar postagem"
                            size="small"
                            color="primary"
                            onClick={handleShare}
                          >
                            <ShareOutlinedIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Stack>

                        {/* Botão de Ação "Orei · {count}" */}
                        <PillButton
                          tone={prayer.active ? 'cta' : 'primarySoftOutline'}
                          size="small"
                          onClick={() => togglePrayer(post.id)}
                          sx={{
                            px: { xs: 1.75, sm: 2.25 },
                            py: 0.5,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            fontWeight: 600,
                            borderColor: 'primary.main',
                          }}
                        >
                          Orei · {prayer.count}
                        </PillButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      )}

      {activeTab === 'campanha' && (
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Stack spacing={2.5}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                Campanhas Ativas ({profile.campaignsCount ?? 4})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Apoie as necessidades emergenciais e contínuas de sustentação e estrutura
                missionária de {profile.displayName}.
              </Typography>

              <Box sx={{ pt: 1 }}>
                <PillButton
                  tone="missionFilled"
                  size="medium"
                  onClick={() => setDonationModalOpen(true)}
                  sx={{
                    minHeight: 44,
                    px: 3,
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    bgcolor: 'mission.main',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'mission.dark' },
                    boxShadow: '0 2px 8px rgba(230, 81, 0, 0.25)',
                  }}
                >
                  <VolunteerActivismIcon sx={{ fontSize: 20, mr: 1 }} />
                  Ofertar na Campanha
                </PillButton>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Modal de Oferta */}
      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        missionaryName={profile.displayName}
        isOwnProfile={false}
      />

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          variant="filled"
          role="status"
          aria-live="polite"
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
          {toastMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
