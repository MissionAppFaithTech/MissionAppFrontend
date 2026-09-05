'use client';

import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FollowedMissionary } from '@/types/profile';

type FollowedMissionariesSectionProps = {
  missionaries: FollowedMissionary[];
};

export default function FollowedMissionariesSection({
  missionaries,
}: FollowedMissionariesSectionProps) {
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
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Typography
            variant="h6"
            component="h2"
            color="primary.main"
            sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.125rem' } }}
          >
            Missionários em destaque
          </Typography>

          <Stack spacing={0} divider={<Divider />}>
            {missionaries.map((missionary) => (
              <Box
                key={missionary.id}
                component={Link}
                href={`/profile/missionario/${missionary.username}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 1, sm: 1.5 },
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 44, sm: 52 },
                      height: { xs: 44, sm: 52 },
                      bgcolor: 'supporter.light',
                      color: 'common.black',
                      border: '1.5px solid',
                      borderColor: 'divider',
                      flexShrink: 0,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: { xs: 28, sm: 34 } }} />
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.primary"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {missionary.displayName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.78125rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {missionary.location} · {missionary.supportersCount}
                    </Typography>
                  </Box>
                </Stack>

                <ChevronRightIcon
                  sx={{ color: 'text.secondary', fontSize: 20, ml: 1, flexShrink: 0 }}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
