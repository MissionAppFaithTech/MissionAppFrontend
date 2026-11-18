import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PillButton from '@/components/common/PillButton';

export default function AdminPageHeading({ detail = false }: { detail?: boolean }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        useFlexGap
        sx={{ justifyContent: 'space-between', mb: detail ? 0.5 : 1.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          Administração / Missionários{detail ? ' / Ver cadastro' : ''}
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{ alignItems: 'center', color: 'text.secondary' }}
        >
          <VerifiedUserOutlinedIcon aria-hidden sx={{ fontSize: 14 }} />
          <Typography variant="caption">Área do administrador</Typography>
        </Stack>
      </Stack>
      {detail && (
        <PillButton
          href="/admin"
          tone="primaryOutline"
          startIcon={<ArrowBackIcon aria-hidden />}
          sx={{
            border: 0,
            px: 0,
            minHeight: 44,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
            mb: 1,
          }}
        >
          Voltar para missionários
        </PillButton>
      )}
      <Typography
        component="h1"
        sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 700, lineHeight: 1.2, mb: 1 }}
      >
        {detail ? 'Análise de cadastro' : 'Missionários cadastrados'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {detail
          ? 'Confira as informações enviadas pelo missionário antes de aprovar ou reprovar o cadastro.'
          : 'Analise os cadastros e gerencie a entrada de missionários na plataforma.'}
      </Typography>
    </Box>
  );
}
