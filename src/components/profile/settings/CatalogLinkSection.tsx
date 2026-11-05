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
import RegisterCatalogSelect from '@/forms/register/shared/RegisterCatalogSelect';
import { useOtherCatalogEntry } from '@/forms/register/shared/useOtherCatalogEntry';
import {
  EMPTY_FAITH_COMMUNITY,
  EMPTY_MISSIONARY_AGENCY,
  SELECT_OTHER,
} from '@/forms/register/options';
import type { CatalogKind } from '@/lib/query/keys';
import type { CatalogItem } from '@/services/catalog.service';
import { useCatalogItems } from '@/services/queries/catalog';
import type { FaithCommunityData, MissionaryAgencyData } from '@/types/account';

/** What the user picked: a catalog item (`''` = none) or a new one to register. */
export type CatalogSelection =
  | { kind: 'existing'; id: string }
  | { kind: 'new'; details: FaithCommunityData | MissionaryAgencyData };

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
  /** Without it, "nenhuma" is offered to unlink the item. */
  required?: boolean;
  emptyValueLabel?: string;
  hint?: string;
  /** Persists the selection and resolves with the saved catalog id. */
  onSave: (selection: CatalogSelection) => Promise<string>;
};

/** Keeps the saved item selectable while the catalog loads. */
function withSaved(items: CatalogItem[], id?: string, name?: string): CatalogItem[] {
  if (!id || items.some((item) => item.id === id)) return items;
  return [{ id, name: name || 'Atual' }, ...items];
}

/**
 * Account settings block that links the missionary to a catalog item (faith
 * community or agency), or registers a new one through the sign-up modals.
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
  emptyValueLabel,
  hint,
  onSave,
}: CatalogLinkSectionProps) {
  const catalog = useCatalogItems(kind);
  const entry = useOtherCatalogEntry();
  const isCommunity = kind === 'faithCommunities';
  const emptyDetails = isCommunity ? EMPTY_FAITH_COMMUNITY : EMPTY_MISSIONARY_AGENCY;

  const [saved, setSaved] = useState({ id: savedId, name: savedName });
  const [value, setValue] = useState(savedId);
  // The server's link wins when it changes (edited in "Sobre", another account).
  const [synced, setSynced] = useState({ id: savedId, name: savedName });
  if (synced.id !== savedId || synced.name !== savedName) {
    setSynced({ id: savedId, name: savedName });
    setSaved({ id: savedId, name: savedName });
    setValue(savedId);
  }
  const [details, setDetails] = useState<FaithCommunityData | MissionaryAgencyData>(emptyDetails);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectId = `${id}-select`;
  const dirty = value !== saved.id;
  const isOther = value === SELECT_OTHER;

  const handleCancel = () => {
    setValue(saved.id);
    setDetails(emptyDetails);
    setError(null);
    setSubmitError(null);
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (required && !value) {
      setError(isCommunity ? 'Selecione a comunidade de fé.' : 'Selecione a agência missionária.');
      document.getElementById(selectId)?.focus();
      return;
    }
    if (isOther && !details.name.trim()) {
      setError('Informe os dados do novo cadastro.');
      entry.openEditor();
      return;
    }

    setError(null);
    setSubmitError(null);
    setSaving(true);
    try {
      const savedIdNow = await onSave(
        isOther ? { kind: 'new', details } : { kind: 'existing', id: value }
      );
      setSaved({ id: savedIdNow, name: isOther ? details.name : savedName });
      setValue(savedIdNow);
      setDetails(emptyDetails);
    } catch (saveError) {
      setSubmitError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const closeModal = (complete: boolean) => entry.cancel(complete, setValue);
  const saveDetails = (next: FaithCommunityData | MissionaryAgencyData) => {
    setDetails(next);
    setValue(SELECT_OTHER);
    setError(null);
    entry.close();
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

            <RegisterCatalogSelect
              id={selectId}
              label={selectLabel}
              required={required}
              allowEmpty={!required}
              emptyValueLabel={emptyValueLabel}
              value={value}
              onChange={(next) => {
                setError(null);
                entry.selectValue(next, value, setValue);
              }}
              options={withSaved(catalog.items, saved.id, saved.name)}
              isLoading={catalog.isLoading}
              loadError={catalog.error}
              error={Boolean(error)}
              helperText={error ?? undefined}
              otherSummary={isOther ? details.name : undefined}
              onEditOther={entry.openEditor}
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
            open={entry.open}
            initialValues={details as FaithCommunityData}
            onClose={() => closeModal(Boolean(details.name.trim()))}
            onSave={saveDetails}
          />
        ) : (
          <CreateMissionaryAgencyModal
            open={entry.open}
            initialValues={details as MissionaryAgencyData}
            onClose={() => closeModal(Boolean(details.name.trim()))}
            onSave={saveDetails}
          />
        )}
      </CardContent>
    </Card>
  );
}
