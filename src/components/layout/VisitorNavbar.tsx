'use client';

import AppTopNavbar, { type AppTopNavbarProps } from '@/components/layout/AppTopNavbar';

export type VisitorNavbarProps = AppTopNavbarProps & {
  onSearchClick?: () => void;
};

/**
 * VisitorNavbar component with support for both non-registered visitors and logged-in users.
 * Controlled cleanly via the `isLoggedIn: boolean` property.
 */
export default function VisitorNavbar({
  isLoggedIn = false,
  maxWidth = 'lg',
  role = 'visitor',
  ...rest
}: VisitorNavbarProps) {
  return <AppTopNavbar isLoggedIn={isLoggedIn} maxWidth={maxWidth} role={role} {...rest} />;
}
