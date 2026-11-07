'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PillButton from '@/components/common/PillButton';
import EmptyState from '@/components/common/EmptyState';
import RejectRegistrationDialog from '@/forms/admin/RejectRegistrationDialog';
import { registrationDate, registrationTime } from '@/lib/admin/registrations';
import type { RegistrationOrganization } from '@/types/admin';
import { useAdminRegistrations } from './AdminRegistrationsProvider';
import AdminPageHeading from './AdminPageHeading';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationStatusChip from './RegistrationStatusChip';

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
      <Stack
        direction="row"
        spacing={1.25}
        useFlexGap
        sx={{
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            p: 0.75,
            bgcolor: 'action.hover',
            color: 'primary.main',
            borderRadius: 1.5,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Typography component="h2" variant="body1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="dt" variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
        {value || 'Não informado'}
      </Typography>
    </Box>
  );
}

function OrganizationFields({
  organization,
  church = false,
}: {
  organization: RegistrationOrganization;
  church?: boolean;
}) {
  return (
    <Box component="dl" sx={{ m: 0, display: 'grid', gap: 2.5 }}>
      <Field
        label={church ? 'Comunidade de fé' : 'Agência missionária'}
        value={organization.name}
      />
      <Field label="Endereço" value={organization.address} />
      <Field label="Telefone" value={organization.phone} />
      {church && (
        <>
          <Field label="Nome do pastor" value={organization.pastorName} />
          <Field label="Telefone do pastor" value={organization.pastorPhone} />
        </>
      )}
      <Field label="Website" value={organization.website} />
    </Box>
  );
}

export default function RegistrationReview() {
  const { id } = useParams<{ id: string }>();
  const { records, review } = useAdminRegistrations();
  const record = records.find((candidate) => candidate.id === id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef(false);

  if (!record)
    return (
      <>
        <AdminPageHeading detail />
        <EmptyState
          title="Cadastro não encontrado"
          description="Esse cadastro não está disponível. Volte à lista para escolher outro missionário."
          actionLabel="Voltar para a lista"
          actionHref="/admin"
        />
      </>
    );

  const pending = record.status === 'pending';
  return (
    <>
      <AdminPageHeading detail />
      <Stack spacing={2.5} useFlexGap>
        <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            useFlexGap
            sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
          >
            <RegistrationIdentity record={record} large />
            <Box sx={{ flexShrink: 0, textAlign: { xs: 'left', md: 'right' } }}>
              <RegistrationStatusChip status={record.status} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Cadastro em {registrationDate(record.registeredAt)} às{' '}
                {registrationTime(record.registeredAt)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        <DetailSection
          title="Dados pessoais"
          icon={<PersonOutlineIcon aria-hidden fontSize="small" />}
        >
          <Box
            component="dl"
            sx={{
              m: 0,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            <Field label="Nome completo" value={record.name} />
            <Field label="E-mail" value={record.email} />
            <Field
              label="Data de nascimento"
              value={record.birthDate.split('-').reverse().join('/')}
            />
            <Field label="Gênero" value={record.gender} />
            <Field label="CPF ou passaporte" value={record.document} />
            <Field label="Telefone" value={record.phone} />
          </Box>
        </DetailSection>
        <DetailSection
          title="Dados ministeriais"
          icon={<ChurchOutlinedIcon aria-hidden fontSize="small" />}
        >
          <OrganizationFields organization={record.agency} />
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5, mt: 2.5 }}>
            <OrganizationFields organization={record.church} church />
          </Box>
          <Box
            component="dl"
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              pt: 2.5,
              mt: 2.5,
              mb: 0,
              display: 'grid',
              gap: 2.5,
            }}
          >
            <Field label="Local de atuação" value={record.location} />
            <Field label="Descrição do projeto ou atuação" value={record.description} />
          </Box>
        </DetailSection>
        <DetailSection
          title="Dados de acesso"
          icon={<ManageAccountsOutlinedIcon aria-hidden fontSize="small" />}
        >
          <Box component="dl" sx={{ m: 0 }}>
            <Field label="Nome de usuário" value={record.username} />
          </Box>
        </DetailSection>

        {!pending && (
          <Alert
            severity={record.status === 'approved' ? 'success' : 'error'}
            ref={resultRef}
            tabIndex={-1}
            role="status"
          >
            {record.status === 'approved' ? 'Cadastro aprovado' : 'Cadastro reprovado'}
            {'.'}
            {record.rejectionReason && (
              <Typography
                variant="body2"
                sx={{ mt: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
              >
                Motivo: {record.rejectionReason}
              </Typography>
            )}
          </Alert>
        )}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          useFlexGap
          sx={{
            justifyContent: 'space-between',
            alignItems: { md: 'center' },
            pt: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography component="h2" variant="body1" sx={{ fontWeight: 700 }}>
              {pending ? 'Concluir análise' : 'Análise concluída'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pending
                ? 'Revise os dados antes de registrar sua decisão.'
                : 'A decisão foi registrada.'}
            </Typography>
          </Box>
          {pending && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              useFlexGap
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <PillButton
                tone="dangerOutline"
                onClick={() => setRejectOpen(true)}
                sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 44 }}
              >
                Reprovar cadastro
              </PillButton>
              <PillButton
                tone="primaryFilled"
                onClick={() => {
                  review(id, 'approved');

                  requestAnimationFrame(() => resultRef.current?.focus());
                }}
                sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 44 }}
              >
                Aprovar cadastro
              </PillButton>
            </Stack>
          )}
        </Stack>
      </Stack>
      <RejectRegistrationDialog
        open={rejectOpen}
        name={record.name}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => {
          review(id, 'rejected', reason);

          pendingFocus.current = true;
          setRejectOpen(false);
        }}
        onExited={() => {
          if (pendingFocus.current) {
            resultRef.current?.focus();
            pendingFocus.current = false;
          }
        }}
      />
    </>
  );
}
