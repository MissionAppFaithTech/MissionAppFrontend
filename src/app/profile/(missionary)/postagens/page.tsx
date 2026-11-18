'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';
import PostForm from '@/components/posts/PostForm';
import PostCard from '@/components/posts/PostCard';
import { usePosts } from '@/services/queries/posts';
import { deletePost, getPost } from '@/services/post.service';
import { queryKeys } from '@/lib/query/keys';
import { useFeedbackStore } from '@/stores/feedbackStore';
import type { Post } from '@/schemas/post.schema';

export default function ProfilePostsPage() {
  const profile = useOwnerProfile();
  const ownerId = profile.missionaryId ?? '';
  const canPost = profile.role === 'missionary' && Boolean(ownerId);
  const [view, setView] = useState<'mine' | 'general'>('mine');
  const [editor, setEditor] = useState<Post | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const feed = usePosts(ownerId, view === 'mine' ? ownerId : undefined);
  const notify = useFeedbackStore((state) => state.notify);
  const queryClient = useQueryClient();
  const publishButton = useRef<HTMLButtonElement>(null);
  const editTrigger = useRef<HTMLElement | null>(null);
  const remove = useMutation({
    mutationFn: (id: string) => deletePost(id),
    retry: false,
    onSuccess: () => {
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      notify('Postagem excluída.');
      publishButton.current?.focus();
    },
    onError: (error) => {
      setDeleteError(error.message);
      notify(error.message, 'error');
    },
  });
  async function edit(post: Post) {
    if (editingId || editor || remove.isPending) return;
    editTrigger.current = document.activeElement as HTMLElement;
    setEditingId(post.id);
    try {
      const latest = await getPost(post.id);
      if (latest.missionaryId !== ownerId) throw new Error('Você não pode editar esta postagem.');
      setEditor(latest);
      requestAnimationFrame(() => document.getElementById('post-content')?.focus());
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Não foi possível carregar a postagem',
        'error'
      );
    } finally {
      setEditingId(null);
    }
  }
  function closeEditor() {
    setEditor(null);
    requestAnimationFrame(() =>
      (editTrigger.current?.isConnected ? editTrigger.current : publishButton.current)?.focus()
    );
  }
  const posts = feed.data?.pages.flatMap((page) => page.data.posts) ?? [];
  return (
    <Stack spacing={2} useFlexGap sx={{ minWidth: 0 }}>
      <Typography component="h2" variant="h5">
        Postagens
      </Typography>
      {editor && canPost ? (
        <PostForm
          key={editor === 'new' ? 'new' : editor.id}
          post={editor === 'new' ? undefined : editor}
          onClose={closeEditor}
        />
      ) : (
        canPost && (
          <PillButton
            ref={publishButton}
            tone="primaryFilled"
            disabled={editingId !== null || remove.isPending}
            onClick={() => {
              editTrigger.current = null;
              setEditor('new');
              requestAnimationFrame(() => document.getElementById('post-content')?.focus());
            }}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-end' } }}
          >
            Postar
          </PillButton>
        )
      )}
      <Tabs
        value={view}
        onChange={(_, value: 'mine' | 'general') => setView(value)}
        variant="fullWidth"
        aria-label="Filtros de postagens"
      >
        <Tab
          id="posts-mine"
          aria-controls="posts-panel"
          value="mine"
          label="Meu feed"
          sx={{ minHeight: 44 }}
        />
        <Tab
          id="posts-general"
          aria-controls="posts-panel"
          value="general"
          label="Geral"
          sx={{ minHeight: 44 }}
        />
      </Tabs>
      <Box role="tabpanel" id="posts-panel" aria-labelledby={`posts-${view}`}>
        <Stack spacing={2} useFlexGap>
          {feed.isLoading && <Typography role="status">Carregando postagens…</Typography>}
          {feed.isError && (
            <Alert severity="error">
              {feed.error.message}
              <PillButton tone="primarySoftOutline" onClick={() => void feed.refetch()}>
                Tentar novamente
              </PillButton>
            </Alert>
          )}
          {feed.isSuccess && posts.length === 0 && (
            <Typography>Nenhuma postagem por aqui ainda.</Typography>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={
                post.missionaryId === ownerId
                  ? { name: profile.displayName, avatar: profile.avatarUrl }
                  : undefined
              }
              onEdit={canPost && post.missionaryId === ownerId ? () => void edit(post) : undefined}
              onDelete={
                canPost && post.missionaryId === ownerId
                  ? () => {
                      setDeleteError('');
                      setDeleting(post);
                    }
                  : undefined
              }
              loading={editingId === post.id}
              disabled={editor !== null || editingId !== null || remove.isPending}
            />
          ))}
          {feed.hasNextPage && (
            <PillButton
              tone="primarySoftOutline"
              loading={feed.isFetchingNextPage}
              onClick={() => void feed.fetchNextPage()}
            >
              Carregar mais postagens
            </PillButton>
          )}
        </Stack>
      </Box>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir postagem?"
        description={
          <>
            {deleteError && (
              <Box component="span" role="alert" sx={{ display: 'block', color: 'error.main' }}>
                {deleteError}
              </Box>
            )}
            A postagem será excluída. As imagens serão removidas pelo sistema em seguida. Esta ação
            não pode ser desfeita.
          </>
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir postagem"
        confirmTone="danger"
        loading={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting && !remove.isPending) remove.mutate(deleting.id);
        }}
      />
    </Stack>
  );
}
