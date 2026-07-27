'use client';

import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

const profileSections = ['Sobre', 'Projetos de Impacto', 'Postagens', 'Campanha'] as const;

export default function ProfileNavigation() {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={0}
        variant="scrollable"
        scrollButtons={false}
        aria-label="Seções do perfil"
        sx={{
          minHeight: { xs: 48, sm: 52 },
          '& .MuiTabs-indicator': {
            height: 3,
            bgcolor: 'mission.main',
          },
          '& .MuiTab-root': {
            minHeight: { xs: 48, sm: 52 },
            minWidth: { xs: 'max-content', md: 0 },
            px: { xs: 2, sm: 3 },
            color: 'primary.main',
            fontSize: { xs: '0.78rem', sm: '0.875rem' },
            fontWeight: 700,
            flex: { md: 1 },
          },
          '& .Mui-selected': {
            color: 'mission.main',
          },
        }}
      >
        {profileSections.map((section) => (
          <Tab key={section} label={section} disableRipple />
        ))}
      </Tabs>
    </Paper>
  );
}
