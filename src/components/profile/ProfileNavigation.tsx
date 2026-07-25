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
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
      }}
    >
      <Tabs
        value={0}
        variant="fullWidth"
        aria-label="Seções do perfil"
        sx={{
          minHeight: 52,
          '& .MuiTabs-indicator': {
            height: 3,
            bgcolor: 'mission.main',
          },
          '& .MuiTab-root': {
            minHeight: 52,
            color: 'primary.main',
            fontWeight: 700,
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
