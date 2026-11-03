import { notFound } from 'next/navigation';
import Container from '@mui/material/Container';
import VisitorProfileView from '@/components/profile/VisitorProfileView';
import JsonLd, { generateProfilePageSchema } from '@/components/seo/JsonLd';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { mockProfile } from '@/mocks/profile';

type UserProfileBodyProps = {
  params: Promise<{ username: string }>;
};

/**
 * Public missionary profile for visitors, from the backend's anonymous profile
 * (ADR-0004, cached per username). Tabs without an API yet (projects, posts,
 * campaign) keep example data, labelled as such in the view.
 */
export async function UserProfileContent({ username }: { username: string }) {
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  // Structured data only describes real data: the example project stays out of it.
  const profileSchemas = generateProfilePageSchema(profile, `/user/${profile.username}`);

  return (
    <>
      <JsonLd data={profileSchemas} />
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 }, outline: 'none' }}
      >
        <VisitorProfileView profile={{ ...profile, impactProject: mockProfile.impactProject }} />
      </Container>
    </>
  );
}

/** Reads the route params inside the page `<Suspense>` boundary (ADR-0005). */
export async function UserProfileBody({ params }: UserProfileBodyProps) {
  const { username } = await params;
  return <UserProfileContent username={username} />;
}
