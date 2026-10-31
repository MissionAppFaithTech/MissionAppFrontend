'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';
import Link from 'next/link';
import { homePathForRole } from '@/lib/auth/rbac';
import { useSessionStore } from '@/stores/sessionStore';

const LOGO_PATHS = {
  light: '/logos/logo_light.PNG',
  dark: '/logos/logo_dark.PNG',
} as const;

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type LogoVariant = 'auto' | 'light' | 'dark';

type LogoProps = {
  /** Defaults to the user's home: role home when logged in, the landing page otherwise. */
  href?: string;
  size?: LogoSize;
  /** `auto` follows light/dark theme. Use `dark` on gradient navbar. */
  variant?: LogoVariant;
};

/** Altura visual + largura máxima — logo empilhada precisa de largura na navbar. */
const sizes: Record<LogoSize, { height: number; maxWidth: number }> = {
  sm: { height: 36, maxWidth: 112 },
  md: { height: 44, maxWidth: 140 },
  lg: { height: 52, maxWidth: 168 },
  xl: { height: 80, maxWidth: 240 },
};

function resolveSize(size?: string): LogoSize {
  if (size && size in sizes) {
    return size as LogoSize;
  }
  return 'md';
}

/** Role home for a logged-in user (RBAC), the landing page for visitors. */
function useHomeHref(): string {
  const status = useSessionStore((state) => state.status);
  const role = useSessionStore((state) => state.role);
  const loadSession = useSessionStore((state) => state.loadSession);

  useEffect(() => {
    if (status === 'unknown') void loadSession();
  }, [status, loadSession]);

  return status === 'authenticated' ? homePathForRole(role) : '/';
}

export default function Logo({ href: hrefOverride, size, variant = 'auto' }: LogoProps) {
  const homeHref = useHomeHref();
  const href = hrefOverride ?? homeHref;
  const resolvedSize = resolveSize(size);
  const { height, maxWidth } = sizes[resolvedSize];

  const imageStyle = {
    height,
    width: 'auto',
    maxWidth,
    objectFit: 'contain' as const,
    display: 'block',
  };

  const renderImage = (src: string) => (
    <Image
      src={src}
      alt="Mission App"
      width={280}
      height={280}
      priority={resolvedSize !== 'sm'}
      style={imageStyle}
    />
  );

  /**
   * `auto` renders both marks and lets CSS pick one.
   *
   * Choosing in JS meant the server always emitted the light logo, so the dark
   * theme showed a navy wordmark on a navy ground until hydration caught up —
   * the last piece of the theme flash.
   */
  const image =
    variant === 'auto' ? (
      <>
        <Box sx={{ lineHeight: 0, display: 'block', '.dark &': { display: 'none' } }}>
          {renderImage(LOGO_PATHS.light)}
        </Box>
        <Box sx={{ lineHeight: 0, display: 'none', '.dark &': { display: 'block' } }}>
          {renderImage(LOGO_PATHS.dark)}
        </Box>
      </>
    ) : (
      renderImage(variant === 'dark' ? LOGO_PATHS.dark : LOGO_PATHS.light)
    );

  if (href) {
    return (
      <Box
        component={Link}
        href={href}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
          lineHeight: 0,
          flexShrink: 0,
        }}
      >
        {image}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 0,
        flexShrink: 0,
      }}
    >
      {image}
    </Box>
  );
}
