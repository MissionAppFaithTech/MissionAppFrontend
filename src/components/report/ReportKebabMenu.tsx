'use client';

import { useId, useState, type MouseEvent } from 'react';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ReportDialog from '@/components/report/ReportDialog';
import { REPORT_TARGET_LABELS, type ReportTargetType } from '@/types/report';

type ReportKebabMenuProps = {
  targetType: ReportTargetType;
  targetId: string;
  sx?: IconButtonProps['sx'];
};

/** Kebab (3 dots) button whose menu holds "Denunciar" and opens the report modal. */
export default function ReportKebabMenu({ targetType, targetId, sx }: ReportKebabMenuProps) {
  const menuId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <IconButton
        aria-label={`Mais opções d${targetType === 'post' ? 'a' : 'o'} ${REPORT_TARGET_LABELS[targetType]}`}
        aria-haspopup="menu"
        aria-controls={anchor ? menuId : undefined}
        aria-expanded={anchor ? 'true' : undefined}
        onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
        sx={[
          { color: 'text.secondary', width: 44, height: 44, flexShrink: 0 },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        <MoreVertIcon aria-hidden />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          sx={{ color: 'error.main', minHeight: 44 }}
          onClick={() => {
            setAnchor(null);
            setDialogOpen(true);
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <FlagOutlinedIcon fontSize="small" aria-hidden />
          </ListItemIcon>
          Denunciar
        </MenuItem>
      </Menu>
      <ReportDialog
        open={dialogOpen}
        targetType={targetType}
        targetId={targetId}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
