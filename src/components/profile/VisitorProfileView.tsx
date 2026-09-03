'use client';

import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import GuestCtaBanner from '@/components/common/GuestCtaBanner';
import LockedContentNotice from '@/components/common/LockedContentNotice';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import VisitorProfileAboutSection from '@/components/profile/VisitorProfileAboutSection';
import VisitorProfilePostsSection from '@/components/profile/VisitorProfilePostsSection';
import { mockProfile, mockSavedPosts } from '@/mocks/profile';
import type { ProfileData, SavedPost } from '@/types/profile';

type VisitorTabKey = 'sobre' | 'postagens' | 'projetos' | 'campanha';

const visitorTabs: { key: VisitorTabKey; label: string }[] = [
  { key: 'sobre', label: 'Sobre' },
  { key: 'postagens', label: 'Postagens' },
  { key: 'projetos', label: 'Projetos' },
  { key: 'campanha', label: 'Campanha' },
];

type VisitorProfileViewProps = {
  profile?: ProfileData;
  posts?: SavedPost[];
};

export default function VisitorProfileView({
  profile = mockProfile,
  posts = mockSavedPosts,
}: VisitorProfileViewProps) {
  const [activeTab, setActiveTab] = useState<VisitorTabKey>('sobre');

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }}>
      {/* 1. Cartão Principal do Perfil do Missionário (Modo Visitante) */}
      <ProfileSummaryCard
        profile={profile}
        isOwnProfile={false}
        followHref="/select-role"
        supportHref="/select-role"
        contactHref="/login"
      />

      {/* 2. Banner de Call to Action para Usuário Não Logado */}
      <GuestCtaBanner
        title="Crie sua conta para acompanhar"
        description="Com uma conta você segue missionários, recebe atualizações do campo e apoia campanhas diretamente pelo app."
        buttonText="Criar conta"
        buttonHref="/select-role"
      />

      {/* 3. Navegação em Abas do Perfil */}
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
          onChange={(_, newValue: VisitorTabKey) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Abas do perfil público"
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
          {visitorTabs.map(({ key, label }) => (
            <Tab key={key} value={key} label={label} disableRipple />
          ))}
        </Tabs>
      </Paper>

      {/* 4. Conteúdo Dinâmico por Aba */}
      {activeTab === 'sobre' && <VisitorProfileAboutSection data={profile.about} />}

      {activeTab === 'postagens' && <VisitorProfilePostsSection posts={posts} />}

      {activeTab === 'projetos' && (
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
                Projetos de Impacto ({profile.projectsCount ?? 25})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Iniciativas de desenvolvimento comunitário, plantação de igrejas e alfabetização na África do Sul.
              </Typography>
              <LockedContentNotice
                title="Acesse relatórios e fotos de projetos"
                description="Cadastre-se para ver detalhes de metas, relatórios financeiros e impacto em campo de cada projeto."
              />
            </Stack>
          </CardContent>
        </Card>
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
                Apoie as necessidades emergenciais e contínuas de sustentação e estrutura missionária.
              </Typography>
              <LockedContentNotice
                title="Contribua com esta missão"
                description="Cadastre-se para fazer doações seguras, acompanhar recibos e manter contato direto com o missionário."
                registerHref="/select-role"
              />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
