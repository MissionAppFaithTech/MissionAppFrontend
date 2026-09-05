'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import GuestCtaBanner from '@/components/common/GuestCtaBanner';
import MissionaryCampaignSection from '@/components/campaign/MissionaryCampaignSection';
import ImpactProjectCard from '@/components/profile/ImpactProjectCard';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import VisitorProfileAboutSection from '@/components/profile/VisitorProfileAboutSection';
import VisitorProfilePostsSection from '@/components/profile/VisitorProfilePostsSection';
import { getMockCampaignForMissionary } from '@/mocks/campaign';
import { mockProfile, mockSavedPosts } from '@/mocks/profile';
import type { CampaignData } from '@/types/campaign';
import type { ProfileData, SavedPost } from '@/types/profile';

type VisitorTabKey = 'sobre' | 'projetos' | 'postagens' | 'campanha';

const visitorTabs: { key: VisitorTabKey; label: string; mobileLabel?: string }[] = [
  { key: 'sobre', label: 'Sobre' },
  { key: 'projetos', label: 'Projetos de Impacto', mobileLabel: 'Projetos' },
  { key: 'postagens', label: 'Postagens' },
  { key: 'campanha', label: 'Campanha' },
];

type VisitorProfileViewProps = {
  profile?: ProfileData;
  posts?: SavedPost[];
  campaign?: CampaignData | null;
};

export default function VisitorProfileView({
  profile = mockProfile,
  posts = mockSavedPosts,
  campaign,
}: VisitorProfileViewProps) {
  const [activeTab, setActiveTab] = useState<VisitorTabKey>('sobre');
  const missionaryCampaign =
    campaign !== undefined ? campaign : getMockCampaignForMissionary(profile.username);

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
          {visitorTabs.map(({ key, label, mobileLabel }) => (
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

      {/* 4. Conteúdo Dinâmico por Aba */}
      {activeTab === 'sobre' && <VisitorProfileAboutSection data={profile.about} />}

      {activeTab === 'projetos' && (
        <ImpactProjectCard
          project={profile.impactProject}
          isOwnProfile={false}
          missionaryName={profile.displayName}
        />
      )}

      {activeTab === 'postagens' && <VisitorProfilePostsSection posts={posts} />}

      {activeTab === 'campanha' && (
        <MissionaryCampaignSection
          campaign={missionaryCampaign}
          missionaryName={profile.displayName}
          isOwnProfile={false}
        />
      )}
    </Stack>
  );
}
