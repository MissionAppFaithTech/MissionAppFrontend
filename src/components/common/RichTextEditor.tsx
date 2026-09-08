'use client';

import { useEffect, useState, useCallback, useId, useRef } from 'react';
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
import Paper from '@mui/material/Paper';
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

  // Controlled vs uncontrolled state
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const currentValue = isControlled ? (value ?? '') : internalValue;

  // History stack for Undo / Redo
  const [history, setHistory] = useState<string[]>([currentValue]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const prevValueRef = useRef<string>(currentValue);
  /**
   * Whether the newest history entry is still open to absorb more typing.
   *
   * Undo works per word, not per keystroke: consecutive characters keep rewriting
   * the same entry, and the entry is sealed once the word is closed with
   * whitespace. So one undo takes back "world", not "d".
   */
  const isEntryOpenRef = useRef(false);

  const sealHistoryEntry = () => {
    isEntryOpenRef.current = false;
  };

  // Sync external controlled value changes safely without re-render loop
  useEffect(() => {
    if (isControlled && value !== undefined && value !== prevValueRef.current) {
      prevValueRef.current = value;
      // An external change is its own step; never fold it into the open entry.
      sealHistoryEntry();
      setHistory((prev) => {
        if (prev[prev.length - 1] === value) return prev;
        return [...prev, value];
      });
      setHistoryIndex((prev) => prev + 1);
    }
  }, [value, isControlled]);

  // Saved draft detection
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

  const canUndo = historyIndex > 0 && !disabled;
  const canRedo = historyIndex < history.length - 1 && !disabled;

  const handleTextChange = (newValue: string) => {
    if (maxLength && newValue.length > maxLength) return;
    prevValueRef.current = newValue;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);

    const previousValue = currentValue;
    const isSingleInsert =
      newValue.length === previousValue.length + 1 && newValue.startsWith(previousValue);
    const isSingleDelete =
      newValue.length === previousValue.length - 1 && previousValue.startsWith(newValue);
    const editedChar = isSingleInsert
      ? newValue.slice(-1)
      : isSingleDelete
        ? previousValue.slice(-1)
        : null;
    // Anything that is not a single character at the end — a paste, or an edit in
    // the middle of the text — is a step of its own.
    const isTyping = editedChar !== null;
    const closesWord = isTyping && /\s/.test(editedChar);

    if (isEntryOpenRef.current && isTyping) {
      // Keep rewriting the entry this word is being typed into.
      setHistory((prev) => [...prev.slice(0, historyIndex), newValue]);
    } else {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), newValue]);
      setHistoryIndex((prev) => prev + 1);
    }
    // Whitespace is absorbed by the word it closes, so the next character opens a
    // fresh entry and undo lands on a word boundary.
    isEntryOpenRef.current = isTyping && !closesWord;

    // Autosave draft to localStorage
    if (draftKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`draft_${draftKey}`, newValue);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastSavedDraft(timeStr);
      } catch {
        // Ignore localStorage quota errors
      }
    }
  };

  const handleUndo = () => {
    if (!canUndo) return;
    // Typing after an undo starts a new word rather than reopening the old one.
    sealHistoryEntry();
    const nextIndex = historyIndex - 1;
    const targetValue = history[nextIndex] ?? '';
    setHistoryIndex(nextIndex);
    prevValueRef.current = targetValue;
    if (!isControlled) {
      setInternalValue(targetValue);
    }
    onChange?.(targetValue);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    // Typing after an undo starts a new word rather than reopening the old one.
    sealHistoryEntry();
    const nextIndex = historyIndex + 1;
    const targetValue = history[nextIndex] ?? '';
    setHistoryIndex(nextIndex);
    prevValueRef.current = targetValue;
    if (!isControlled) {
      setInternalValue(targetValue);
    }
    onChange?.(targetValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
    }
  };

  // Restore draft handler
  const handleRestoreDraft = useCallback(() => {
    if (savedDraftContent) {
      sealHistoryEntry();
      prevValueRef.current = savedDraftContent;
      if (!isControlled) {
        setInternalValue(savedDraftContent);
      }
      onChange?.(savedDraftContent);
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), savedDraftContent]);
      setHistoryIndex((prev) => prev + 1);
      setHasDraftNotice(false);
    }
  }, [savedDraftContent, historyIndex, isControlled, onChange]);

  const handleDismissDraft = useCallback(() => {
    setHasDraftNotice(false);
    if (draftKey && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`draft_${draftKey}`);
      } catch {
        // Ignore
      }
    }
  }, [draftKey]);

  // Unsaved changes warning before window unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentValue && lastSavedDraft) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentValue, lastSavedDraft]);

  const minHeightPx = Math.max(72, minRows * 28);
  const currentLength = currentValue.length;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {label && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
          <Typography
            component="label"
            id={`${editorId}-label`}
            htmlFor={editorId}
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
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
        <Paper
          elevation={0}
          role="status"
          aria-live="polite"
          sx={{
            mb: 1.5,
            p: { xs: 1.5, sm: 1.75 },
            borderRadius: 2.5,
            border: '1.5px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'var(--mui-palette-action2-borderStrong)'
                : 'rgba(37, 99, 235, 0.25)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'brandFill.main' : 'rgba(37, 99, 235, 0.05)',
            boxShadow: (theme) => (theme.palette.mode === 'dark' ? 'var(--app-shadow-md)' : 'none'),
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.25, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.25,
              flex: 1,
              minWidth: 0,
            }}
          >
            <RestoreIcon
              sx={{
                fontSize: 22,
                color: (theme) =>
                  theme.palette.mode === 'dark' ? 'connection.main' : 'connection.main',
                mt: { xs: 0.25, sm: 0 },
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                lineHeight: 1.5,
                fontWeight: 500,
                flex: 1,
                minWidth: 0,
              }}
            >
              Existe um rascunho salvo anteriormente deste texto no seu aparelho.
            </Typography>
            <IconButton
              size="small"
              aria-label="Descartar aviso de rascunho"
              onClick={handleDismissDraft}
              sx={{
                display: { xs: 'inline-flex', sm: 'none' },
                color: (theme) =>
                  theme.palette.mode === 'dark' ? 'text.secondary' : 'text.secondary',
                minWidth: 44,
                minHeight: 44,
                m: -1,
                '&:hover': {
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' },
              flexShrink: 0,
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={handleRestoreDraft}
              startIcon={<RestoreIcon sx={{ fontSize: 18 }} />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                minHeight: 44,
                px: 2,
                fontWeight: 700,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                textTransform: 'none',
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
                color: '#FFFFFF',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'connection.light' : 'primary.dark',
                  boxShadow: 'none',
                },
              }}
            >
              Restaurar rascunho
            </Button>

            <IconButton
              size="small"
              aria-label="Descartar aviso de rascunho"
              onClick={handleDismissDraft}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                color: (theme) =>
                  theme.palette.mode === 'dark' ? 'text.secondary' : 'text.secondary',
                minWidth: 44,
                minHeight: 44,
                '&:hover': {
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
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
                      ? 'var(--mui-palette-action2-secondaryHoverWash)'
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
                ? 'var(--mui-palette-action2-fieldBg)'
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
            <Button
              variant="outlined"
              size="small"
              aria-label="Desfazer alteração"
              disabled={!canUndo}
              onClick={handleUndo}
              startIcon={<UndoIcon sx={{ fontSize: { xs: 20, sm: 18 } }} />}
              sx={{
                flex: { xs: 1, sm: 'initial' },
                minHeight: { xs: 44, sm: 38 },
                px: { xs: 2, sm: 1.75 },
                borderRadius: '9999px',
                fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderColor: canUndo
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-borderStrong)'
                        : 'rgba(13, 43, 92, 0.35)'
                  : 'divider',
                color: canUndo
                  ? (theme) => (theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main')
                  : 'text.disabled',
                bgcolor: canUndo
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-secondaryHoverWash)'
                        : 'rgba(255, 255, 255, 0.95)'
                  : 'transparent',
                boxShadow: canUndo ? '0 1px 3px rgba(13, 43, 92, 0.08)' : 'none',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'var(--app-chip-info-bg)'
                      : 'rgba(13, 43, 92, 0.08)',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
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

            {/* Botão Refazer em formato Pill Tátil Mobile-First */}
            <Button
              variant="outlined"
              size="small"
              aria-label="Refazer alteração"
              disabled={!canRedo}
              onClick={handleRedo}
              startIcon={<RedoIcon sx={{ fontSize: { xs: 20, sm: 18 } }} />}
              sx={{
                flex: { xs: 1, sm: 'initial' },
                minHeight: { xs: 44, sm: 38 },
                px: { xs: 2, sm: 1.75 },
                borderRadius: '9999px',
                fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderColor: canRedo
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-borderStrong)'
                        : 'rgba(13, 43, 92, 0.35)'
                  : 'divider',
                color: canRedo
                  ? (theme) => (theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main')
                  : 'text.disabled',
                bgcolor: canRedo
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-secondaryHoverWash)'
                        : 'rgba(255, 255, 255, 0.95)'
                  : 'transparent',
                boxShadow: canRedo ? '0 1px 3px rgba(13, 43, 92, 0.08)' : 'none',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'var(--app-chip-info-bg)'
                      : 'rgba(13, 43, 92, 0.08)',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
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
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'var(--mui-palette-action2-fieldBg)'
                      : 'rgba(13, 43, 92, 0.05)',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-secondaryHoverWash)'
                        : 'rgba(13, 43, 92, 0.12)',
                  },
                }}
              >
                <HelpOutlineIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Text Area Nativa e Acessível com Digitação e Estilização Fluida */}
        <Box
          component="textarea"
          id={editorId}
          value={currentValue}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={minRows}
          sx={{
            display: 'block',
            width: '100%',
            p: { xs: 2, sm: 2.25 },
            minHeight: `${minHeightPx}px`,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontSize: { xs: '1rem', sm: '0.9375rem' },
            lineHeight: 1.6,
            color: 'text.primary',
            bgcolor: 'transparent',
            fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.7 : 1,
            boxSizing: 'border-box',
            '&::placeholder': {
              color: 'text.disabled',
              opacity: 1,
            },
          }}
        />
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
            color: 'text.primary',
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
                    ? 'var(--mui-palette-action2-fieldBg)'
                    : 'rgba(13, 43, 92, 0.04)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                <PhoneIphoneIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
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
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
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
                    ? 'var(--mui-palette-action2-fieldBg)'
                    : 'rgba(13, 43, 92, 0.04)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                <LaptopIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
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
