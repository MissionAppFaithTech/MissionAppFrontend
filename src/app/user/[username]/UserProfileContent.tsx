import { cacheLife } from 'next/cache';
import Container from '@mui/material/Container';
import VisitorProfileView from '@/components/profile/VisitorProfileView';
import JsonLd, { generateProfilePageSchema } from '@/components/seo/JsonLd';
import { mockProfile } from '@/mocks/profile';
import type { ProfileData } from '@/types/profile';

type UserProfileBodyProps = {
  params: Promise<{ username: string }>;
};

/** Shared by every visitor: cached for the `public` profile (ADR-0004). */
export async function UserProfileContent({ username }: { username: string }) {
  'use cache';
  cacheLife('public');

  const isMockMissionary =
    username.toLowerCase() === mockProfile.username.toLowerCase() ||
    username.toLowerCase() === 'samuel-mendonca' ||
    username.toLowerCase() === 'samuel';

  const profile: ProfileData = isMockMissionary
    ? mockProfile
    : {
        ...mockProfile,
        username,
        displayName: username.replace(/-/g, ' '),
        about: {
          ...mockProfile.about,
          introduction: `Perfil público de ${username.replace(/-/g, ' ')} no Mission App.`,
        },
      };

  const profileSchemas = generateProfilePageSchema(profile, `/user/${username}`);

  return (
    <>
      {/* Schema.org JSON-LD para motores de busca e IAs */}
      <JsonLd data={profileSchemas} />

      {/* Área Central de Conteúdo */}
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 }, outline: 'none' }}
      >
        <VisitorProfileView profile={profile} />
      </Container>
    </>
  );
}

/** Reads the route params inside the page `<Suspense>` boundary (ADR-0005). */
export async function UserProfileBody({ params }: UserProfileBodyProps) {
  const { username } = await params;
  return <UserProfileContent username={username} />;
}
