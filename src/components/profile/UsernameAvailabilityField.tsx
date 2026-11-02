'use client';

import { useEffect, type Ref } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  usernameAvailabilityHelper,
  useUsernameAvailability,
  type UsernameAvailabilityStatus,
} from '@/hooks/useUsernameAvailability';
import { colors } from '@/theme/theme';

type UsernameAvailabilityFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  currentUsername: string;
  errorMessage?: string;
  onStatusChange?: (status: UsernameAvailabilityStatus) => void;
  onTaken?: () => void;
  onAvailable?: () => void;
  /** Lets react-hook-form focus the input on validation errors. */
  inputRef?: Ref<HTMLInputElement>;
};

export default function UsernameAvailabilityField({
  id = 'username',
  value,
  onChange,
  currentUsername,
  errorMessage,
  onStatusChange,
  onTaken,
  onAvailable,
  inputRef,
}: UsernameAvailabilityFieldProps) {
  const { status, suggestions } = useUsernameAvailability({
    username: value,
    currentUsername,
    onTaken,
    onAvailable,
  });

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const helperText = usernameAvailabilityHelper(status, errorMessage);
  const showError = Boolean(errorMessage) || status === 'taken';

  return (
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
      <Typography
        component="label"
        htmlFor={id}
        variant="body2"
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        Nome de usuário:
      </Typography>
      <TextField
        id={id}
        inputRef={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value.toLowerCase().replace(/\s/g, ''))}
        size="small"
        fullWidth
        autoComplete="username"
        spellCheck={false}
        error={showError}
        helperText={helperText}
        slotProps={{
          formHelperText: {
            id: `${id}-helper-text`,
            role: helperText ? 'status' : undefined,
          },
          htmlInput: {
            autoCapitalize: 'none',
            'aria-invalid': showError || undefined,
            'aria-describedby': helperText ? `${id}-helper-text` : undefined,
          },
          input: {
            endAdornment:
              status === 'idle' ? undefined : (
                <InputAdornment position="end">
                  {status === 'checking' ? (
                    <CircularProgress
                      color="inherit"
                      size={18}
                      aria-label="Verificando disponibilidade do nome de usuário"
                    />
                  ) : status === 'available' ? (
                    <CheckIcon aria-hidden sx={{ fontSize: 20, color: colors.success }} />
                  ) : (
                    <CloseIcon aria-hidden sx={{ fontSize: 20, color: colors.error }} />
                  )}
                </InputAdornment>
              ),
          },
        }}
      />
      {suggestions.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Sugestões disponíveis — toque para usar:
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                clickable
                color="primary"
                variant="outlined"
                aria-label={`Usar nome de usuário ${suggestion}`}
                onClick={() => onChange(suggestion)}
              />
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
