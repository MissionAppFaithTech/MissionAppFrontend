"use client";

import { Stack, Typography, Button } from "@mui/material";
import Link from "next/link";
import { useMissionaryRegisterWizard } from "@/components/register/missionaries/MissionaryRegisterWizardContext";

export default function MissionariesStep4() {
  const { goBack } = useMissionaryRegisterWizard();

  return (
    <Stack spacing={2.5} sx={{ width: "100%" }}>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        Sua inscrição foi enviada com sucesso!
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Nossa equipe analisará cuidadosamente as informações e documentos fornecidos.
        Após a conclusão da avaliação, você receberá uma notificação por e-mail com o
        resultado do seu cadastro.
      </Typography>

      <Typography variant="body2" color="text.secondary" component="div">
        O retorno poderá indicar uma das seguintes situações:
        <Stack component="ul" spacing={0.5} sx={{ mt: 1, pl: 2, mb: 0 }}>
          <li>Aprovação da inscrição, com instruções e link de acesso à plataforma</li>
          <li>Solicitação de informações ou documentos complementares</li>
          <li>Não aprovação da inscrição, com as orientações cabíveis</li>
        </Stack>
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Fique atento ao e-mail informado durante o cadastro, pois todas as comunicações
        serão realizadas por esse canal.
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button type="button" variant="outlined" onClick={goBack} fullWidth>
          Voltar
        </Button>
        <Button component={Link} href="/" variant="contained" color="primary" fullWidth>
          Ir para início
        </Button>
      </Stack>
    </Stack>
  );
}
