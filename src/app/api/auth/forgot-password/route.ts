import { NextResponse } from "next/server";
import { z } from "zod";
import { BackendApiError, backendFetch } from "@/lib/api/backend";

const forgotPasswordSchema = z.object({
  login: z.email(),
});

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Informe um e-mail válido", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const result = await backendFetch<{ message?: string }>("/auth/forgot-password", {
      method: "POST",
      body: parsed.data,
    });

    return NextResponse.json(
      result ?? {
        message:
          "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.",
      },
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

    // Sem back: resposta genérica (mesma UX de produção).
    return NextResponse.json({
      message:
        "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.",
    });
  }
}
