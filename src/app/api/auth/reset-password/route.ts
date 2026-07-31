import { NextResponse } from "next/server";
import { z } from "zod";
import { BackendApiError, backendFetch } from "@/lib/api/backend";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Dados inválidos para redefinição de senha",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  try {
    const result = await backendFetch<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: parsed.data,
    });

    return NextResponse.json(
      result ?? { message: "Senha redefinida com sucesso." },
    );
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        typeof error.body === "object" && error.body !== null
          ? error.body
          : { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Não foi possível redefinir a senha" },
      { status: 503 },
    );
  }
}
