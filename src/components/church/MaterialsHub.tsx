'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PillButton from '@/components/common/PillButton';
import {
  MATERIAL_CATEGORIES,
  REFERENCE_INSTITUTIONS,
  type MaterialCategory,
  type ReferenceInstitution,
} from './churchGuideData';

export default function MaterialsHub() {
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>('Todos');

  const filteredInstitutions = REFERENCE_INSTITUTIONS.filter((inst: ReferenceInstitution) => {
    if (selectedCategory === 'Todos') return true;
    return inst.categories.includes(selectedCategory);
  });

  return (
    <Box component="section" aria-labelledby="materials-heading" sx={{ width: '100%' }}>
      <Box sx={{ mb: 3.5, textAlign: 'left' }}>
        <Typography
          id="materials-heading"
          component="h3"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
          }}
        >
          Hub de Instituições, Links e Materiais de Referência
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 800 }}>
          Acesse materiais oficiais, cartilhas de estatuto, manuais de promotor e kits de mídia
          disponibilizados pelas principais juntas e agências do Brasil.
        </Typography>
      </Box>

      {/* Filter Pills */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          mb: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
        role="group"
        aria-label="Filtrar materiais por categoria"
      >
        {MATERIAL_CATEGORIES.map((category: MaterialCategory) => {
          const isSelected = selectedCategory === category;
          return (
            <Chip
              key={category}
              label={category}
              clickable
              onClick={() => setSelectedCategory(category)}
              aria-pressed={isSelected}
              sx={{
                fontWeight: isSelected ? 700 : 500,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                px: 1,
                py: 2.25,
                borderRadius: '10px',
                minHeight: 44, // Touch target
                bgcolor: isSelected
                  ? 'primary.main'
                  : (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(13, 43, 92, 0.05)',
                color: isSelected
                  ? 'common.white'
                  : (t) => (t.palette.mode === 'dark' ? 'common.white' : 'text.primary'),
                border: '1px solid',
                borderColor: isSelected
                  ? 'primary.main'
                  : (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-borderSubtle)'
                        : 'var(--mui-palette-divider)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isSelected
                    ? 'primary.dark'
                    : (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(13, 43, 92, 0.1)',
                },
              }}
            />
          );
        })}
      </Stack>

      {/* Institutions Grid */}
      <Grid container spacing={3}>
        {filteredInstitutions.map((inst: ReferenceInstitution) => {
          return (
            <Grid key={inst.id} size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
              <Card
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  width: '100%',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '1px solid var(--mui-palette-action2-borderSubtle)'
                      : '1px solid var(--mui-palette-divider)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark' ? 'none' : '0 2px 14px rgba(13, 43, 92, 0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--app-shadow-overlay)'
                        : '0 8px 24px rgba(13, 43, 92, 0.1)',
                  },
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 54, sm: 64 },
                        height: { xs: 54, sm: 64 },
                        borderRadius: 2.5,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'common.white',
                        border: '1px solid',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'var(--mui-palette-divider)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={inst.logoUrl}
                        alt={`Logotipo da ${inst.name}`}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        component="h4"
                        sx={{
                          fontSize: { xs: '1.2rem', sm: '1.35rem' },
                          fontWeight: 700,
                          color: (t) =>
                            t.palette.mode === 'dark' ? 'common.white' : 'primary.main',
                          lineHeight: 1.2,
                        }}
                      >
                        {inst.shortName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}
                      >
                        {inst.name}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Categories Tags */}
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                    {inst.categories.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(13, 43, 92, 0.06)',
                          color: (t) =>
                            t.palette.mode === 'dark' ? 'common.white' : 'primary.main',
                        }}
                      />
                    ))}
                  </Stack>

                  <Box
                    sx={{
                      p: 1.75,
                      mb: 2.5,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(13, 43, 92, 0.03)',
                      borderLeft: '4px solid',
                      borderColor: 'accent.main',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'accent.main',
                        display: 'block',
                        mb: 0.25,
                      }}
                    >
                      Foco Prático
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                      {inst.focus}
                    </Typography>
                  </Box>

                  {/* O que baixar/acessar no portal */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <LibraryBooksIcon fontSize="small" sx={{ color: 'accent.main' }} />O que baixar
                    / acessar no portal:
                  </Typography>

                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {inst.resources.map((res) => (
                      <Box
                        key={res.title}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.02)'
                              : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: (t) =>
                              t.palette.mode === 'dark' ? 'common.white' : 'text.primary',
                            lineHeight: 1.4,
                          }}
                        >
                          {res.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}
                        >
                          {res.description}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* External Action Links */}
                <Stack
                  direction="column"
                  spacing={1.5}
                  useFlexGap
                  sx={{
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    width: '100%',
                  }}
                >
                  {inst.links.map((link) => (
                    <PillButton
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      tone="primaryOutline"
                      size="small"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      aria-label={`${link.label} (abre em nova aba)`}
                      sx={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        minHeight: 44, // Touch target
                      }}
                    >
                      {link.label}
                    </PillButton>
                  ))}
                </Stack>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
