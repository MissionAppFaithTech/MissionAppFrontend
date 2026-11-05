'use client';

import { useMemo, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import PillButton from '@/components/common/PillButton';
import { SELECT_OTHER } from '@/forms/register/options';
import { CATALOG_SEARCH_MIN_LENGTH } from '@/lib/catalog/search';
import type { CatalogKind } from '@/lib/query/keys';
import type { CatalogItem } from '@/services/catalog.service';
import { useCatalogSearch } from '@/services/queries/catalog';

/** Read by screen readers only (result count of the live search). */
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

type Option =
  | { type: 'item'; id: string; name: string }
  | { type: 'add'; name: string }
  | { type: 'info'; message: string; retry?: boolean; error?: boolean };

const COPY: Record<CatalogKind, { add: string; none: string; placeholder: string }> = {
  missionaryAgencies: {
    add: 'Adicionar Agência Missionária',
    none: 'Nenhuma agência missionária encontrada',
    placeholder: 'Digite o nome da agência',
  },
  faithCommunities: {
    add: 'Adicionar Comunidade de Fé',
    none: 'Nenhuma comunidade de fé encontrada',
    placeholder: 'Digite o nome da comunidade de fé',
  },
};

type CatalogAutocompleteProps = {
  id: string;
  label: string;
  kind: CatalogKind;
  /** Catalog id, `SELECT_OTHER` for a new item being registered, or `''`. */
  value: string;
  /** Name shown for `value` (the search does not load the whole catalog). */
  selectedName?: string;
  /** A catalog item was picked (`''` when the field is cleared). */
  onChange: (value: string, item?: CatalogItem) => void;
  /** "+ Adicionar …" was chosen, with what the user typed. Omit to hide it. */
  onAddNew?: (typedName: string) => void;
  /** Name of the new item when `value` is `SELECT_OTHER`. */
  otherSummary?: string;
  onEditOther?: () => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  /**
   * Lets react-hook-form validate when the user leaves the field. While the
   * "+ Adicionar" modal is open the caller should skip it: focus moving into the
   * modal is not the user leaving the field.
   */
  onBlur?: () => void;
};

function selectedOption(value: string, selectedName?: string, otherSummary?: string) {
  if (!value) return null;
  if (value === SELECT_OTHER) {
    return { type: 'item', id: SELECT_OTHER, name: otherSummary || 'Novo cadastro' } as const;
  }
  return { type: 'item', id: value, name: selectedName || '' } as const;
}

function announcement(status: string, count: number, none: string) {
  if (status === 'loading') return 'Buscando…';
  if (status !== 'ready') return '';
  if (count === 0) return `${none}.`;
  return count === 1 ? '1 resultado encontrado.' : `${count} resultados encontrados.`;
}

/**
 * Search field for a catalog (agencies, faith communities) that asks the
 * server as the user types (backend ADR-0041): debounced, the previous request
 * aborted, never the whole catalog. "+ Adicionar …" always sits at the end of
 * the list — highlighted when nothing matches — to register a missing item
 * without leaving the form.
 */
export default function CatalogAutocomplete({
  id,
  label,
  kind,
  value,
  selectedName,
  onChange,
  onAddNew,
  otherSummary,
  onEditOther,
  required = false,
  error = false,
  helperText,
  onBlur,
}: CatalogAutocompleteProps) {
  const copy = COPY[kind];
  const [input, setInput] = useState(value === SELECT_OTHER ? '' : (selectedName ?? ''));
  const [open, setOpen] = useState(false);
  // NOTE: "Tentar novamente" is not a value; the list stays open for the new results.
  const keepOpen = useRef(false);
  // NOTE: "+ Adicionar" opens a modal. MUI puts the focus back on this input
  // before the modal takes it, and openOnFocus would reopen the list on top of
  // the modal (and again when the modal gives the focus back). The list stays
  // shut until the user presses a key or a pointer in this field.
  const addingNew = useRef(false);
  const resumeAfterAdd = () => {
    addingNew.current = false;
  };
  // NOTE: MUI compares the value by reference and resets the text on every change
  const selected = useMemo(
    () => selectedOption(value, selectedName, otherSummary),
    [value, selectedName, otherSummary]
  );
  // NOTE: the text of the chosen item is not a search (saved value, a pick).
  const search = useCatalogSearch(kind, selected && input === selected.name ? '' : input);
  const helperId = `${id}-helper`;
  const statusId = `${id}-status`;

  const options: Option[] = search.items.map((item) => ({ type: 'item' as const, ...item }));
  if (search.status === 'short') {
    options.push({
      type: 'info',
      message: `Digite ao menos ${CATALOG_SEARCH_MIN_LENGTH} letras para buscar.`,
    });
  } else if (search.status === 'error') {
    options.push({
      type: 'info',
      message: search.error ?? 'Não foi possível buscar.',
      error: true,
    });
    options.push({ type: 'info', message: 'Tentar novamente', retry: true });
  } else if (search.status === 'loading' && options.length === 0) {
    options.push({ type: 'info', message: 'Buscando…' });
  } else if (search.status === 'ready' && options.length === 0) {
    options.push({ type: 'info', message: `${copy.none}.` });
  } else if (search.hasMore) {
    options.push({ type: 'info', message: 'Continue digitando para encontrar outros resultados.' });
  }
  const noResults = search.status === 'ready' && search.items.length === 0;
  if (onAddNew) options.push({ type: 'add', name: input.trim() });

  return (
    <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }} onPointerDownCapture={resumeAfterAdd}>
      <Autocomplete<Option, false, false, false>
        id={id}
        options={options}
        value={selected}
        inputValue={input}
        onInputChange={(_event, next, reason) => {
          // NOTE: MUI would write the picked option's label ("Adicionar …",
          // "Tentar novamente") over what the user typed; items set it in onChange.
          if (reason !== 'selectOption') setInput(next);
        }}
        open={open}
        onOpen={() => {
          if (!addingNew.current) setOpen(true);
        }}
        onKeyDown={resumeAfterAdd}
        onClose={() => {
          if (keepOpen.current) {
            keepOpen.current = false;
            return;
          }
          setOpen(false);
        }}
        onChange={(_event, option) => {
          if (!option) return onChange('');
          if (option.type === 'item') {
            setInput(option.name);
            return onChange(option.id, option);
          }
          if (option.type === 'add') {
            addingNew.current = true;
            setOpen(false);
            return onAddNew?.(input.trim());
          }
          if (option.retry) {
            keepOpen.current = true;
            search.retry();
          }
        }}
        onBlur={onBlur}
        // NOTE: the server already filtered; MUI must not filter again
        filterOptions={(all) => all}
        getOptionLabel={(option) =>
          option.type === 'info' ? option.message : option.type === 'add' ? copy.add : option.name
        }
        getOptionKey={(option) =>
          option.type === 'item'
            ? option.id
            : `${option.type}:${'message' in option ? option.message : ''}`
        }
        isOptionEqualToValue={(option, current) =>
          option.type === 'item' && current.type === 'item' && option.id === current.id
        }
        getOptionDisabled={(option) => option.type === 'info' && !option.retry}
        loading={search.isSearching}
        loadingText="Buscando…"
        noOptionsText={`${copy.none}.`}
        openOnFocus
        autoHighlight={false}
        clearText="Limpar"
        openText="Abrir sugestões"
        closeText="Fechar sugestões"
        renderOption={({ key, ...props }, option) => (
          <Box
            component="li"
            key={key}
            {...props}
            sx={
              option.type === 'add'
                ? {
                    fontWeight: 700,
                    color: 'primary.main',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    ...(noResults ? { bgcolor: 'action.selected' } : {}),
                  }
                : option.type === 'info'
                  ? option.error
                    ? // NOTE: black (text.primary) + icon, never a faded grey or color alone
                      { color: 'text.primary', fontWeight: 500 }
                    : option.retry
                      ? { color: 'primary.main', fontWeight: 700 }
                      : { color: 'text.secondary', fontStyle: 'italic' }
                  : undefined
            }
          >
            {option.type === 'add' ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                <AddIcon aria-hidden fontSize="small" />
                <span>{copy.add}</span>
              </Stack>
            ) : option.type === 'info' && (option.error || option.retry) ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                {option.error ? (
                  <ErrorOutlineIcon aria-hidden fontSize="small" color="error" />
                ) : (
                  <RefreshIcon aria-hidden fontSize="small" />
                )}
                <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
                  {option.message}
                </Box>
              </Stack>
            ) : option.type === 'info' ? (
              option.message
            ) : (
              <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
                {option.name}
              </Box>
            )}
          </Box>
        )}
        slotProps={{
          listbox: {
            sx: {
              '& .MuiAutocomplete-option': { minHeight: 44 },
              // NOTE: MUI fades disabled options to 38% opacity; the notices must
              // stay readable (WCAG 1.4.3), so only their color sets them apart.
              '& .MuiAutocomplete-option[aria-disabled="true"]': { opacity: 1 },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={helperText}
            placeholder={copy.placeholder}
            slotProps={{
              ...params.slotProps,
              inputLabel: { ...params.slotProps.inputLabel, shrink: true },
              formHelperText: { id: helperId },
              htmlInput: {
                ...params.slotProps.htmlInput,
                'aria-describedby': [helperText ? helperId : null, statusId]
                  .filter(Boolean)
                  .join(' '),
                'aria-invalid': error || undefined,
              },
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {search.isSearching ? (
                      <CircularProgress aria-hidden color="inherit" size={18} />
                    ) : null}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
      <Box id={statusId} role="status" aria-live="polite" sx={visuallyHidden}>
        {announcement(search.status, search.items.length, copy.none)}
      </Box>
      {value === SELECT_OTHER && otherSummary && onEditOther ? (
        <PillButton
          type="button"
          tone="primarySoftOutline"
          size="small"
          onClick={onEditOther}
          aria-label={`Editar cadastro de ${otherSummary}`}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, minHeight: 44 }}
        >
          Editar cadastro
        </PillButton>
      ) : null}
    </Stack>
  );
}
