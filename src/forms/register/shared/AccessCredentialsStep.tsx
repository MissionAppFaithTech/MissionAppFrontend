"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  TextField,
  Typography,
  Stack,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import PasswordStrengthIndicator from "@/components/common/PasswordStrengthIndicator";
import { isValidEmail, normalizeEmail } from "@/lib/masks";
import { validateStrongPassword } from "@/lib/passwordStrength";
import type { AccessCredentialsValues } from "@/forms/register/types";
import { checkUsernameAvailability } from "@/services/username.service";

type AccessCredentialsStepProps = {
  defaultValues?: Partial<AccessCredentialsValues>;
  onSubmit: (values: AccessCredentialsValues) => void;
  onBack: () => void;
  submitLabel?: string;
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

function isUsernameFormatValid(value: string) {
  return value.length >= 3 && value.length <= 32 && /^[a-z0-9_]+$/.test(value);
}

export default function AccessCredentialsStep({
  defaultValues,
  onSubmit,
  onBack,
  submitLabel = "Continuar",
}: AccessCredentialsStepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<AccessCredentialsValues>({
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      ...defaultValues,
    },
  });

  const [username, email, password, confirmPassword] = watch([
    "username",
    "email",
    "password",
    "confirmPassword",
  ]);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const normalized = username.trim().toLowerCase();

    if (!isUsernameFormatValid(normalized)) {
      setUsernameStatus("idle");
      setSuggestions([]);
      return;
    }

    const requestId = ++requestIdRef.current;
    setUsernameStatus("checking");

    const timer = window.setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(normalized);
        if (requestId !== requestIdRef.current) return;

        if (result.available) {
          setUsernameStatus("available");
          setSuggestions([]);
          clearErrors("username");
          return;
        }

        setUsernameStatus("taken");
        setSuggestions(result.suggestions ?? []);
        setError("username", {
          type: "validate",
          message: "Este nome de usuário já está em uso",
        });
      } catch {
        if (requestId !== requestIdRef.current) return;
        setUsernameStatus("error");
        setSuggestions([]);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [username, clearErrors, setError]);

  const canSubmit = useMemo(() => {
    const passwordOk = validateStrongPassword(password) === true;
    const emailOk = isValidEmail(email);
    const confirmOk = confirmPassword.length > 0 && confirmPassword === password;
    const usernameOk = isUsernameFormatValid(username.trim().toLowerCase());

    // Disponibilidade de username no back ainda não é obrigatória:
    // libera o botão com a validação local dos campos.
    return isValid && usernameOk && emailOk && passwordOk && confirmOk;
  }, [confirmPassword, email, isValid, password, username]);

  const applySuggestion = (suggestion: string) => {
    setValue("username", suggestion, { shouldDirty: true, shouldValidate: true });
  };

  const usernameHelperText = (() => {
    if (errors.username?.message) return errors.username.message;
    if (usernameStatus === "checking") return "Verificando disponibilidade…";
    if (usernameStatus === "available") return "Nome de usuário disponível";
    if (usernameStatus === "taken") return "Este nome de usuário já está em uso";
    if (usernameStatus === "error") {
      return "Verificação online indisponível no momento (ok enquanto o back não estiver ligado).";
    }
    return "Use letras minúsculas, números e _";
  })();

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
      noValidate
    >
      <Typography variant="body1">Dados de acesso</Typography>

      <Controller
        name="username"
        control={control}
        rules={{
          required: "Informe seu nome de usuário",
          minLength: { value: 3, message: "Use pelo menos 3 caracteres" },
          maxLength: { value: 32, message: "Use no máximo 32 caracteres" },
          pattern: {
            value: /^[a-z0-9_]+$/,
            message: "Use apenas letras minúsculas, números e _",
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nome de usuário"
            fullWidth
            placeholder="exemplo_usuario"
            error={Boolean(errors.username) || usernameStatus === "taken"}
            helperText={usernameHelperText}
            slotProps={{
              input: {
                endAdornment:
                  usernameStatus === "checking" ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : undefined,
              },
            }}
            onChange={(event) =>
              field.onChange(event.target.value.toLowerCase().replace(/\s/g, ""))
            }
          />
        )}
      />

      {suggestions.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Sugestões disponíveis — toque para usar:
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                clickable
                color="primary"
                variant="outlined"
                onClick={() => applySuggestion(suggestion)}
              />
            ))}
          </Stack>
        </Stack>
      ) : null}

      <Controller
        name="email"
        control={control}
        rules={{
          required: "Informe seu e-mail",
          validate: (value) => isValidEmail(value) || "E-mail inválido",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="E-mail"
            type="email"
            fullWidth
            placeholder="seu@email.com"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            onChange={(event) => field.onChange(normalizeEmail(event.target.value))}
          />
        )}
      />

      <TextField
        {...register("password", {
          validate: (value) => validateStrongPassword(value),
        })}
        label="Senha"
        type="password"
        fullWidth
        placeholder="Ex: Senha@123"
        error={Boolean(errors.password)}
        helperText={
          errors.password?.message ??
          "Use maiúscula, minúscula, número e caractere especial (mín. 8)"
        }
      />
      <PasswordStrengthIndicator password={password} />

      <TextField
        {...register("confirmPassword", {
          required: "Confirme sua senha",
          validate: (value) => value === password || "As senhas não coincidem",
        })}
        label="Confirmar senha"
        type="password"
        fullWidth
        placeholder="Repita a senha"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
      />

      <Stack direction="row" spacing={2}>
        <Button type="button" variant="outlined" onClick={onBack} fullWidth>
          Voltar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!canSubmit}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
