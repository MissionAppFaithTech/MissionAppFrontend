'use client';

import { useState, useMemo, useId } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import AppTopNavbar from '@/components/layout/AppTopNavbar';
import PillButton from '@/components/common/PillButton';
import EmptyState from '@/components/common/EmptyState';
import CampaignBadge from '@/components/campaign/CampaignBadge';
import MobileNavigationBar, {
  type BottomNavViewMode,
} from '@/components/layout/MobileNavigationBar';
import SkipToContent from '@/components/common/SkipToContent';

export type SearchItemType = 'campanha' | 'projeto' | 'missionario';

export interface NavigationItem {
  id: string;
  title: string;
  missionaryName: string;
  missionaryUsername: string;
  avatarUrl?: string;
  agency?: string;
  location: string;
  category: string;
  type: SearchItemType;
  description: string;
  imageUrl: string;
  href: string;
  hasBadge: boolean;
}

const mockNavigationItems: NavigationItem[] = [
  // Missionaries
  {
    id: 'miss-1',
    title: 'Samuel Mendonça',
    missionaryName: 'Samuel Mendonça',
    missionaryUsername: '_SamiMendonca',
    avatarUrl: '/images/projects/projeto-impacto.jpg',
    agency: 'JOCUM África',
    location: 'Cidade do Cabo, África do Sul',
    category: 'Educação Infantil',
    type: 'missionario',
    description:
      'Missionário em tempo integral atuando no suporte educacional, discipulado e implantação de escolas cristãs em comunidades vulneráveis.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    href: '/user/_SamiMendonca',
    hasBadge: true,
  },
  {
    id: 'miss-2',
    title: 'Maria Silva',
    missionaryName: 'Maria Silva',
    missionaryUsername: 'MariaSilva',
    avatarUrl: '/landing-page/background.png',
    agency: 'Missão Horizontes',
    location: 'Moçambique',
    category: 'Saúde & Nutrição',
    type: 'missionario',
    description:
      'Coordenadora de projetos de saneamento, perfuração de poços artesianos e distribuição nutricional em aldeias moçambicanas.',
    imageUrl: '/landing-page/background.png',
    href: '/user/MariaSilva',
    hasBadge: true,
  },
  {
    id: 'miss-3',
    title: 'João Pedro',
    missionaryName: 'João Pedro',
    missionaryUsername: 'joaopedro',
    avatarUrl: '/landing-page/landing-page.png',
    agency: 'Missão Sertão Vivo',
    location: 'Piauí, Brasil',
    category: 'Plantação de Igrejas',
    type: 'missionario',
    description:
      'Pastor e plantador de igrejas dedicando a vida a levar o evangelho e capacitação bíblica a povoados isolados do sertão nordestino.',
    imageUrl: '/landing-page/landing-page.png',
    href: '/user/joaopedro',
    hasBadge: false,
  },
  {
    id: 'miss-4',
    title: 'Ana Costa',
    missionaryName: 'Ana Costa',
    missionaryUsername: 'anacosta',
    avatarUrl: '/landing-page/background.png',
    agency: 'Linguística & Bíblia',
    location: 'Amazonas, Brasil',
    category: 'Tradução & Bíblias',
    type: 'missionario',
    description:
      'Linguista e tradutora bíblica dedicada à preservação cultural e tradução dos evangelhos para dialetos indígenas.',
    imageUrl: '/landing-page/background.png',
    href: '/user/anacosta',
    hasBadge: false,
  },

  // Campaigns
  {
    id: 'camp-1',
    title: 'Campanha de Educação & Esperança',
    missionaryName: 'Samuel Mendonça',
    missionaryUsername: '_SamiMendonca',
    avatarUrl: '/images/projects/projeto-impacto.jpg',
    location: 'Cidade do Cabo, África do Sul',
    category: 'Educação Infantil',
    type: 'campanha',
    description:
      'Mobilizando comunidades de fé para transformar a infância e capacitar novas gerações através do suporte educacional no campo missionário.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    href: '/campanha/campanha-educacao-esperanca',
    hasBadge: true,
  },
  {
    id: 'camp-2',
    title: 'Campanha Esperança & Dignidade em Moçambique',
    missionaryName: 'Maria Silva',
    missionaryUsername: 'MariaSilva',
    avatarUrl: '/landing-page/background.png',
    location: 'Moçambique',
    category: 'Saúde & Nutrição',
    type: 'campanha',
    description:
      'Levando água potável, apoio nutricional e discipulado bíblico para mais de 300 crianças e suas famílias em aldeias do interior.',
    imageUrl: '/landing-page/background.png',
    href: '/campanha/campanha-esperanca-mocambique',
    hasBadge: true,
  },

  // Projects
  {
    id: 'proj-1',
    title: 'Projeto social na favela do Lixão',
    missionaryName: 'Samuel Mendonça',
    missionaryUsername: '_SamiMendonca',
    avatarUrl: '/images/projects/projeto-impacto.jpg',
    location: 'África do Sul',
    category: 'Educação Infantil',
    type: 'projeto',
    description:
      'Construção de uma escola confessional cristã e centro comunitário para atender mais de 120 crianças em situação de extrema vulnerabilidade.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    href: '/user/_SamiMendonca',
    hasBadge: true,
  },
  {
    id: 'proj-2',
    title: 'Plantação de Igrejas no Sertão',
    missionaryName: 'João Pedro',
    missionaryUsername: 'joaopedro',
    avatarUrl: '/landing-page/landing-page.png',
    location: 'Piauí, Brasil',
    category: 'Plantação de Igrejas',
    type: 'projeto',
    description:
      'Capacitação de líderes locais e implantação de comunidades de fé vivas em vilarejos sem assistência pastoral no semiárido.',
    imageUrl: '/landing-page/landing-page.png',
    href: '/user/joaopedro',
    hasBadge: false,
  },
  {
    id: 'proj-3',
    title: 'Tradução Bíblica para Povos Originários',
    missionaryName: 'Ana Costa',
    missionaryUsername: 'anacosta',
    avatarUrl: '/landing-page/background.png',
    location: 'Amazonas, Brasil',
    category: 'Tradução & Bíblias',
    type: 'projeto',
    description:
      'Alfabetização bilíngue e tradução contextualizada das escrituras sagradas para línguas e etnias minoritárias da região amazônica.',
    imageUrl: '/landing-page/background.png',
    href: '/user/anacosta',
    hasBadge: false,
  },
  {
    id: 'proj-4',
    title: 'Apoio Emergencial e Refúgio Familiar',
    missionaryName: 'Lucas Santos',
    missionaryUsername: 'lucassantos',
    avatarUrl: '/images/projects/projeto-impacto.jpg',
    location: 'Beira, Moçambique',
    category: 'Ajuda Humanitária',
    type: 'projeto',
    description:
      'Distribuição contínua de mantimentos, apoio psicológico pastoral e reconstrução de lares para comunidades atingidas por enchentes.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    href: '/user/lucassantos',
    hasBadge: true,
  },
];

const categoryOptions = [
  { label: 'Educação Infantil', icon: SchoolOutlinedIcon },
  { label: 'Saúde & Nutrição', icon: LocalHospitalOutlinedIcon },
  { label: 'Plantação de Igrejas', icon: ChurchOutlinedIcon },
  { label: 'Tradução & Bíblias', icon: MenuBookOutlinedIcon },
  { label: 'Ajuda Humanitária', icon: VolunteerActivismOutlinedIcon },
  { label: 'Família & Juventude', icon: FamilyRestroomOutlinedIcon },
];

const typeFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Missionários', value: 'missionario' },
  { label: 'Campanhas', value: 'campanha' },
  { label: 'Projetos de Impacto', value: 'projeto' },
];

const visuallyHiddenSx = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
};

export interface NavigationPageContentProps {
  initialIsAuthenticated?: boolean;
  initialRole?: 'missionary' | 'supporter' | 'visitor';
}

export default function NavigationPageContent({
  initialIsAuthenticated = false,
  initialRole = 'visitor',
}: NavigationPageContentProps) {
  const searchInputId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Active persona view mode: 'visitor' (Não Registrado), 'missionary' (Missionário), 'supporter' (Usuário Comum)
  const [activeViewMode, setActiveViewMode] = useState<BottomNavViewMode>(
    !initialIsAuthenticated ? 'visitor' : initialRole === 'supporter' ? 'supporter' : 'missionary'
  );

  // Boolean flag separating logged-in user and non-registered visitor (requested by user)
  const isLoggedIn = activeViewMode !== 'visitor';
  const role =
    activeViewMode === 'supporter'
      ? 'supporter'
      : activeViewMode === 'missionary'
        ? 'missionary'
        : 'visitor';

  // Filter logic adhering to RF 7.2 (Nome do Missionário, Título do Projeto/Campanha, Localização)
  const filteredItems = useMemo(() => {
    return mockNavigationItems.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      // Text query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesMissionary = item.missionaryName.toLowerCase().includes(query);
        const matchesUsername = item.missionaryUsername.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesDescription = item.description.toLowerCase().includes(query);

        return (
          matchesTitle ||
          matchesMissionary ||
          matchesUsername ||
          matchesLocation ||
          matchesCategory ||
          matchesDescription
        );
      }

      return true;
    });
  }, [searchQuery, selectedType, selectedCategory]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      <SkipToContent />

      {/* Top Navigation Bar: Dynamic Logged In vs Non-Registered View */}
      <AppTopNavbar isLoggedIn={isLoggedIn} role={role} maxWidth="lg" />

      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2, sm: 3 },
          outline: 'none',
        }}
      >
        {/* Interactive View Switcher for Testing/Demonstration (Agreed in Interview) */}
        <Paper
          elevation={0}
          role="region"
          aria-label="Controle de visualização do usuário"
          sx={{
            p: 1.5,
            mb: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(13, 43, 92, 0.04)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Modo de Visualização Ativo:
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              label="Não Registrado (Visitante)"
              clickable
              onClick={() => setActiveViewMode('visitor')}
              color={activeViewMode === 'visitor' ? 'primary' : 'default'}
              variant={activeViewMode === 'visitor' ? 'filled' : 'outlined'}
              sx={{
                fontWeight: activeViewMode === 'visitor' ? 700 : 500,
                fontSize: '0.75rem',
                minHeight: 32,
              }}
            />
            <Chip
              label="Missionário"
              clickable
              onClick={() => setActiveViewMode('missionary')}
              color={activeViewMode === 'missionary' ? 'primary' : 'default'}
              variant={activeViewMode === 'missionary' ? 'filled' : 'outlined'}
              sx={{
                fontWeight: activeViewMode === 'missionary' ? 700 : 500,
                fontSize: '0.75rem',
                minHeight: 32,
              }}
            />
            <Chip
              label="Usuário Comum"
              clickable
              onClick={() => setActiveViewMode('supporter')}
              color={activeViewMode === 'supporter' ? 'primary' : 'default'}
              variant={activeViewMode === 'supporter' ? 'filled' : 'outlined'}
              sx={{
                fontWeight: activeViewMode === 'supporter' ? 700 : 500,
                fontSize: '0.75rem',
                minHeight: 32,
              }}
            />
          </Stack>
        </Paper>

        {/* Header Section */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
              color: 'text.primary',
              mb: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Navegação & Descoberta
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
              maxWidth: 680,
              lineHeight: 1.5,
            }}
          >
            Explore o trabalho missionário pelo mundo. Encontre causas, conheça missionários em
            campo e acompanhe projetos de impacto com total transparência.
          </Typography>
        </Box>

        {/* Search & Quick Filters Section (RF 7.1, 7.2) */}
        <Box
          component="section"
          aria-labelledby="search-filter-heading"
          sx={{
            p: { xs: 2, sm: 2.5 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0, 0, 0, 0.35)'
                : '0 4px 16px rgba(13, 43, 92, 0.05)',
            mb: { xs: 3, sm: 4 },
          }}
        >
          <Typography
            id="search-filter-heading"
            component="h2"
            variant="subtitle1"
            sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
          >
            Buscar e Filtrar Iniciativas
          </Typography>

          <TextField
            id={searchInputId}
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do missionário, causa, projeto ou país..."
            aria-label="Campo de pesquisa para missionários e projetos"
            size="medium"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? 'accent.light' : 'mission.main',
                        fontSize: 24,
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar busca"
                      onClick={() => setSearchQuery('')}
                      size="small"
                      sx={{ minWidth: 44, minHeight: 44 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'accent.main',
                  borderWidth: '2px',
                },
              },
            }}
          />

          {/* Quick Filter Type Chips */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}
            >
              Tipo:
            </Typography>

            {typeFilterOptions.map((option) => {
              const isSelected = selectedType === option.value;
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  onClick={() => setSelectedType(option.value)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    minHeight: 38,
                    px: 1,
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.8125rem',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                    },
                  }}
                />
              );
            })}

            {(selectedCategory || selectedType !== 'all' || searchQuery) && (
              <PillButton
                onClick={handleClearFilters}
                size="small"
                tone="ghost"
                sx={{
                  ml: 'auto',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  minHeight: 36,
                  px: 1.5,
                  color: 'text.secondary',
                  border: '1px dashed',
                  borderColor: 'divider',
                  '&:hover': {
                    color: 'error.main',
                    borderColor: 'error.main',
                  },
                }}
              >
                Limpar filtros
              </PillButton>
            )}
          </Stack>
        </Box>

        {/* Categories Section */}
        <Box
          component="section"
          aria-labelledby="categories-heading"
          sx={{ mb: { xs: 3.5, sm: 4.5 } }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              mb: 1.5,
            }}
          >
            <Typography
              id="categories-heading"
              component="h2"
              variant="h6"
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.125rem' }}
            >
              Categorias de Atuação Missionária
            </Typography>
            {selectedCategory && (
              <Typography
                component="button"
                onClick={() => setSelectedCategory(null)}
                sx={{
                  background: 'none',
                  border: 'none',
                  color: 'mission.main',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  p: 0,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Ver todas
              </Typography>
            )}
          </Box>

          <Grid container spacing={1.5}>
            {categoryOptions.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.label;

              return (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={cat.label}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? null : cat.label)}
                    aria-pressed={isSelected}
                    sx={{
                      width: '100%',
                      minHeight: 74,
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: 0.75,
                      borderRadius: 2.5,
                      border: '1.5px solid',
                      borderColor: isSelected
                        ? (theme) =>
                            theme.palette.mode === 'dark' ? 'accent.light' : 'mission.main'
                        : 'divider',
                      bgcolor: isSelected
                        ? (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(251, 146, 60, 0.14)'
                              : 'rgba(230, 81, 0, 0.06)'
                        : 'background.paper',
                      color: isSelected ? 'mission.main' : 'text.primary',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected
                        ? (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 0 10px rgba(251, 146, 60, 0.3)'
                              : '0 2px 8px rgba(230, 81, 0, 0.15)'
                        : 'none',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-1px)',
                      },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {cat.label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Live Search Status Feedback (Nielsen 1.1 & ARIA Live) */}
        <Box
          role="status"
          aria-live="polite"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 0.5,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {filteredItems.length === 1
              ? '1 resultado encontrado'
              : `${filteredItems.length} resultados encontrados`}
            {selectedCategory && ` em "${selectedCategory}"`}
          </Typography>
        </Box>

        {/* Cards Grid: RF 14.2, RF 7.3 & Missionary Cards with Avatar */}
        <Box component="section" aria-labelledby="results-heading" sx={{ mb: 5 }}>
          <Typography id="results-heading" component="h2" sx={visuallyHiddenSx}>
            Resultados da busca e iniciativas
          </Typography>

          {filteredItems.length > 0 ? (
            <Grid container spacing={2.5}>
              {filteredItems.map((item) => {
                const isMissionaryType = item.type === 'missionario';

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        transition:
                          'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? '0 8px 24px rgba(0, 0, 0, 0.45)'
                              : '0 8px 24px rgba(13, 43, 92, 0.08)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      {/* For missionary: prominent top profile header with Avatar */}
                      {isMissionaryType ? (
                        <Box
                          sx={{
                            p: 2.5,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.03)'
                                : 'rgba(13, 43, 92, 0.03)',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Avatar
                            src={item.avatarUrl}
                            alt={`Foto do missionário ${item.missionaryName}`}
                            sx={{
                              width: 60,
                              height: 60,
                              bgcolor: 'primary.main',
                              fontSize: '1.25rem',
                              fontWeight: 700,
                              border: '2px solid',
                              borderColor: 'accent.main',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            }}
                          >
                            {item.missionaryName.charAt(0)}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <Typography
                                component="h3"
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 800,
                                  color: 'text.primary',
                                  lineHeight: 1.2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.missionaryName}
                              </Typography>
                              {item.hasBadge && (
                                <VerifiedIcon
                                  sx={{
                                    fontSize: 18,
                                    color: (theme) =>
                                      theme.palette.mode === 'dark'
                                        ? 'accent.light'
                                        : 'mission.main',
                                  }}
                                />
                              )}
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontWeight: 600 }}
                            >
                              @{item.missionaryUsername}
                            </Typography>
                            {item.agency && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  mt: 0.25,
                                }}
                              >
                                <BusinessOutlinedIcon sx={{ fontSize: 13 }} />
                                {item.agency}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        /* For campaigns and projects: media banner + missionary row */
                        <Box sx={{ position: 'relative', width: '100%', pt: '52%' }}>
                          <CardMedia
                            component="img"
                            image={item.imageUrl}
                            alt={`Imagem de capa de ${item.title}`}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          {item.hasBadge && (
                            <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                              <CampaignBadge size="small" />
                            </Box>
                          )}
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 12,
                              left: 12,
                              bgcolor: 'rgba(0, 0, 0, 0.65)',
                              backdropFilter: 'blur(6px)',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      )}

                      <CardContent
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {/* If not missionary type, show missionary mini-info */}
                        {!isMissionaryType && (
                          <Stack
                            direction="row"
                            spacing={1.25}
                            sx={{ alignItems: 'center', mb: 1.5 }}
                          >
                            <Avatar
                              src={item.avatarUrl}
                              alt={`Foto de ${item.missionaryName}`}
                              sx={{
                                width: 34,
                                height: 34,
                                bgcolor: 'primary.main',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                              }}
                            >
                              {item.missionaryName.charAt(0)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  lineHeight: 1.2,
                                  color: 'text.primary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.missionaryName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                <LocationOnOutlinedIcon sx={{ fontSize: 13 }} />
                                <Box
                                  component="span"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {item.location}
                                </Box>
                              </Typography>
                            </Box>
                          </Stack>
                        )}

                        {!isMissionaryType && (
                          <Typography
                            component="h3"
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              fontSize: '1.05rem',
                              lineHeight: 1.3,
                              mb: 1,
                            }}
                          >
                            {item.title}
                          </Typography>
                        )}

                        {isMissionaryType && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mb: 1.5,
                            }}
                          >
                            <LocationOnOutlinedIcon sx={{ fontSize: 14 }} />
                            {item.location}
                          </Typography>
                        )}

                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            mb: 2,
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.description}
                        </Typography>

                        <PillButton
                          href={item.href}
                          fullWidth
                          tone={
                            isMissionaryType
                              ? 'primaryFilled'
                              : item.type === 'campanha'
                                ? 'missionFilled'
                                : 'primarySoftOutline'
                          }
                          size="small"
                          sx={{
                            minHeight: 44,
                            fontWeight: 700,
                            fontSize: '0.875rem',
                          }}
                        >
                          {isMissionaryType
                            ? 'Ver Perfil do Missionário'
                            : item.type === 'campanha'
                              ? 'Conhecer Campanha'
                              : 'Acessar Iniciativa'}
                        </PillButton>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <EmptyState
              title="Nenhuma iniciativa encontrada"
              description="Não encontramos missionários, projetos ou campanhas que correspondam aos filtros e termos digitados. Tente ajustar os termos ou explore outras categorias."
              actionLabel="Limpar busca e filtros"
              onAction={handleClearFilters}
              actionTone="primaryOutline"
            />
          )}
        </Box>

        {/* Direct Account Shortcuts Section: RF 6.3 & RF 6.2.4 */}
        <Box
          component="section"
          aria-labelledby="shortcuts-heading"
          sx={{
            p: { xs: 2.5, sm: 3 },
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            mb: { xs: 4, sm: 5 },
          }}
        >
          <Typography
            id="shortcuts-heading"
            component="h2"
            variant="h6"
            sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
          >
            {isLoggedIn ? 'Atalhos Rápidos da Sua Conta' : 'Participe do MissionApp'}
          </Typography>

          {!isLoggedIn ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(13, 43, 92, 0.03)',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      É missionário ou apoiador?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Cadastre sua causa, receba apoio da igreja ou acompanhe missionários de perto.
                    </Typography>
                  </Box>
                  <PillButton
                    href="/select-role"
                    tone="missionFilled"
                    fullWidth
                    sx={{ minHeight: 44, fontWeight: 700 }}
                  >
                    Criar Minha Conta
                  </PillButton>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(13, 43, 92, 0.03)',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Já possui cadastro?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Acesse seu painel com login e senha para gerenciar seus projetos e postagens.
                    </Typography>
                  </Box>
                  <PillButton
                    href="/login"
                    tone="primaryOutline"
                    fullWidth
                    sx={{ minHeight: 44, fontWeight: 600 }}
                  >
                    Entrar no Sistema
                  </PillButton>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PillButton
                  href={
                    activeViewMode === 'supporter'
                      ? '/profile/supporter/edit-profile'
                      : '/profile/edit-profile'
                  }
                  tone="primarySoftOutline"
                  fullWidth
                  sx={{ minHeight: 44, fontWeight: 600 }}
                >
                  Editar Dados do Perfil
                </PillButton>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PillButton
                  href={
                    activeViewMode === 'supporter'
                      ? '/profile/supporter/missionarios'
                      : '/profile/projetos-de-impacto'
                  }
                  tone="primarySoftOutline"
                  fullWidth
                  sx={{ minHeight: 44, fontWeight: 600 }}
                >
                  {activeViewMode === 'supporter' ? 'Missionários Seguidos' : 'Gerenciar Projetos'}
                </PillButton>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <PillButton
                  href={
                    activeViewMode === 'supporter'
                      ? '/profile/supporter/postagens-salvas'
                      : '/profile/financeiro'
                  }
                  tone="primarySoftOutline"
                  fullWidth
                  sx={{ minHeight: 44, fontWeight: 600 }}
                >
                  {activeViewMode === 'supporter'
                    ? 'Postagens Salvas'
                    : 'Configurações Financeiras (Pix)'}
                </PillButton>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* How it Works (GAIA Inclusive Guidelines) */}
        <Box component="section" aria-labelledby="how-it-works-heading" sx={{ mb: 5 }}>
          <Typography
            id="how-it-works-heading"
            component="h2"
            variant="h6"
            sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
          >
            Como Funciona o MissionApp
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: 'rgba(13, 43, 92, 0.08)',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <ExploreOutlinedIcon />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  1. Descubra e Conheça
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  Navegue por iniciativas reais e verificadas de missionários ativos em diversas
                  regiões do Brasil e do mundo.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: 'rgba(230, 81, 0, 0.08)',
                    color: 'mission.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <FavoriteBorderOutlinedIcon />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  2. Conecte-se e Ore
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  Siga atualizações em tempo real, leia notícias do campo e participe ativamente com
                  orações e intercessão.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: 'rgba(21, 128, 61, 0.08)',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <SecurityOutlinedIcon />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  3. Apoie com Segurança
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  Contribua de forma direta com campanhas oficiais via Pix ou transferência, com
                  transparência e sem taxas intermediárias abusivas.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Minimalist Mobile Navigation Bar: Dynamically switches among 3 views (Visitor: 3 icons, Missionary: 4 icons, Supporter: 4 icons) */}
      <MobileNavigationBar viewMode={activeViewMode} searchHref="/navegacao" />
    </Box>
  );
}
