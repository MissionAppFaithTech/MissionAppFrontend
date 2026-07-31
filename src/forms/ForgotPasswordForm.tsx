"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { isValidEmail, normalizeEmail } from "@/lib/masks";
import {
  requestPasswordReset,
  RESET_PASSWORD_TOKEN_TTL_MINUTES,
} from "@/services/auth.service";

type ForgotPasswordValues = {
  login: string;
};

type SubmitState =
  | { status: "idle" }
  | { status: "success"; email: string; resetPath?: string }
  | { status: "not_found"; email: string };

export default function ForgotPasswordForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordValues>({
    mode: "onChange",
    defaultValues: { login: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setFormError(null);

    try {
      const result = await requestPasswordReset({ login: values.login });

      setSubmitState(
        result.found
          ? {
              status: "success",
              email: values.login,
              resetPath: result.resetPath,
            }
          : { status: "not_found", email: values.login },
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o link de redefinição",
      );
    }
  };

  if (submitState.status === "success") {
    return (
      <Stack spacing={2.5} sx={{ width: "100%" }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Conta encontrada
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Enviamos um link para redefinir a senha de{" "}
          <strong>{submitState.email}</strong>. O link expira em{" "}
          {RESET_PASSWORD_TOKEN_TTL_MINUTES} minutos.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Não encontrou o e-mail? Confira a caixa de spam ou lixo eletrônico.
        </Typography>

        {submitState.resetPath ? (
          <Button
            component={Link}
            href={submitState.resetPath}
            variant="contained"
            color="primary"
            fullWidth
          >
            Abrir link de redefinição (mock)
          </Button>
        ) : null}

        <Button
          component={Link}
          href="/login"
          variant={submitState.resetPath ? "outlined" : "contained"}
          color="primary"
          fullWidth
        >
          Voltar para o login
        </Button>
      </Stack>
    );
  }

  if (submitState.status === "not_found") {
    return (
      <Stack spacing={2.5} sx={{ width: "100%" }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Conta não encontrada
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Não encontramos uma conta com o e-mail <strong>{submitState.email}</strong>.
          Confira se digitou corretamente ou cadastre-se.
        </Typography>

        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={() => setSubmitState({ status: "idle" })}
        >
          Tentar outro e-mail
        </Button>

        <Button component={Link} href="/login" variant="contained" color="primary" fullWidth>
          Voltar para o login
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
      noValidate
    >
      <Typography variant="body2" color="text.secondary">
        Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova
        senha.
      </Typography>

      {formError ? <Alert severity="error">{formError}</Alert> : null}

      <Controller
        name="login"
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
            autoComplete="email"
            error={Boolean(errors.login)}
            helperText={errors.login?.message}
            onChange={(event) => field.onChange(normalizeEmail(event.target.value))}
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "Verificando…" : "Enviar link"}
      </Button>

      <Button component={Link} href="/login" variant="text" fullWidth>
        Voltar para o login
      </Button>
    </Stack>
  );
}
