import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getSession,
  setSessionCookie,
} from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { token } = await context.params;

    const convite = await prisma.conviteTutor.findUnique({
      where: { token },
      select: {
        id: true,
        convidadoNome: true,
        convidadoEmail: true,
        relacao: true,
        papel: true,
        status: true,
        expiraEm: true,
        usuario: {
          select: {
            nome: true,
            nomePreferido: true,
          },
        },
      },
    });

    if (!convite) {
      return NextResponse.json(
        { error: "Convite não encontrado." },
        { status: 404 },
      );
    }

    if (
      convite.status === "PENDENTE" &&
      convite.expiraEm.getTime() < Date.now()
    ) {
      await prisma.conviteTutor.update({
        where: { id: convite.id },
        data: { status: "EXPIRADO" },
      });

      return NextResponse.json(
        { error: "Este convite expirou." },
        { status: 410 },
      );
    }

    const contaExistente = await prisma.conta.findUnique({
      where: {
        email: convite.convidadoEmail,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      convite: {
        nome: convite.convidadoNome,
        email: convite.convidadoEmail,
        relacao: convite.relacao,
        papel: convite.papel,
        status: convite.status,
        expiraEm: convite.expiraEm,
        pessoaAcompanhada:
          convite.usuario.nomePreferido ?? convite.usuario.nome,
        possuiConta: Boolean(contaExistente),
      },
    });
  } catch (error) {
    console.error("Falha ao consultar convite SACV", error);

    return NextResponse.json(
      { error: "Não foi possível consultar o convite." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const { token } = await context.params;
    const session = await getSession();
    const body = await request.json();

    const nome = String(body.nome ?? "").trim();
    const telefone = String(body.telefone ?? "").trim() || null;
    const senha = String(body.senha ?? "");

    const convite = await prisma.conviteTutor.findUnique({
      where: { token },
    });

    if (!convite) {
      return NextResponse.json(
        { error: "Convite não encontrado." },
        { status: 404 },
      );
    }

    if (convite.status !== "PENDENTE") {
      return NextResponse.json(
        { error: "Este convite não está mais disponível." },
        { status: 409 },
      );
    }

    if (convite.expiraEm.getTime() < Date.now()) {
      await prisma.conviteTutor.update({
        where: { id: convite.id },
        data: { status: "EXPIRADO" },
      });

      return NextResponse.json(
        { error: "Este convite expirou." },
        { status: 410 },
      );
    }

    const contaExistente = await prisma.conta.findUnique({
      where: {
        email: convite.convidadoEmail,
      },
      include: {
        papeis: true,
      },
    });

    if (
      session &&
      session.email.toLowerCase() !==
        convite.convidadoEmail.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "Entre com a conta correspondente ao e-mail convidado.",
        },
        { status: 403 },
      );
    }

    if (contaExistente && !session) {
      return NextResponse.json(
        {
          error:
            "Este e-mail já possui conta. Entre no SACV para aceitar.",
          loginRequired: true,
        },
        { status: 409 },
      );
    }

    if (!contaExistente) {
      if (nome.length < 2 || senha.length < 8) {
        return NextResponse.json(
          {
            error:
              "Informe nome e senha com pelo menos 8 caracteres.",
          },
          { status: 400 },
        );
      }
    }

    const senhaHash = contaExistente
      ? null
      : await bcrypt.hash(senha, 12);

    const contaFinal = await prisma.$transaction(async (tx) => {
      const conta = contaExistente
        ? contaExistente
        : await tx.conta.create({
            data: {
              nome,
              email: convite.convidadoEmail,
              telefone,
              senhaHash: senhaHash!,
              papeis: {
                create: [
                  {
                    papel: convite.papel,
                  },
                ],
              },
            },
            include: {
              papeis: true,
            },
          });

      await tx.contaPapel.upsert({
        where: {
          contaId_papel: {
            contaId: conta.id,
            papel: convite.papel,
          },
        },
        update: {},
        create: {
          contaId: conta.id,
          papel: convite.papel,
        },
      });

      const tutor = await tx.tutor.upsert({
        where: {
          contaId: conta.id,
        },
        update: {},
        create: {
          contaId: conta.id,
        },
      });

      await tx.vinculoTutorUsuario.upsert({
        where: {
          tutorId_usuarioId: {
            tutorId: tutor.id,
            usuarioId: convite.usuarioId,
          },
        },
        update: {
          podeEditar: convite.podeEditar,
          recebeResumo: convite.recebeResumo,
          recebeAlertas: convite.recebeAlertas,
        },
        create: {
          tutorId: tutor.id,
          usuarioId: convite.usuarioId,
          principal: false,
          podeEditar: convite.podeEditar,
          recebeResumo: convite.recebeResumo,
          recebeAlertas: convite.recebeAlertas,
        },
      });

      await tx.conviteTutor.update({
        where: {
          id: convite.id,
        },
        data: {
          status: "ACEITO",
          aceitoEm: new Date(),
        },
      });

      return tx.conta.findUniqueOrThrow({
        where: {
          id: conta.id,
        },
        include: {
          papeis: true,
        },
      });
    });

    const sessionToken = await createSessionToken({
      contaId: contaFinal.id,
      nome: contaFinal.nome,
      email: contaFinal.email,
      papeis: contaFinal.papeis.map((item) => item.papel),
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      ok: true,
      redirectTo: "/painel",
    });
  } catch (error) {
    console.error("Falha ao aceitar convite SACV", error);

    return NextResponse.json(
      { error: "Não foi possível aceitar o convite." },
      { status: 500 },
    );
  }
}
