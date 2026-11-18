'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import PillButton from '@/components/common/PillButton';
import EmptyState from '@/components/common/EmptyState';
import {
  filterRegistrations,
  registrationCounts,
  registrationDate,
  registrationTime,
  REGISTRATIONS_PAGE_SIZE,
  type RegistrationFilter,
  type RegistrationOrder,
} from '@/lib/admin/registrations';
import { useAdminRegistrations } from './AdminRegistrationsProvider';
import AdminPageHeading from './AdminPageHeading';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationStatusChip from './RegistrationStatusChip';

const filters = [
  ['all', 'Todos'],
  ['pending', 'Pendentes'],
  ['approved', 'Aprovados'],
  ['rejected', 'Reprovados'],
] as const;
const statistics = [
  {
    key: 'all',
    label: 'Total de cadastros',
    description: 'Na plataforma',
    Icon: PeopleOutlineIcon,
    color: 'primary.main',
  },
  {
    key: 'pending',
    label: 'Pendentes',
    description: 'Aguardando análise',
    Icon: AccessTimeIcon,
    color: 'warning.main',
  },
  {
    key: 'approved',
    label: 'Aprovados',
    description: 'Com acesso ao app',
    Icon: PersonAddAltIcon,
    color: 'success.main',
  },
  {
    key: 'rejected',
    label: 'Reprovados',
    description: 'Sem acesso ao app',
    Icon: PersonRemoveOutlinedIcon,
    color: 'error.main',
  },
] as const;

export default function AdminRegistrations() {
  const { records } = useAdminRegistrations();
  const [filter, setFilter] = useState<RegistrationFilter>('pending');
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<RegistrationOrder>('newest');
  const [page, setPage] = useState(1);
  const counts = registrationCounts(records);
  const filtered = filterRegistrations(records, filter, query, order);
  const pages = Math.max(1, Math.ceil(filtered.length / REGISTRATIONS_PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * REGISTRATIONS_PAGE_SIZE;
  const visible = filtered.slice(start, start + REGISTRATIONS_PAGE_SIZE);
  const title =
    filter === 'all'
      ? 'Todos os cadastros'
      : `Cadastros ${filters.find(([key]) => key === filter)?.[1].toLowerCase()}`;

  return (
    <>
      <AdminPageHeading />
      <Box
        component="section"
        aria-label="Resumo dos cadastros"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {statistics.map(({ key, label, description, Icon, color }) => (
          <Paper key={key} elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} useFlexGap>
              <Box
                sx={{
                  color,
                  bgcolor: 'action.hover',
                  p: 1,
                  borderRadius: 2,
                  alignSelf: 'flex-start',
                  display: 'flex',
                }}
              >
                <Icon aria-hidden />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography sx={{ fontSize: '1.75rem', lineHeight: 1.2, fontWeight: 700, my: 0.5 }}>
                  {counts[key]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {description}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>
      <Paper
        component="section"
        aria-labelledby="registrations-title"
        variant="outlined"
        sx={{ borderRadius: 3, overflow: 'hidden', p: { xs: 2, md: 2.5 } }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          useFlexGap
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2.5 }}
        >
          <Typography id="registrations-title" component="h2" variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {counts.pending} {counts.pending === 1 ? 'cadastro aguarda' : 'cadastros aguardam'} sua
            análise
          </Typography>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          sx={{ justifyContent: 'space-between', mb: 1 }}
        >
          <TextField
            label="Buscar por nome ou e-mail"
            size="small"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon aria-hidden fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', sm: 440 },
              maxWidth: '100%',
              '& .MuiInputBase-root': { minHeight: 44 },
            }}
          />
          <TextField
            select
            label="Ordenar cadastros"
            size="small"
            value={order}
            onChange={(event) => {
              setOrder(event.target.value as RegistrationOrder);
              setPage(1);
            }}
            sx={{ width: { xs: '100%', sm: 190 }, '& .MuiInputBase-root': { minHeight: 44 } }}
          >
            <MenuItem value="newest">Mais recentes</MenuItem>
            <MenuItem value="oldest">Mais antigos</MenuItem>
          </TextField>
        </Stack>
        <Tabs
          value={filter}
          onChange={(_, value: RegistrationFilter) => {
            setFilter(value);
            setPage(1);
          }}
          aria-label="Filtrar cadastros por status"
          sx={{
            mb: 1,
            '& .MuiTabs-list': {
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(4, max-content)',
              },
            },
            '& .MuiTabs-indicator': {
              display: { xs: 'none', sm: 'block' },
              bgcolor: 'accent.main',
            },
            '& .Mui-selected': { color: 'accent.main' },
          }}
        >
          {filters.map(([value, label]) => (
            <Tab
              key={value}
              value={value}
              id={`registration-tab-${value}`}
              aria-controls="registration-results"
              label={`${label} ${counts[value]}`}
              sx={{
                minWidth: 0,
                minHeight: 48,
                px: { xs: 1, sm: 2 },
                fontSize: '0.8125rem',
                '&.Mui-selected': {
                  bgcolor: { xs: 'action2.accentWash', sm: 'transparent' },
                  color: 'accent.main',
                },
              }}
            />
          ))}
        </Tabs>
        <Box
          role="tabpanel"
          id="registration-results"
          aria-labelledby={`registration-tab-${filter}`}
        >
          {visible.length === 0 ? (
            <EmptyState
              title="Nenhum cadastro encontrado"
              description="Tente outro nome, e-mail ou status para encontrar o cadastro."
              actionLabel="Limpar filtros"
              onAction={() => {
                setQuery('');
                setFilter('all');
                setPage(1);
              }}
            />
          ) : (
            <>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Table
                  aria-label="Cadastros de missionários"
                  sx={{
                    tableLayout: 'fixed',
                    '& th, & td': {
                      px: 1.5,
                      py: 2,
                      borderColor: 'divider',
                      overflowWrap: 'anywhere',
                    },
                    '& thead th': {
                      bgcolor: 'background.default',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      color: 'text.secondary',
                      py: 1.5,
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell scope="col" sx={{ width: '29%' }}>
                        Missionário
                      </TableCell>
                      <TableCell scope="col" sx={{ width: '24%' }}>
                        Atuação / vínculo
                      </TableCell>
                      <TableCell scope="col" sx={{ width: '13%' }}>
                        Cadastro {order === 'newest' ? '↓' : '↑'}
                      </TableCell>
                      <TableCell scope="col" sx={{ width: '14%' }}>
                        Status
                      </TableCell>
                      <TableCell scope="col" align="right" sx={{ width: '20%' }}>
                        Ações
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visible.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell component="th" scope="row">
                          <RegistrationIdentity record={record} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {record.location}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.agency.name} · {record.church.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            component="time"
                            dateTime={record.registeredAt}
                          >
                            {registrationDate(record.registeredAt)}
                            <Box
                              component="span"
                              sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
                            >
                              {registrationTime(record.registeredAt)}
                            </Box>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <RegistrationStatusChip status={record.status} />
                        </TableCell>
                        <TableCell align="right">
                          <PillButton
                            href={`/admin/missionarios/${record.id}`}
                            tone="primaryOutline"
                            aria-label={`Ver cadastro de ${record.name}`}
                            sx={{
                              border: 0,
                              minWidth: 0,
                              minHeight: 44,
                              px: 1,
                              fontSize: '0.8125rem',
                            }}
                          >
                            Ver cadastro
                          </PillButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <Stack
                component="ul"
                spacing={2}
                useFlexGap
                sx={{ display: { xs: 'flex', md: 'none' }, listStyle: 'none', m: 0, p: 0 }}
              >
                {visible.map((record) => (
                  <Paper
                    component="li"
                    variant="outlined"
                    key={record.id}
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <RegistrationIdentity record={record} />
                    <Box
                      component="dl"
                      sx={{
                        m: 0,
                        mt: 2,
                        '& dt': { color: 'text.secondary', fontSize: '0.75rem', mb: 0.5 },
                        '& dd': { m: 0, mb: 1.5, fontSize: '0.875rem', overflowWrap: 'anywhere' },
                      }}
                    >
                      <dt>Atuação / vínculo</dt>
                      <dd>
                        {record.location}
                        <br />
                        {record.agency.name} · {record.church.name}
                      </dd>
                      <dt>Cadastro</dt>
                      <dd>
                        {registrationDate(record.registeredAt)} às{' '}
                        {registrationTime(record.registeredAt)}
                      </dd>
                      <dt>Status</dt>
                      <dd>
                        <RegistrationStatusChip status={record.status} />
                      </dd>
                    </Box>
                    <PillButton
                      href={`/admin/missionarios/${record.id}`}
                      tone="primaryOutline"
                      aria-label={`Ver cadastro de ${record.name}`}
                      sx={{ width: '100%', minHeight: 44, justifyContent: 'center' }}
                    >
                      Ver cadastro
                    </PillButton>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}
        >
          <Typography variant="caption" color="text.secondary" role="status">
            Exibindo {filtered.length ? start + 1 : 0}–
            {Math.min(start + REGISTRATIONS_PAGE_SIZE, filtered.length)} de {filtered.length}{' '}
            missionários
          </Typography>
          <Pagination
            page={currentPage}
            count={pages}
            onChange={(_, value) => setPage(value)}
            shape="rounded"
            color="primary"
            siblingCount={0}
            boundaryCount={1}
            aria-label="Páginas de cadastros"
            getItemAriaLabel={(type, number, selected) =>
              type === 'page'
                ? `${selected ? 'Página atual,' : 'Ir para a página'} ${number}`
                : type === 'next'
                  ? 'Próxima página'
                  : type === 'previous'
                    ? 'Página anterior'
                    : type === 'first'
                      ? 'Primeira página'
                      : 'Última página'
            }
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiPaginationItem-root': { minWidth: 44, height: 44, mx: 0 },
            }}
          />
          <Stack
            component="nav"
            aria-label="Páginas de cadastros"
            spacing={1}
            useFlexGap
            sx={{ display: { xs: 'flex', sm: 'none' }, width: '100%' }}
          >
            <Typography variant="caption" sx={{ textAlign: 'center' }}>
              Página {currentPage} de {pages}
            </Typography>
            <PillButton
              tone="primaryOutline"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              sx={{ width: '100%', minHeight: 44 }}
            >
              Página anterior
            </PillButton>
            <PillButton
              tone="primaryOutline"
              disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}
              sx={{ width: '100%', minHeight: 44 }}
            >
              Próxima página
            </PillButton>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}
