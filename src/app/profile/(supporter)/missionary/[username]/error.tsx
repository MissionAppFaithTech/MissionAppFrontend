'use client';

import RouteError from '@/components/common/RouteError';

/** The public profile API failed (not a missing profile, which is a 404). */
export default function ProfileError({ error, retry }: { error: unknown; retry: () => void }) {
  return <RouteError error={error} retry={retry} title="Não foi possível carregar o perfil" />;
}
