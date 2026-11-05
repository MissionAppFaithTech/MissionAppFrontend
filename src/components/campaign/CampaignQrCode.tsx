'use client';

import { useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTheme } from '@mui/material/styles';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import PillButton from '@/components/common/PillButton';
import { campaignPath } from '@/lib/campaigns/featured';
import { getSiteUrl } from '@/lib/site';
import type { CampaignData } from '@/types/campaign';

/** Size of the downloaded PNG: sharp on a projector screen and in print. */
const DOWNLOAD_SIZE = 1024;

type CampaignQrCodeProps = {
  campaign: Pick<CampaignData, 'id' | 'title'>;
};

/**
 * QR code of a campaign's public page, for the slides and the bulletin: the
 * members point the phone camera at it, read about the impact project and give.
 * Always dark on white (also in dark mode), so every camera reads it.
 */
export default function CampaignQrCode({ campaign }: CampaignQrCodeProps) {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const path = campaignPath(campaign);
  const url = `${getSiteUrl()}${path}`;
  const ink = theme.palette.common.black;
  const paper = theme.palette.common.white;

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qr-code-${campaign.id}.png`;
    link.click();
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 2.5, sm: 3 }}
      useFlexGap
      sx={{ alignItems: { xs: 'stretch', sm: 'center' }, minWidth: 0 }}
    >
      <Box
        sx={{
          alignSelf: { xs: 'center', sm: 'auto' },
          flexShrink: 0,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'common.white',
          border: '1px solid',
          borderColor: 'divider',
          lineHeight: 0,
        }}
      >
        <QRCodeSVG
          value={url}
          size={168}
          level="M"
          marginSize={1}
          fgColor={ink}
          bgColor={paper}
          title={`QR Code da campanha ${campaign.title}`}
          role="img"
          aria-label={`QR Code que abre a página da campanha ${campaign.title}`}
        />
        {/* NOTE: hidden high-resolution copy, only for the PNG download */}
        <Box sx={{ display: 'none' }} aria-hidden>
          <QRCodeCanvas
            ref={canvasRef}
            value={url}
            size={DOWNLOAD_SIZE}
            level="M"
            marginSize={4}
            fgColor={ink}
            bgColor={paper}
          />
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          O QR Code abre a página da campanha:
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, overflowWrap: 'anywhere', color: 'text.primary' }}
        >
          {url}
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          useFlexGap
          sx={{ '& > *': { width: { xs: '100%', md: 'auto' } } }}
        >
          <PillButton
            onClick={download}
            tone="missionFilled"
            startIcon={<DownloadIcon aria-hidden />}
            sx={{ minHeight: 44, justifyContent: 'center' }}
          >
            Baixar QR Code (PNG)
          </PillButton>
          <PillButton
            href={path}
            tone="primaryOutline"
            startIcon={<OpenInNewIcon aria-hidden />}
            sx={{ minHeight: 44, justifyContent: 'center' }}
          >
            Abrir a página da campanha
          </PillButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
