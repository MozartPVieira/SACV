import { NextResponse } from "next/server";
import { getSession, hasRole } from "@/lib/auth";
import {
  PapelConta,
  ProvedorEmail,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function verificarAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 401 },
      ),
    };
  }

  if (!hasRole(session, PapelConta.ADMIN)) {
    return {
      session,
      response: NextResponse.json(
        { error: "Acesso restrito à administração." },
        { status: 403 },
      ),
    };
  }

  return {
    session,
    response: null,
  };
}

export async function GET() {
  try {
    const acesso = await verificarAdmin();

    if (acesso.response) {
      return acesso.response;
    }

    const configuracoes = await prisma.configuracaoEmail.findMany({
      select: {
        id: true,
        nome: true,
        nomeRemetente: true,
        emailRemetente: true,
        emailResposta: true,
        provedor: true,
        hostSmtp: true,
        portaSmtp: true,
        usarTls: true,
        usuarioSmtp: true,
        segredoReferencia: true,
        principal: true,
        ativo: true,
        atualizadoEm: true,
        _count: {
          select: {
            envios: true,
          },
        },
      },
      orderBy: [
        {
          principal: "desc",
        },
        {
          nome: "asc",
        },
      ],
    });

    return NextResponse.json({
      configuracoes,
    });
  } catch (error) {
    console.error("Falha ao consultar configurações de e-mail", error);

    return NextResponse.json(
      { error: "Não foi possível consultar os remetentes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const acesso = await verificarAdmin();

    if (acesso.response) {
      return acesso.response;
    }

    const body = await request.json();

    const nome = String(body.nome ?? "").trim();
    const nomeRemetente = String(body.nomeRemetente ?? "").trim();
    const emailRemetente = String(body.emailRemetente ?? "")
      .trim()
      .toLowerCase();
    const emailResposta =
      String(body.emailResposta ?? "").trim().toLowerCase() || null;
    const hostSmtp = String(body.hostSmtp ?? "").trim() || null;
    const usuarioSmtp = String(body.usuarioSmtp ?? "").trim() || null;
    const segredoReferencia = String(
      body.segredoReferencia ?? "",
    ).trim();

    const portaSmtpNumero = Number(body.portaSmtp);

    const provedor =
      body.provedor === "RESEND"
        ? ProvedorEmail.RESEND
        : body.provedor === "SENDGRID"
          ? ProvedorEmail.SENDGRID
          : body.provedor === "AMAZON_SES"
            ? ProvedorEmail.AMAZON_SES
            : body.provedor === "OUTRO"
              ? ProvedorEmail.OUTRO
              : ProvedorEmail.SMTP;

    const usarTls = body.usarTls !== false;
    const principal = body.principal !== false;
    const ativo = body.ativo !== false;

    if (
      nome.length < 2 ||
      nomeRemetente.length < 2 ||
      !emailRemetente.includes("@") ||
      segredoReferencia.length < 3
    ) {
      return NextResponse.json(
        {
          error:
            "Informe nome, remetente, e-mail e referência do segredo.",
        },
        { status: 400 },
      );
    }

    if (
      provedor === ProvedorEmail.SMTP &&
      (!hostSmtp ||
        !Number.isInteger(portaSmtpNumero) ||
        portaSmtpNumero < 1 ||
        portaSmtpNumero > 65535)
    ) {
      return NextResponse.json(
        {
          error:
            "Para SMTP, informe servidor e porta válidos.",
        },
        { status: 400 },
      );
    }

    const configuracao = await prisma.$transaction(async (tx) => {
      if (principal) {
        await tx.configuracaoEmail.updateMany({
          where: {
            principal: true,
          },
          data: {
            principal: false,
          },
        });
      }

      const existente = await tx.configuracaoEmail.findFirst({
        where: {
          emailRemetente,
        },
      });

      const dados = {
        nome,
        nomeRemetente,
        emailResposta,
        provedor,
        hostSmtp,
        portaSmtp:
          provedor === ProvedorEmail.SMTP
            ? portaSmtpNumero
            : null,
        usarTls,
        usuarioSmtp,
        segredoReferencia,
        principal,
        ativo,
      };

      return existente
        ? tx.configuracaoEmail.update({
            where: {
              id: existente.id,
            },
            data: dados,
          })
        : tx.configuracaoEmail.create({
            data: {
              ...dados,
              emailRemetente,
            },
          });
    });

    return NextResponse.json(
      {
        ok: true,
        configuracao,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Falha ao salvar configuração de e-mail", error);

    return NextResponse.json(
      { error: "Não foi possível salvar o remetente." },
      { status: 500 },
    );
  }
}
