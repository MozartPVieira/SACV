import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    vinculoId: string;
  }>;
};

async function verificarGerenciamento(
  pessoaId: string,
  contaId: string,
) {
  const pessoa = await prisma.usuarioSACV.findUnique({
    where: {
      id: pessoaId,
    },
    select: {
      contaId: true,
      tutores: {
        select: {
          principal: true,
          tutor: {
            select: {
              contaId: true,
            },
          },
        },
      },
    },
  });

  if (!pessoa) {
    return {
      pessoaExiste: false,
      autorizado: false,
    };
  }

  const vinculoAtual = pessoa.tutores.find(
    (vinculo) => vinculo.tutor.contaId === contaId,
  );

  return {
    pessoaExiste: true,
    autorizado:
      pessoa.contaId === contaId ||
      vinculoAtual?.principal === true,
  };
}

export async function PATCH(
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

    const { id: pessoaId, vinculoId } = await context.params;
    const acesso = await verificarGerenciamento(
      pessoaId,
      session.contaId,
    );

    if (!acesso.pessoaExiste) {
      return NextResponse.json(
        { error: "Pessoa acompanhada não encontrada." },
        { status: 404 },
      );
    }

    if (!acesso.autorizado) {
      return NextResponse.json(
        { error: "Somente o tutor principal pode alterar a equipe." },
        { status: 403 },
      );
    }

    const vinculo = await prisma.vinculoTutorUsuario.findFirst({
      where: {
        id: vinculoId,
        usuarioId: pessoaId,
      },
    });

    if (!vinculo) {
      return NextResponse.json(
        { error: "Vínculo não encontrado." },
        { status: 404 },
      );
    }

    const body = await request.json();

    if (vinculo.principal && body.ativo === false) {
      return NextResponse.json(
        { error: "O tutor principal não pode ser suspenso." },
        { status: 400 },
      );
    }

    const atualizado = await prisma.vinculoTutorUsuario.update({
      where: {
        id: vinculo.id,
      },
      data: {
        ativo:
          vinculo.principal
            ? true
            : body.ativo !== false,
        podeEditar: Boolean(body.podeEditar),
        recebeResumo: body.recebeResumo !== false,
        recebeAlertas: body.recebeAlertas !== false,
      },
    });

    return NextResponse.json({
      ok: true,
      vinculo: atualizado,
    });
  } catch (error) {
    console.error("Falha ao atualizar integrante da equipe", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar o integrante." },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const { id: pessoaId, vinculoId } = await context.params;
    const acesso = await verificarGerenciamento(
      pessoaId,
      session.contaId,
    );

    if (!acesso.pessoaExiste) {
      return NextResponse.json(
        { error: "Pessoa acompanhada não encontrada." },
        { status: 404 },
      );
    }

    if (!acesso.autorizado) {
      return NextResponse.json(
        { error: "Somente o tutor principal pode alterar a equipe." },
        { status: 403 },
      );
    }

    const vinculo = await prisma.vinculoTutorUsuario.findFirst({
      where: {
        id: vinculoId,
        usuarioId: pessoaId,
      },
    });

    if (!vinculo) {
      return NextResponse.json(
        { error: "Vínculo não encontrado." },
        { status: 404 },
      );
    }

    if (vinculo.principal) {
      return NextResponse.json(
        { error: "O tutor principal não pode ser removido." },
        { status: 400 },
      );
    }

    await prisma.vinculoTutorUsuario.delete({
      where: {
        id: vinculo.id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Falha ao remover integrante da equipe", error);

    return NextResponse.json(
      { error: "Não foi possível remover o integrante." },
      { status: 500 },
    );
  }
}
