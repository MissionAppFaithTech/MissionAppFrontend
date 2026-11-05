'use client';

import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Controller, useForm, type FieldErrors, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import EditBackButton from '@/components/profile/EditBackButton';
import LimitedTextField from '@/components/common/LimitedTextField';
import StyledTextArea from '@/components/common/StyledTextArea';
import CatalogAutocomplete from '@/forms/register/shared/CatalogAutocomplete';
import CreateFaithCommunityModal from '@/forms/register/shared/CreateFaithCommunityModal';
import CreateMissionaryAgencyModal from '@/forms/register/shared/CreateMissionaryAgencyModal';
import { EMPTY_FAITH_COMMUNITY, EMPTY_MISSIONARY_AGENCY } from '@/forms/register/options';
import { ApiError } from '@/lib/api/client';
import {
  ABOUT_LONG_MAX_LENGTH,
  ABOUT_SHORT_MAX_LENGTH,
  profileAboutSchema,
  type ProfileAboutFormData,
} from '@/schemas/profile.schema';
import { createFaithCommunity, createMissionaryAgency } from '@/services/catalog.service';
import type { UpdateAboutPayload } from '@/services/profile.service';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import type { ProfileAboutData, WorkAddressData } from '@/types/profile';

export type SaveAboutInput = {
  about?: UpdateAboutPayload;
  workAddress?: WorkAddressData;
};

type ProfileAboutEditSectionProps = {
  data: ProfileAboutData;
  /** Persists the changes; rejects with {@link ApiError} on failure. */
  onSave: (input: SaveAboutInput) => Promise<void>;
  /** Called after a successful save, or with `saved: false` when nothing changed. */
  onDone: (saved: boolean) => void;
  onCancel: () => void;
  /** Where "Voltar" leads (the profile's "Sobre"). */
  backHref: string;
  /** "Voltar" with unsaved changes, after the user confirms discarding them. */
  onDiscard: () => void;
};

type TextFieldName = Exclude<
  keyof ProfileAboutFormData,
  'workAddress' | 'missionaryAgencyId' | 'faithCommunityId'
>;

type AboutTextField =
  'aboutMe' | 'missionStorySummary' | 'originLocation' | 'prayerRequest' | 'lifeVerse';

const TEXT_FIELDS: Record<TextFieldName, AboutTextField> = {
  introduction: 'aboutMe',
  missionHistory: 'missionStorySummary',
  originLocation: 'originLocation',
  prayerRequests: 'prayerRequest',
  lifeVerse: 'lifeVerse',
};

const API_FIELD_TO_FORM: Record<string, FieldPath<ProfileAboutFormData>> = {
  aboutMe: 'introduction',
  missionStorySummary: 'missionHistory',
  originLocation: 'originLocation',
  prayerRequest: 'prayerRequests',
  lifeVerse: 'lifeVerse',
  missionaryAgencyId: 'missionaryAgencyId',
  faithCommunityId: 'faithCommunityId',
  zip: 'workAddress.zip',
  district: 'workAddress.district',
  city: 'workAddress.city',
  state: 'workAddress.state',
  country: 'workAddress.country',
  // The address is nested in `PATCH /missionaries/about`.
  'workAddress.zip': 'workAddress.zip',
  'workAddress.district': 'workAddress.district',
  'workAddress.city': 'workAddress.city',
  'workAddress.state': 'workAddress.state',
  'workAddress.country': 'workAddress.country',
};

const WORK_ADDRESS_INPUTS: Array<{
  key: keyof WorkAddressData;
  label: string;
  autoComplete: string;
  maxLength: number;
}> = [
  { key: 'country', label: 'País', autoComplete: 'country-name', maxLength: 255 },
  { key: 'state', label: 'Estado ou província', autoComplete: 'address-level1', maxLength: 255 },
  { key: 'city', label: 'Cidade', autoComplete: 'address-level2', maxLength: 255 },
  { key: 'district', label: 'Bairro', autoComplete: 'address-level3', maxLength: 255 },
  { key: 'zip', label: 'CEP ou código postal', autoComplete: 'postal-code', maxLength: 20 },
];

// NOTE: ordem do documento — o primeiro campo inválido é quem recebe o foco.
const FIELD_DOM_IDS: Array<{ name: FieldPath<ProfileAboutFormData>; id: string }> = [
  { name: 'introduction', id: 'profile-about-introduction' },
  { name: 'missionHistory', id: 'profile-about-missionHistory' },
  { name: 'originLocation', id: 'profile-about-originLocation' },
  ...WORK_ADDRESS_INPUTS.map(({ key }) => ({
    name: `workAddress.${key}` as const,
    id: `profile-about-work-${key}`,
  })),
  { name: 'missionaryAgencyId', id: 'profile-about-missionaryAgency' },
  { name: 'faithCommunityId', id: 'profile-about-faithCommunity' },
  { name: 'prayerRequests', id: 'profile-about-prayerRequests' },
  { name: 'lifeVerse', id: 'profile-about-lifeVerse' },
];

function errorMessage(
  errors: FieldErrors<ProfileAboutFormData>,
  name: FieldPath<ProfileAboutFormData>
): string | undefined {
  const value = name.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, errors);
  if (!value || typeof value !== 'object' || !('message' in value)) return undefined;
  return typeof value.message === 'string' ? value.message : undefined;
}

function firstInvalidFieldId(errors: FieldErrors<ProfileAboutFormData>): string | null {
  for (const field of FIELD_DOM_IDS) {
    if (errorMessage(errors, field.name)) return field.id;
  }
  return null;
}

function toFormValues(data: ProfileAboutData): ProfileAboutFormData {
  const address = data.workAddress;
  return {
    introduction: data.introduction ?? '',
    missionHistory: data.missionHistory ?? '',
    originLocation: data.originLocation ?? '',
    prayerRequests: data.prayerRequests ?? '',
    lifeVerse: data.lifeVerse ?? '',
    missionaryAgencyId: data.missionaryAgencyId ?? '',
    faithCommunityId: data.faithCommunityId ?? '',
    workAddress: {
      country: address?.country ?? '',
      state: address?.state ?? '',
      city: address?.city ?? '',
      district: address?.district ?? '',
      zip: address?.zip ?? '',
    },
  };
}

/** Only changed fields are sent; an emptied field is sent as `null` to clear it. */
export function buildSaveAboutInput(
  values: ProfileAboutFormData,
  dirty: Partial<Record<keyof ProfileAboutFormData, unknown>>
): SaveAboutInput {
  const about: UpdateAboutPayload = {};
  for (const [formField, apiField] of Object.entries(TEXT_FIELDS) as Array<
    [TextFieldName, AboutTextField]
  >) {
    if (dirty[formField]) about[apiField] = values[formField] || null;
  }
  // The agency can only be replaced; an empty community unlinks it.
  if (dirty.missionaryAgencyId && values.missionaryAgencyId) {
    about.missionaryAgencyId = values.missionaryAgencyId;
  }
  if (dirty.faithCommunityId) about.faithCommunityId = values.faithCommunityId || null;

  const address = values.workAddress;
  const addressChanged = Boolean(dirty.workAddress);
  const addressComplete = Object.values(address).every((part) => part.length > 0);

  return {
    about: Object.keys(about).length > 0 ? about : undefined,
    workAddress: addressChanged && addressComplete ? address : undefined,
  };
}

function FormSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Stack component="fieldset" spacing={{ xs: 2, sm: 2.5 }} sx={{ border: 0, p: 0, m: 0 }}>
      <Typography
        id={id}
        component="legend"
        variant="subtitle1"
        color="primary.main"
        sx={{ fontWeight: 700, p: 0, mb: 0.5 }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
      {children}
    </Stack>
  );
}

export default function ProfileAboutEditSection({
  data,
  onSave,
  onDone,
  onCancel,
  backHref,
  onDiscard,
}: ProfileAboutEditSectionProps) {
  // NOTE: a busca não carrega o catálogo inteiro; o nome exibido vem do perfil
  // e passa a ser o do item escolhido ou cadastrado aqui
  const [agencyName, setAgencyName] = useState(data.missionaryAgency ?? '');
  const [communityName, setCommunityName] = useState(data.faithCommunity ?? '');
  const [creating, setCreating] = useState<{
    kind: 'agency' | 'community';
    name: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ id: string; tick: number } | null>(null);
  const requestFocus = (id: string | null) => {
    if (!id) return;
    setFocusRequest((current) => ({ id, tick: (current?.tick ?? 0) + 1 }));
  };
  const {
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProfileAboutFormData>({
    resolver: zodResolver(profileAboutSchema),
    mode: 'onTouched',
    shouldFocusError: false,
    values: toFormValues(data),
    resetOptions: { keepDirtyValues: true },
  });

  const dirty = Object.keys(dirtyFields).length > 0;

  useLayoutEffect(() => {
    if (isSubmitting || saving || !focusRequest) return;
    const id = focusRequest.id;
    // NOTE: o clique em Salvar termina depois deste efeito. focus() no mesmo
    // turno perde para o botão; o macrotask corre depois do clique.
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isSubmitting, saving, focusRequest]);

  const onSubmit = async (values: ProfileAboutFormData) => {
    setSubmitError(null);
    // The backend can replace the work address but not delete it: say so instead
    // of silently keeping the old one.
    const addressCleared = Object.values(values.workAddress).every((part) => part.length === 0);
    if (data.workAddress && addressCleared) {
      requestFocus('profile-about-work-country');
      setError(
        'workAddress.country',
        {
          type: 'validate',
          message: 'O local de atuação não pode ser removido. Preencha todos os campos.',
        },
        { shouldFocus: true }
      );
      return;
    }
    const input = buildSaveAboutInput(values, dirtyFields);
    if (!input.about && !input.workAddress) {
      onDone(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(input);
      onDone(true);
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
      let focused = false;
      for (const [apiField, message] of Object.entries(fieldErrors)) {
        const formField = API_FIELD_TO_FORM[apiField];
        if (!formField) continue;
        if (!focused) {
          requestFocus(FIELD_DOM_IDS.find((field) => field.name === formField)?.id ?? null);
        }
        setError(formField, { type: 'server', message }, { shouldFocus: !focused });
        focused = true;
      }
      if (!focused) {
        setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar o Sobre.');
      }
    } finally {
      setSaving(false);
    }
  };

  const textArea = (
    name: TextFieldName,
    label: string,
    options: { maxLength: number; minRows: number; placeholder: string }
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <StyledTextArea
          id={`profile-about-${name}`}
          inputRef={field.ref}
          label={label}
          value={field.value}
          onChange={field.onChange}
          minRows={options.minRows}
          maxLength={options.maxLength}
          placeholder={options.placeholder}
          error={Boolean(errors[name])}
          helperText={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex' }}>
        <EditBackButton href={backHref} dirty={dirty} onDiscard={onDiscard} disabled={saving} />
      </Box>
      <Card
        component="section"
        aria-labelledby="profile-about-edit-title"
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'var(--app-shadow-md)',
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit, (formErrors) => {
              requestFocus(firstInvalidFieldId(formErrors));
            })}
            noValidate
            aria-busy={isSubmitting || undefined}
          >
            <Stack spacing={{ xs: 3, sm: 4 }}>
              <Stack spacing={1}>
                <Typography
                  id="profile-about-edit-title"
                  component="h1"
                  variant="h6"
                  color="primary.main"
                >
                  Editar Sobre
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Todos os campos são opcionais. Para remover uma informação, apague o texto e
                  salve.
                </Typography>
              </Stack>

              {submitError ? (
                <Alert severity="error" role="alert">
                  {submitError}
                </Alert>
              ) : null}

              <FormSection id="about-section-story" title="Minha história">
                {textArea('introduction', 'Biografia', {
                  maxLength: ABOUT_LONG_MAX_LENGTH,
                  minRows: 4,
                  placeholder: 'Compartilhe sua trajetória, testemunho e chamado',
                })}
                {textArea('missionHistory', 'Resumo da minha história em missões', {
                  maxLength: ABOUT_LONG_MAX_LENGTH,
                  minRows: 4,
                  placeholder: 'Conte sobre os lugares e comunidades onde você serviu',
                })}
              </FormSection>

              <FormSection id="about-section-origin" title="Local de origem">
                <Controller
                  name="originLocation"
                  control={control}
                  render={({ field: { ref, ...field } }) => (
                    <LimitedTextField
                      {...field}
                      inputRef={ref}
                      id="profile-about-originLocation"
                      label="Cidade e país de origem"
                      placeholder="Ex.: Rio de Janeiro - Brasil"
                      size="small"
                      fullWidth
                      maxLength={ABOUT_SHORT_MAX_LENGTH}
                      error={Boolean(errors.originLocation)}
                      helperText={errors.originLocation?.message}
                      htmlInputProps={{
                        'aria-invalid': Boolean(errors.originLocation) || undefined,
                      }}
                    />
                  )}
                />
              </FormSection>

              <FormSection
                id="about-section-work"
                title="Local de atuação atual"
                description="Preencha todos os campos para atualizar onde você atua hoje."
              >
                <Grid container spacing={2}>
                  {WORK_ADDRESS_INPUTS.map(({ key, label, autoComplete, maxLength }) => {
                    const error = errors.workAddress?.[key]?.message;
                    return (
                      <Grid key={key} size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name={`workAddress.${key}`}
                          control={control}
                          render={({ field: { ref, ...field } }) => (
                            <LimitedTextField
                              {...field}
                              inputRef={ref}
                              id={`profile-about-work-${key}`}
                              label={label}
                              size="small"
                              fullWidth
                              autoComplete={autoComplete}
                              maxLength={maxLength}
                              error={Boolean(error)}
                              helperText={error}
                              htmlInputProps={{ 'aria-invalid': Boolean(error) || undefined }}
                            />
                          )}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </FormSection>

              <FormSection
                id="about-section-links"
                title="Agência e comunidade de fé"
                description="Escolha entre as cadastradas na plataforma."
              >
                <Controller
                  name="missionaryAgencyId"
                  control={control}
                  render={({ field }) => (
                    <CatalogAutocomplete
                      id="profile-about-missionaryAgency"
                      kind="missionaryAgencies"
                      label="Agência missionária"
                      required
                      value={field.value}
                      selectedName={agencyName}
                      onChange={(value, item) => {
                        field.onChange(value);
                        setAgencyName(item?.name ?? '');
                      }}
                      onAddNew={(name) => setCreating({ kind: 'agency', name })}
                      onBlur={field.onBlur}
                      error={Boolean(errors.missionaryAgencyId)}
                      helperText={errors.missionaryAgencyId?.message}
                    />
                  )}
                />
                <Controller
                  name="faithCommunityId"
                  control={control}
                  render={({ field }) => (
                    <CatalogAutocomplete
                      id="profile-about-faithCommunity"
                      kind="faithCommunities"
                      label="Comunidade de fé"
                      value={field.value}
                      selectedName={communityName}
                      onChange={(value, item) => {
                        field.onChange(value);
                        setCommunityName(item?.name ?? '');
                      }}
                      onAddNew={(name) => setCreating({ kind: 'community', name })}
                      onBlur={field.onBlur}
                      error={Boolean(errors.faithCommunityId)}
                      helperText={
                        errors.faithCommunityId?.message ??
                        'Deixe em branco se não estiver ligado a uma comunidade de fé.'
                      }
                    />
                  )}
                />
              </FormSection>

              <FormSection id="about-section-faith" title="Oração e fé">
                {textArea('prayerRequests', 'Pedidos de oração', {
                  maxLength: ABOUT_LONG_MAX_LENGTH,
                  minRows: 3,
                  placeholder: 'Pelo que as pessoas podem orar por você e pelo seu ministério',
                })}
                {textArea('lifeVerse', 'Versículo para a vida', {
                  maxLength: ABOUT_SHORT_MAX_LENGTH,
                  minRows: 2,
                  placeholder: 'Ex.: Tudo posso naquele que me fortalece. (Filipenses 4:13)',
                })}
              </FormSection>

              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={1.5}
                useFlexGap
                sx={{
                  pt: 1,
                  justifyContent: 'flex-end',
                  '& .MuiButton-root': {
                    ...FORM_ACTION_BUTTON_SX,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: 'center',
                  },
                }}
              >
                <Box sx={{ mr: { sm: 'auto' }, display: 'flex' }}>
                  <EditBackButton
                    href={backHref}
                    dirty={dirty}
                    onDiscard={onDiscard}
                    disabled={saving}
                  />
                </Box>
                <PillButton
                  type="button"
                  tone="primarySoftOutline"
                  size="medium"
                  onClick={onCancel}
                  disabled={saving}
                >
                  Cancelar
                </PillButton>
                <PillButton
                  type="submit"
                  tone="primaryFilled"
                  size="medium"
                  loading={saving}
                  onMouseDown={(event) => {
                    // NOTE: sem isto o mousedown foca Salvar e o Chrome devolve o
                    // foco para o botão depois da validação.
                    event.preventDefault();
                  }}
                >
                  Salvar
                </PillButton>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
        {/* "+ Adicionar …": cadastra na hora (Server Action) e já seleciona o item */}
        <CreateMissionaryAgencyModal
          open={creating?.kind === 'agency'}
          initialValues={{ ...EMPTY_MISSIONARY_AGENCY, name: creating?.name ?? '' }}
          onClose={() => setCreating(null)}
          onSave={async (details) => {
            const item = await createMissionaryAgency(details);
            setValue('missionaryAgencyId', item.id, { shouldDirty: true, shouldValidate: true });
            setAgencyName(item.name);
            setCreating(null);
          }}
        />
        <CreateFaithCommunityModal
          open={creating?.kind === 'community'}
          initialValues={{ ...EMPTY_FAITH_COMMUNITY, name: creating?.name ?? '' }}
          onClose={() => setCreating(null)}
          onSave={async (details) => {
            const item = await createFaithCommunity(details);
            setValue('faithCommunityId', item.id, { shouldDirty: true, shouldValidate: true });
            setCommunityName(item.name);
            setCreating(null);
          }}
        />
      </Card>
    </Stack>
  );
}
