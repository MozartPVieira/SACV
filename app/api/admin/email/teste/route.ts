import { NextResponse } from "next/server";
import { getSession, hasRole } from "@/lib/auth";
import { PapelConta } from "@/lib/generated/prisma/client";
import { enviarEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 401 },
      );
    }

    if (!hasRole(session, PapelConta.ADMIN)) {
      return NextResponse.json(
        { error: "Acesso permitido somente para administradores." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const destinatario = String(
      body.destinatario ?? session.email,
    )
      .trim()
      .toLowerCase();

    if (!destinatario.includes("@")) {
      return NextResponse.json(
        { error: "Informe um destinatário válido." },
        { status: 400 },
      );
    }

    const resultado = await enviarEmail({
      destinatario,
      assunto: "Teste de envio do SACV",
      tipo: "TESTE_CONFIGURACAO",
      texto:
        "A configuração de e-mail do SACV está funcionando corretamente.",
      html: `
        <div style="font-family:Arial,sans-serif;color:#21182d">
          <h1 style="color:#6d46c7">SACV</h1>
          <h2>Configuração de e-mail validada</h2>
          <p>A conexão com o servidor SMTP está funcionando corretamente.</p>
          <p>Este é um envio de teste realizado pelo Painel Administrativo.</p>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      message: `E-mail de teste enviado para ${destinatario}.`,
      envioId: resultado.envioId,
    });
  } catch (error) {
    console.error("Falha no teste de e-mail do SACV", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o e-mail de teste.",
      },
      { status: 500 },
    );
  }
}
