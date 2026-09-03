import type { Metadata } from 'next';
import SavedPostsSection from '@/components/profile/SavedPostsSection';
import { mockSavedPosts } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Salvos | Perfil de Apoiador',
  robots: { index: false, follow: false },
};

export default function SupporterSavedPostsPage() {
  return <SavedPostsSection posts={mockSavedPosts} />;
}
