'use client';

import { usePathname } from 'next/navigation';
import Container, { type ContainerProps } from '@mui/material/Container';

export default function ProfileLayoutContainer({ children, sx, ...props }: ContainerProps) {
  const pathname = usePathname();
  const isFreePage =
    Boolean(pathname?.includes('/edit')) ||
    Boolean(pathname?.endsWith('/edit-profile')) ||
    Boolean(pathname?.includes('/financeiro'));

  return (
    <Container
      component="main"
      id="main-content"
      tabIndex={-1}
      maxWidth="lg"
      {...props}
      sx={{
        px: { xs: 2, sm: 3 },
        pt: { xs: 2, sm: 4, md: 6 },
        pb: isFreePage ? { xs: 2, sm: 4, md: 6 } : { xs: 10, sm: 4, md: 6 },
        outline: 'none',
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}
