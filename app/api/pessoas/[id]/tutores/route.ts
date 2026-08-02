import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 401 },
      );
    }

    const { id: pessoaId } = await context.params;

    const pessoa = await prisma.usuarioSACV.findFirst({
      where: {
        id: pessoaId,
        OR: [
          { contaId: session.contaId },
          {
            tutores: {
              some: {
                tutor: {
                  contaId: session.contaId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        nome: true,
        nomePreferido: true,
        tutores: {
          include: {
            tutor: {
              include: {
                conta: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    ativo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa não encontrada ou acesso não autorizado." },
        { status: 404 },
      );
    }

    const tutores = pessoa.tutores
      .map((vinculo) => ({
        vinculoId: vinculo.id,
        tutorId: vinculo.tutorId,
        contaId: vinculo.tutor.conta.id,
        nome: vinculo.tutor.conta.nome,
        email: vinculo.tutor.conta.email,
        telefone: vinculo.tutor.conta.telefone,
        ativo: vinculo.tutor.conta.ativo,
        principal: vinculo.principal,
        podeEditar: vinculo.podeEditar,
        recebeResumo: vinculo.recebeResumo,
        recebeAlertas: vinculo.recebeAlertas,
      }))
      .sort((a, b) => {
        if (a.principal !== b.principal) {
          return a.principal ? -1 : 1;
        }

        return a.nome.localeCompare(b.nome, "pt-BR");
      });

    await prisma.conviteTutor.updateMany({
      where: {
        usuarioId: pessoaId,
        status: "PENDENTE",
        expiraEm: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRADO",
      },
    });

    const convites = await prisma.conviteTutor.findMany({
      where: {
        usuarioId: pessoaId,
        status: "PENDENTE",
      },
      select: {
        id: true,
        token: true,
        convidadoNome: true,
        convidadoEmail: true,
        relacao: true,
        papel: true,
        podeEditar: true,
        recebeResumo: true,
        recebeAlertas: true,
        status: true,
        expiraEm: true,
        criadoEm: true,
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    return NextResponse.json({
      pessoa: {
        id: pessoa.id,
        nome: pessoa.nome,
        nomePreferido: pessoa.nomePreferido,
      },
      tutores,
      convites,
    });
  } catch (error) {
    console.error("Falha ao consultar tutores do SACV", error);

    return NextResponse.json(
      { error: "Não foi possível consultar os tutores." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 401 },
      );
    }

    const { id: pessoaId } = await context.params;
    const body = await request.json();

    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const relacao = String(body.relacao ?? "").trim() || null;

    const papel =
      body.papel === "FAMILIAR"
        ? "FAMILIAR" as const
        : body.papel === "CUIDADOR"
          ? "CUIDADOR" as const
          : "TUTOR" as const;

    const podeEditar = Boolean(body.podeEditar);
    const recebeResumo = body.recebeResumo !== false;
    const recebeAlertas = body.recebeAlertas !== false;

    if (nome.length < 2) {
      return NextResponse.json(
        { error: "Informe o nome da pessoa convidada." },
        { status: 400 },
      );
    }

    if (!email.includes("@") || email.length < 5) {
      return NextResponse.json(
        { error: "Informe um e-mail válido." },
        { status: 400 },
      );
    }

    if (email === session.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Esta conta já faz parte da equipe." },
        { status: 400 },
      );
    }

    const pessoa = await prisma.usuarioSACV.findUnique({
      where: {
        id: pessoaId,
      },
      include: {
        tutores: {
          include: {
            tutor: {
              include: {
                conta: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa acompanhada não encontrada." },
        { status: 404 },
      );
    }

    const vinculoAtual = pessoa.tutores.find(
      (vinculo) => vinculo.tutor.conta.id === session.contaId,
    );

    const podeGerenciar =
      pessoa.contaId === session.contaId ||
      vinculoAtual?.principal === true ||
      vinculoAtual?.podeEditar === true;

    if (!podeGerenciar) {
      return NextResponse.json(
        { error: "Você não possui permissão para convidar pessoas." },
        { status: 403 },
      );
    }

    const jaVinculado = pessoa.tutores.some(
      (vinculo) =>
        vinculo.tutor.conta.email.toLowerCase() === email,
    );

    if (jaVinculado) {
      return NextResponse.json(
        { error: "Esta pessoa já faz parte da equipe de cuidados." },
        { status: 409 },
      );
    }

    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    const conviteExistente = await prisma.conviteTutor.findFirst({
      where: {
        usuarioId: pessoaId,
        convidadoEmail: email,
        status: "PENDENTE",
      },
    });

    const convite = conviteExistente
      ? await prisma.conviteTutor.update({
          where: {
            id: conviteExistente.id,
          },
          data: {
            convidadoNome: nome,
            relacao,
            papel,
            podeEditar,
            recebeResumo,
            recebeAlertas,
            expiraEm,
          },
        })
      : await prisma.conviteTutor.create({
          data: {
            usuarioId: pessoaId,
            convidadoPorContaId: session.contaId,
            convidadoNome: nome,
            convidadoEmail: email,
            relacao,
            papel,
            podeEditar,
            recebeResumo,
            recebeAlertas,
            expiraEm,
          },
        });

    return NextResponse.json(
      {
        ok: true,
        convite: {
          id: convite.id,
          nome: convite.convidadoNome,
          email: convite.convidadoEmail,
          relacao: convite.relacao,
          papel: convite.papel,
          podeEditar: convite.podeEditar,
          recebeResumo: convite.recebeResumo,
          recebeAlertas: convite.recebeAlertas,
          status: convite.status,
          expiraEm: convite.expiraEm,
        },
      },
      { status: conviteExistente ? 200 : 201 },
    );
  } catch (error) {
    console.error("Falha ao registrar convite de tutor", error);

    return NextResponse.json(
      { error: "Não foi possível registrar o convite." },
      { status: 500 },
    );
  }
}

