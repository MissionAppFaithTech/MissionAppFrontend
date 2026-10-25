'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PillButton from '@/components/common/PillButton';
import { COPYABLE_TEMPLATES, type CopyableTemplate } from './churchGuideData';

export default function CopyableTemplatesSection() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('regimento-interno');

  const handleCopy = async (template: CopyableTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedId(template.id);
      setTimeout(() => {
        setCopiedId((current) => (current === template.id ? null : current));
      }, 2500);
    } catch {
      // Fallback if clipboard API is not available
      const textArea = document.createElement('textarea');
      textArea.value = template.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(template.id);
      setTimeout(() => {
        setCopiedId((current) => (current === template.id ? null : current));
      }, 2500);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Box component="section" aria-labelledby="templates-heading" sx={{ width: '100%' }}>
      <Box sx={{ mb: 3.5, textAlign: 'left' }}>
        <Typography
          id="templates-heading"
          component="h3"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
          }}
        >
          Templates Prontos para Copiar (1-Click Copy)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 800 }}>
          Copie estes modelos oficiais com um único clique e adapte às necessidades e estatuto da
          sua comunidade de fé.
        </Typography>
      </Box>

      {/* ARIA Live Region for screen reader copy announcement */}
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {copiedId && 'Modelo copiado para a área de transferência com sucesso!'}
      </Box>

      <Stack spacing={3}>
        {COPYABLE_TEMPLATES.map((template: CopyableTemplate) => {
          const isCopied = copiedId === template.id;
          const isExpanded = expandedId === template.id;

          return (
            <Card
              key={template.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid var(--mui-palette-action2-borderSubtle)'
                    : '1px solid var(--mui-palette-divider)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark' ? 'none' : '0 2px 14px rgba(13, 43, 92, 0.05)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: { xs: 2.5, sm: 3.5 },
                  py: 2.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  borderBottom: isExpanded ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    component="h4"
                    sx={{
                      fontSize: { xs: '1.05rem', sm: '1.2rem' },
                      fontWeight: 700,
                      color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                    }}
                  >
                    {template.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {template.subtitle}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}
                >
                  <PillButton
                    tone={isCopied ? 'missionFilled' : 'primaryOutline'}
                    size="small"
                    onClick={() => handleCopy(template)}
                    startIcon={isCopied ? <CheckIcon /> : <ContentCopyIcon fontSize="small" />}
                    aria-label={`Copiar ${template.title}`}
                    sx={{
                      minHeight: 44,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      px: 2.5,
                      flex: { xs: 1, sm: 'initial' },
                    }}
                  >
                    {isCopied ? 'Copiado!' : 'Copiar Modelo'}
                  </PillButton>

                  <IconButton
                    onClick={() => handleToggleExpand(template.id)}
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded ? `Recolher ${template.title}` : `Expandir ${template.title}`
                    }
                    sx={{
                      minWidth: 44,
                      minHeight: 44,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Stack>
              </Box>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3 }}>
                  <Box
                    component="pre"
                    tabIndex={0}
                    role="region"
                    aria-label={`Conteúdo de ${template.title}`}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(0, 0, 0, 0.4)'
                          : 'rgba(13, 43, 92, 0.04)',
                      color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'text.primary'),
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      lineHeight: 1.6,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: 420,
                      overflowY: 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      outline: 'none',
                      '&:focus-visible': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
                      },
                    }}
                  >
                    {template.content}
                  </Box>
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
