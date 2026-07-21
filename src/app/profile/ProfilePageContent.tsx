'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/common/Logo';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import { CardContent, Card, Avatar, Stack, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export default function ProfilePageContent() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageNavbar maxWidth="md">
        <Logo size="sm" href="/profile" onDark />
        <PageNavbarActions>
          <ThemeToggle />
        </PageNavbarActions>
      </PageNavbar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Stack direction="column">
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'space-between' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      @allanaoliveira
                    </Typography>
                    <Button variant="contained" color="supporter" size="small">
                      Seguir
                    </Button>
                    <Button variant="contained" color="mission" size="small">
                      Doar
                    </Button>
                  </Stack>
                  <Typography variant="h6">Allana Oliveira</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Vivendo sempre uma aventura nova.
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
