'use client';

import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Logo from '@/components/common/Logo';
import ProfileAboutSection from '@/components/profile/ProfileAboutSection';
import ProfileNavigation from '@/components/profile/ProfileNavigation';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import { mockProfile } from '@/mocks/profile';

export default function ProfilePageContent() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageNavbar maxWidth="lg">
        <Logo size="sm" href="/profile" variant="dark" />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <TextField
            placeholder="Pesquisar missionário"
            size="small"
            aria-label="Pesquisar missionário"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </InputAdornment>
                ),
              },
              htmlInput: {
                readOnly: true,
              },
            }}
            sx={{
              width: '100%',
              maxWidth: 280,
              '& .MuiOutlinedInput-root': {
                height: { xs: 34, sm: 36 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                px: { xs: 0.5, sm: 1 },
              },
              '& .MuiInputAdornment-root': {
                mr: { xs: 0.25, sm: 1 },
              },
            }}
          />
        </Box>

        <PageNavbarActions>
          <Avatar
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              bgcolor: 'supporter.light',
              color: 'common.black',
            }}
          >
            <PersonIcon />
          </Avatar>
        </PageNavbarActions>
      </PageNavbar>

      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Stack spacing={2}>
          <ProfileSummaryCard profile={mockProfile} />
          <ProfileNavigation />
          <ProfileAboutSection data={mockProfile.about} />
        </Stack>
      </Container>
    </Box>
  );
}
