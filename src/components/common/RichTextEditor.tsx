'use client';

import { useEffect, useState, useCallback, useId, useSyncExternalStore } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LaptopIcon from '@mui/icons-material/Laptop';
import PillButton from '@/components/common/PillButton';

export interface RichTextEditorProps {
  id?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  minRows?: number;
  error?: boolean;
  helperText?: string;
  draftKey?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}

export function normalizeEditorOutput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<\/p><p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export default function RichTextEditor({
  id: explicitId,
  label,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Toque aqui para começar a escrever...',
  minRows = 3,
  error = false,
  helperText,
  draftKey,
  disabled = false,
  required = false,
  maxLength,
}: RichTextEditorProps) {
  const generatedId = useId();
  const editorId = explicitId || `rich-editor-${generatedId}`;
  const [helpOpen, setHelpOpen] = useState(false);
  const [lastSavedDraft, setLastSavedDraft] = useState<string | null>(null);
  const [, setEditorVersion] = useState(0);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [savedDraftContent] = useState<string | null>(() => {
    if (!draftKey || typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`draft_${draftKey}`);
      if (stored && stored.trim() && stored !== (value || defaultValue)) {
        return stored;
      }
    } catch {
      // Ignore
    }
    return null;
  });
  const [hasDraftNotice, setHasDraftNotice] = useState<boolean>(Boolean(savedDraftContent));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value !== undefined ? value : defaultValue,
    editable: !disabled,
    onTransaction: () => {
      setEditorVersion((v) => v + 1);
    },
    onUpdate: ({ editor: currentEditor }) => {
      const plainText = currentEditor.getText({ blockSeparator: '\n' });
      onChange?.(plainText);

      // Autosave draft to localStorage with timestamp
      if (draftKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`draft_${draftKey}`, plainText);
          const now = new Date();
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          setLastSavedDraft(timeStr);
        } catch {
          // Ignore localStorage quota errors
        }
      }
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentEditorText = editor.getText({ blockSeparator: '\n' });
      if (value !== currentEditorText) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [editor, value]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // Restore draft handler
  const handleRestoreDraft = useCallback(() => {
    if (editor && savedDraftContent) {
      editor.commands.setContent(savedDraftContent, { emitUpdate: true });
      setHasDraftNotice(false);
      setEditorVersion((v) => v + 1);
    }
  }, [editor, savedDraftContent, setHasDraftNotice]);

  const handleDismissDraft = useCallback(() => {
    setHasDraftNotice(false);
    if (draftKey && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`draft_${draftKey}`);
      } catch {
        // Ignore
      }
    }
  }, [draftKey, setHasDraftNotice]);

  // Unsaved changes warning before window unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editor && !editor.isEmpty && lastSavedDraft) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editor, lastSavedDraft]);

  const currentLength = (
    value !== undefined ? value : editor?.getText({ blockSeparator: '\n' }) || defaultValue
  ).length;

  if (!isClient) {
    return (
      <Box sx={{ width: '100%' }}>
        {label && (
          <Typography
            variant="body2"
            sx={{
              mb: 0.75,
              fontWeight: 600,
              color: 'primary.main',
              fontSize: { xs: '0.9375rem', sm: '0.875rem' },
            }}
          >
            {label.endsWith(':') ? label : `${label}:`}
            {required && (
              <span aria-hidden="true" style={{ color: '#d32f2f', marginLeft: 4 }}>
                *
              </span>
            )}
          </Typography>
        )}
        <Box
          sx={{
            minHeight: `${minRows * 28 + 56}px`,
            borderRadius: { xs: 2.5, sm: 2 },
            border: '1px solid',
            borderColor: error ? 'error.main' : 'divider',
            bgcolor: 'background.paper',
            p: 2,
          }}
        />
      </Box>
    );
  }

  const minHeightPx = Math.max(72, minRows * 28);
  const isUndoActive = Boolean(editor?.can().undo() && !disabled);
  const isRedoActive = Boolean(editor?.can().redo() && !disabled);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {label && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
          <Typography
            component="label"
            htmlFor={editorId}
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              fontSize: { xs: '0.9375rem', sm: '0.875rem' },
            }}
          >
            {label.endsWith(':') ? label : `${label}:`}
            {required && (
              <Box component="span" sx={{ color: 'error.main', ml: 0.5 }} aria-hidden="true">
                *
              </Box>
            )}
          </Typography>
        </Stack>
      )}

      {hasDraftNotice && (
        <Alert
          severity="info"
          icon={<RestoreIcon fontSize="inherit" />}
          action={
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleRestoreDraft}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  minHeight: 36,
                  px: 1.5,
                }}
              >
                Restaurar rascunho
              </Button>
              <IconButton
                size="small"
                aria-label="Descartar aviso de rascunho"
                color="inherit"
                onClick={handleDismissDraft}
                sx={{ minWidth: 36, minHeight: 36 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          }
          sx={{ mb: 1.5, borderRadius: 2 }}
        >
          Existe um rascunho salvo anteriormente deste texto no seu aparelho.
        </Alert>
      )}

      {/* Editor Box */}
      <Box
        sx={{
          borderRadius: { xs: 2.5, sm: 2 },
          border: '1.5px solid',
          borderColor: error ? 'error.main' : 'divider',
          bgcolor: 'background.paper',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
            boxShadow: (theme) =>
              error
                ? '0 0 0 3px rgba(211, 47, 47, 0.2)'
                : `0 0 0 3px ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(144, 202, 249, 0.25)'
                      : 'rgba(13, 43, 92, 0.2)'
                  }`,
          },
        }}
      >
        {/* Mobile-First Ergonomic Action Bar (Thumb-Friendly Touch Targets) */}
        <Box
          component="div"
          role="toolbar"
          aria-label="Ações e histórico de edição"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 1.25 },
            px: { xs: 1.25, sm: 1.5 },
            py: { xs: 1, sm: 0.875 },
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(13, 43, 92, 0.04)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          }}
        >
          {/* Botões táteis de ação rápida com Ícone + Rótulo Textual (Diretriz GAIA / Mobile-First) */}
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.25 }}
            sx={{
              alignItems: 'center',
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {/* Botão Desfazer em formato Pill Tátil Mobile-First */}
            <Tooltip title="Desfazer última alteração (Ctrl + Z)" arrow>
              <Button
                variant="outlined"
                size="small"
                aria-label="Desfazer alteração"
                disabled={!isUndoActive}
                onClick={() => editor?.chain().focus().undo().run()}
                startIcon={<UndoIcon sx={{ fontSize: { xs: 20, sm: 18 } }} />}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  minHeight: { xs: 44, sm: 38 },
                  px: { xs: 2, sm: 1.75 },
                  borderRadius: '9999px',
                  fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: isUndoActive
                    ? (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.5)'
                          : 'rgba(13, 43, 92, 0.35)'
                    : 'divider',
                  color: isUndoActive ? 'primary.main' : 'text.disabled',
                  bgcolor: isUndoActive
                    ? (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.1)'
                          : 'rgba(255, 255, 255, 0.95)'
                    : 'transparent',
                  boxShadow: isUndoActive ? '0 1px 3px rgba(13, 43, 92, 0.08)' : 'none',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(144, 202, 249, 0.18)'
                        : 'rgba(13, 43, 92, 0.08)',
                    borderColor: 'primary.main',
                  },
                  '&:active': {
                    transform: 'scale(0.97)',
                  },
                  '&.Mui-disabled': {
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    color: 'text.disabled',
                    boxShadow: 'none',
                  },
                }}
              >
                Desfazer
              </Button>
            </Tooltip>

            {/* Botão Refazer em formato Pill Tátil Mobile-First */}
            <Tooltip title="Refazer alteração (Ctrl + Y)" arrow>
              <Button
                variant="outlined"
                size="small"
                aria-label="Refazer alteração"
                disabled={!isRedoActive}
                onClick={() => editor?.chain().focus().redo().run()}
                startIcon={<RedoIcon sx={{ fontSize: { xs: 20, sm: 18 } }} />}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  minHeight: { xs: 44, sm: 38 },
                  px: { xs: 2, sm: 1.75 },
                  borderRadius: '9999px',
                  fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: isRedoActive
                    ? (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.5)'
                          : 'rgba(13, 43, 92, 0.35)'
                    : 'divider',
                  color: isRedoActive ? 'primary.main' : 'text.disabled',
                  bgcolor: isRedoActive
                    ? (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.1)'
                          : 'rgba(255, 255, 255, 0.95)'
                    : 'transparent',
                  boxShadow: isRedoActive ? '0 1px 3px rgba(13, 43, 92, 0.08)' : 'none',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(144, 202, 249, 0.18)'
                        : 'rgba(13, 43, 92, 0.08)',
                    borderColor: 'primary.main',
                  },
                  '&:active': {
                    transform: 'scale(0.97)',
                  },
                  '&.Mui-disabled': {
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    color: 'text.disabled',
                    boxShadow: 'none',
                  },
                }}
              >
                Refazer
              </Button>
            </Tooltip>
          </Stack>

          {/* Ações e Informações Secundárias */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 0.5, sm: 0 },
            }}
          >
            {/* Status de salvamento de rascunho */}
            {draftKey && lastSavedDraft && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <CloudDoneOutlinedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                >
                  Salvo às {lastSavedDraft}
                </Typography>
              </Stack>
            )}

            {/* Contador de caracteres se maxLength */}
            {maxLength && (
              <Typography
                variant="caption"
                sx={{
                  ml: draftKey && lastSavedDraft ? 'auto' : 0,
                  fontWeight: 600,
                  color: currentLength > maxLength ? 'error.main' : 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                }}
              >
                {currentLength}/{maxLength} caracteres
              </Typography>
            )}

            {/* Botão de Ajuda Ergonômico */}
            <Tooltip title="Dicas de uso no celular e atalhos" arrow>
              <IconButton
                size="small"
                aria-label="Ajuda e atalhos de escrita para missionários"
                onClick={() => setHelpOpen(true)}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: '9999px',
                  color: 'primary.main',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(13, 43, 92, 0.05)',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(13, 43, 92, 0.12)',
                  },
                }}
              >
                <HelpOutlineIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Visually hidden synchronized textarea for native form submission and test compatibility */}
        <textarea
          id={editorId}
          value={
            value !== undefined ? value : editor?.getText({ blockSeparator: '\n' }) || defaultValue
          }
          onChange={(e) => {
            const val = e.target.value;
            onChange?.(val);
            if (editor && editor.getText({ blockSeparator: '\n' }) !== val) {
              editor.commands.setContent(val, { emitUpdate: false });
              setEditorVersion((v) => v + 1);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          tabIndex={-1}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            border: 0,
            overflow: 'hidden',
          }}
        />

        {/* Text Input Area with clean mobile-first typography */}
        <Box
          id={`${editorId}-visual`}
          sx={{
            p: { xs: 2, sm: 2.25 },
            minHeight: `${minHeightPx}px`,
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.7 : 1,
            '& .ProseMirror': {
              outline: 'none',
              minHeight: `${minHeightPx}px`,
              fontSize: { xs: '1rem', sm: '0.9375rem' },
              lineHeight: 1.6,
              color: 'text.primary',
              fontFamily: 'inherit',
              '& p': {
                margin: '0 0 0.5rem 0',
              },
              '& p:last-child': {
                margin: 0,
              },
              '& .is-editor-empty:first-of-type::before': {
                content: 'attr(data-placeholder)',
                float: 'left',
                color: 'text.disabled',
                pointerEvents: 'none',
                height: 0,
              },
            },
          }}
          onClick={() => {
            if (!editor?.isFocused && !disabled) {
              editor?.chain().focus().run();
            }
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {/* Helper text or error message */}
      {helperText && (
        <FormHelperText
          error={error}
          sx={{ mx: 1.5, mt: 0.5, fontSize: { xs: '0.8125rem', sm: '0.75rem' } }}
        >
          {helperText}
        </FormHelperText>
      )}

      {/* Senior-Friendly Help and Shortcuts Dialog (Mobile & Desktop) */}
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="shortcuts-dialog-title"
        aria-describedby="shortcuts-dialog-description"
        slotProps={{
          paper: {
            sx: { borderRadius: { xs: 3, sm: 4 }, p: { xs: 1, sm: 1.5 } },
          },
        }}
      >
        <DialogTitle
          id="shortcuts-dialog-title"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
          }}
        >
          Como Usar o Desfazer e Refazer
        </DialogTitle>
        <DialogContent id="shortcuts-dialog-description">
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Você pode escrever com total tranquilidade. Se apagar ou alterar algo por engano, você
            pode recuperar suas palavras facilmente:
          </Typography>

          <Stack spacing={2}>
            {/* Card Mobile */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(13, 43, 92, 0.04)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                <PhoneIphoneIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  No Celular ou Tablet
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5 }}>
                Toque nos botões <strong>Desfazer</strong> e <strong>Refazer</strong> que ficam logo
                acima do campo de texto. Eles foram projetados para o toque fácil do seu polegar.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '9999px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <UndoIcon fontSize="small" /> Desfazer
                </Box>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '9999px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <RedoIcon fontSize="small" /> Refazer
                </Box>
              </Stack>
            </Box>

            {/* Card Computador */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(13, 43, 92, 0.04)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                <LaptopIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  No Computador (Teclado)
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5 }}>
                Além dos botões na tela, você também pode usar os atalhos tradicionais do teclado:
              </Typography>

              <Stack spacing={1}>
                {[
                  { shortcut: 'Ctrl + Z', action: 'Desfazer a última alteração' },
                  { shortcut: 'Ctrl + Y', action: 'Refazer a alteração desfeita' },
                  { shortcut: 'Ctrl + C', action: 'Copiar texto selecionado' },
                  { shortcut: 'Ctrl + V', action: 'Colar texto copiado de forma limpa' },
                ].map(({ shortcut, action }) => (
                  <Stack key={shortcut} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                      component="kbd"
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'primary.main',
                        minWidth: 72,
                        textAlign: 'center',
                      }}
                    >
                      {shortcut}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.primary', fontSize: '0.8125rem' }}
                    >
                      {action}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, pb: { xs: 2, sm: 2.5 } }}>
          <PillButton
            tone="primaryFilled"
            size="medium"
            onClick={() => setHelpOpen(false)}
            sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' } }}
          >
            Entendido
          </PillButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
