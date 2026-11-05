'use client';

import { useState, type ReactNode, type SyntheticEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import CreateFaithCommunityModal from '@/forms/register/shared/CreateFaithCommunityModal';
import CreateMissionaryAgencyModal from '@/forms/register/shared/CreateMissionaryAgencyModal';
import CatalogAutocomplete from '@/forms/register/shared/CatalogAutocomplete';
import { EMPTY_FAITH_COMMUNITY, EMPTY_MISSIONARY_AGENCY } from '@/forms/register/options';
import { ApiError } from '@/lib/api/client';
import type { CatalogKind } from '@/lib/query/keys';
import {
  createFaithCommunity,
  createMissionaryAgency,
  type CatalogItem,
} from '@/services/catalog.service';

/** `PATCH /me/about` field that holds each link. */
const LINK_API_FIELD: Record<CatalogKind, string> = {
  missionaryAgencies: 'missionaryAgencyId',
  faithCommunities: 'faithCommunityId',
};

type CatalogLinkSectionProps = {
  /** Section anchor (quick navigation). */
  id: string;
  kind: CatalogKind;
  icon: ReactNode;
  title: string;
  subheader: string;
  selectLabel: string;
  saveLabel: string;
  cancelLabel: string;
  /** Saved catalog item. */
  savedId?: string;
  savedName?: string;
  /** Without it, clearing the field unlinks the item. */
  required?: boolean;
  hint?: string;
  /** Persists the link (`''` = none) and resolves with the saved catalog id. */
  onSave: (id: string) => Promise<string>;
};

/**
 * Account settings block that links the missionary to a catalog item (faith
 * community or agency). The field searches the catalog on the server (backend
 * ADR-0041); "+ Adicionar …" registers a missing item in the sign-up modal,
 * which shows the API's field errors on its own fields, and selects it.
 */
export default function CatalogLinkSection({
  id,
  kind,
  icon,
  title,
  subheader,
  selectLabel,
  saveLabel,
  cancelLabel,
  savedId = '',
  savedName,
  required = false,
  hint,
  onSave,
}: CatalogLinkSectionProps) {
  const isCommunity = kind === 'faithCommunities';

  const [saved, setSaved] = useState({ id: savedId, name: savedName ?? '' });
  const [value, setValue] = useState({ id: savedId, name: savedName ?? '' });
  // The server's link wins when it changes (edited in "Sobre", another account).
  // Remounts the field so its text follows a reset, a new item or the server.
  const [fieldKey, setFieldKey] = useState(0);
  const [synced, setSynced] = useState({ id: savedId, name: savedName });
  if (synced.id !== savedId || synced.name !== savedName) {
    setSynced({ id: savedId, name: savedName });
    // NOTE: the refresh after our own "Salvar" brings what this form saved; only
    // a link changed elsewhere replaces the field (and what the user is typing).
    if (saved.id !== savedId || saved.name !== (savedName ?? '')) {
      setSaved({ id: savedId, name: savedName ?? '' });
      setValue({ id: savedId, name: savedName ?? '' });
      setFieldKey((key) => key + 1);
    }
  }
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectId = `${id}-select`;
  const dirty = value.id !== saved.id;

  const pick = (next: { id: string; name: string }, remount = false) => {
    setValue(next);
    setError(null);
    if (remount) setFieldKey((key) => key + 1);
  };

  const handleCancel = () => {
    pick(saved, true);
    setSubmitError(null);
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (required && !value.id) {
      setError(isCommunity ? 'Selecione a comunidade de fé.' : 'Selecione a agência missionária.');
      document.getElementById(selectId)?.focus();
      return;
    }

    setError(null);
    setSubmitError(null);
    setSaving(true);
    try {
      const savedIdNow = await onSave(value.id);
      setSaved({ id: savedIdNow, name: value.name });
      setValue({ id: savedIdNow, name: value.name });
    } catch (saveError) {
      // The link field's own error (item removed meanwhile...) goes on the field.
      const fieldError =
        saveError instanceof ApiError ? saveError.fieldErrors[LINK_API_FIELD[kind]] : undefined;
      if (fieldError) {
        setError(fieldError);
        document.getElementById(selectId)?.focus();
      } else {
        setSubmitError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar.');
      }
    } finally {
      setSaving(false);
    }
  };

  const registered = (item: CatalogItem) => {
    pick({ id: item.id, name: item.name }, true);
    setCreating(null);
  };

  return (
    <Card id={id} variant="outlined" sx={{ borderRadius: 3, scrollMarginTop: 80 }}>
      <CardHeader
        avatar={icon}
        title={title}
        subheader={subheader}
        slotProps={{
          title: {
            component: 'h2',
            sx: { fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } },
          },
          subheader: { sx: { fontSize: '0.875rem' } },
        }}
      />
      <Divider />
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box component="form" onSubmit={handleSubmit} noValidate aria-busy={saving || undefined}>
          <Stack spacing={3}>
            {hint ? (
              <Typography variant="body2" color="text.secondary">
                {hint}
              </Typography>
            ) : null}

            <CatalogAutocomplete
              key={fieldKey}
              id={selectId}
              label={selectLabel}
              kind={kind}
              required={required}
              value={value.id}
              selectedName={value.name}
              onChange={(next, item) => pick({ id: next, name: item?.name ?? '' })}
              onAddNew={(typed) => setCreating(typed)}
              error={Boolean(error)}
              helperText={error ?? undefined}
            />

            {submitError ? (
              <Alert severity="error" role="alert">
                {submitError}
              </Alert>
            ) : null}

            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={1.5}
              useFlexGap
              sx={{
                pt: 1,
                '& .MuiButton-root': {
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: 44,
                  justifyContent: 'center',
                },
              }}
            >
              <PillButton
                type="button"
                tone="primarySoftOutline"
                size="small"
                onClick={handleCancel}
                disabled={!dirty || saving}
                aria-label={cancelLabel}
              >
                Cancelar
              </PillButton>
              <PillButton type="submit" tone="primaryFilled" size="small" loading={saving}>
                {saveLabel}
              </PillButton>
            </Stack>
          </Stack>
        </Box>

        {isCommunity ? (
          <CreateFaithCommunityModal
            open={creating !== null}
            initialValues={{ ...EMPTY_FAITH_COMMUNITY, name: creating ?? '' }}
            onClose={() => setCreating(null)}
            onSave={async (details) => registered(await createFaithCommunity(details))}
          />
        ) : (
          <CreateMissionaryAgencyModal
            open={creating !== null}
            initialValues={{ ...EMPTY_MISSIONARY_AGENCY, name: creating ?? '' }}
            onClose={() => setCreating(null)}
            onSave={async (details) => registered(await createMissionaryAgency(details))}
          />
        )}
      </CardContent>
    </Card>
  );
}
