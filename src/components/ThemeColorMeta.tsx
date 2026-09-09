'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { darkTokens, lightTokens } from '@/theme/theme';

/**
 * Keeps `<meta name="theme-color">` in step with the chosen theme.
 *
 * The static `viewport.themeColor` in `app/layout.tsx` is keyed to
 * `prefers-color-scheme`, so it follows the operating system and ignores an
 * explicit toggle — on mobile the browser chrome stayed light while the app was
 * dark. This writes the active color into the existing tags.
 *
 * It only ever sets an attribute. Removing or appending nodes here breaks React:
 * the tags are part of the tree Next.js renders, so deleting one makes React's
 * later cleanup throw `removeChild` on a detached node, which aborts the commit
 * and leaves a client-side navigation showing the previous page.
 */
export default function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const color = resolvedTheme === 'dark' ? darkTokens.canvas : lightTokens.canvas;

    // Both media variants get the same value, so whichever one the browser
    // matches reports the theme the user actually chose.
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', color);
    });
  }, [resolvedTheme]);

  return null;
}
