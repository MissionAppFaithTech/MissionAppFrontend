"use client";

import type { FormEvent } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/profile");
  };

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit}
      sx={{ width: "100%" }}
    >
      <TextField label="E-mail" type="email" fullWidth />
      <TextField label="Senha" type="password" fullWidth />
      <Link href="/forgot-password">Esqueceu sua senha?</Link>
      <Button type="submit" variant="contained" color="primary">
        Entrar
      </Button>
    </Stack>
  );
}
