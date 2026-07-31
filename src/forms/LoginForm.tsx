"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Link from "next/link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/profile");
  };

  const togglePasswordVisibility = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const input = passwordInputRef.current;
    const start = input?.selectionStart ?? 0;
    const end = input?.selectionEnd ?? 0;

    setShowPassword((prev) => !prev);

    // Mantém o type="text" (máscara via CSS) — só restaura o caret.
    requestAnimationFrame(() => {
      const next = passwordInputRef.current;
      if (!next) return;
      next.focus({ preventScroll: true });
      next.setSelectionRange(start, end);
    });
  };

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit}
      sx={{ width: "100%" }}
    >
      <TextField label="E-mail" type="email" fullWidth placeholder="seu@email.com" />
      <TextField
        label="Senha"
        // type fixo: trocar password↔text move o cursor para o início
        type="text"
        autoComplete="current-password"
        fullWidth
        placeholder="Sua senha"
        slotProps={{
          htmlInput: {
            ref: passwordInputRef,
            spellCheck: false,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={togglePasswordVisibility}
                  onMouseDown={(event) => event.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& input": {
            ...(!showPassword
              ? {
                  WebkitTextSecurity: "disc",
                }
              : null),
          },
        }}
      />
      <Link href="/forgot-password">Esqueceu sua senha?</Link>
      <Button type="submit" variant="contained" color="primary">
        Entrar
      </Button>
    </Stack>
  );
}
