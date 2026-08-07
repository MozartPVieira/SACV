import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function localizarPessoa(
  pessoaId: string,
  contaId: string,
) {
  return prisma.usuarioSACV.findFirst({
    where: {
      id: pessoaId,
      OR: [
        { contaId },
        {
          tutores: {
            some: {
              tutor: { contaId },
              ativo: true,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      nome: true,
      nomePreferido: true,
    },
  });
}

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

    const { id } = await context.params;

    const pessoa = await localizarPessoa(id, session.contaId);

    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa não encontrada." },
        { status: 404 },
      );
    }

    const perfilSaude = await prisma.perfilSaude.findUnique({
      where: {
        usuarioId: id,
      },
    });

    return NextResponse.json({
      pessoa,
      perfilSaude,
    });
  } catch (error) {
    console.error("Falha ao consultar perfil de saúde", error);

    return NextResponse.json(
      { error: "Não foi possível consultar o perfil de saúde." },
      { status: 500 },
    );
  }
}

export async function PUT(
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

    const { id } = await context.params;

    const pessoa = await localizarPessoa(id, session.contaId);

    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa não encontrada." },
        { status: 404 },
      );
    }

    const body = await request.json();

    function texto(valor: unknown) {
      return String(valor ?? "").trim() || null;
    }

    const dados = {
      convenio: texto(body.convenio),
      planoSaude: texto(body.planoSaude),
      numeroCarteirinha: texto(body.numeroCarteirinha),
      alergias: texto(body.alergias),
      condicoesClinicas: texto(body.condicoesClinicas),
      protesesImplantes: texto(body.protesesImplantes),
      limitacoesFisicas: texto(body.limitacoesFisicas),
      observacoesCognitivas: texto(body.observacoesCognitivas),
      orientacoesMedicas: texto(body.orientacoesMedicas),
      medicoReferencia: texto(body.medicoReferencia),
      telefoneMedico: texto(body.telefoneMedico),
      contatoEmergencia: texto(body.contatoEmergencia),
      telefoneEmergencia: texto(body.telefoneEmergencia),
      observacoesGerais: texto(body.observacoesGerais),
    };

    const perfilSaude = await prisma.perfilSaude.upsert({
      where: {
        usuarioId: id,
      },
      create: {
        usuarioId: id,
        ...dados,
      },
      update: dados,
    });

    return NextResponse.json({
      ok: true,
      perfilSaude,
    });
  } catch (error) {
    console.error("Falha ao salvar perfil de saúde", error);

    return NextResponse.json(
      { error: "Não foi possível salvar o perfil de saúde." },
      { status: 500 },
    );
  }
}