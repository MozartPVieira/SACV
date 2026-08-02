import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    conviteId: string;
  }>;
};

async function podeGerenciar(
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
    return false;
  }

  const vinculo = pessoa.tutores.find(
    (item) => item.tutor.contaId === contaId,
  );

  return (
    pessoa.contaId === contaId ||
    vinculo?.principal === true
  );
}

export async function PATCH(
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

    const { id: pessoaId, conviteId } = await context.params;

    if (!(await podeGerenciar(pessoaId, session.contaId))) {
      return NextResponse.json(
        { error: "Somente o tutor principal pode renovar convites." },
        { status: 403 },
      );
    }

    const convite = await prisma.conviteTutor.findFirst({
      where: {
        id: conviteId,
        usuarioId: pessoaId,
      },
    });

    if (!convite) {
      return NextResponse.json(
        { error: "Convite não encontrado." },
        { status: 404 },
      );
    }

    if (convite.status === "ACEITO") {
      return NextResponse.json(
        { error: "Um convite aceito não pode ser renovado." },
        { status: 400 },
      );
    }

    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7);

    const atualizado = await prisma.conviteTutor.update({
      where: {
        id: convite.id,
      },
      data: {
        status: "PENDENTE",
        expiraEm,
      },
    });

    return NextResponse.json({
      ok: true,
      convite: {
        id: atualizado.id,
        status: atualizado.status,
        expiraEm: atualizado.expiraEm,
      },
    });
  } catch (error) {
    console.error("Falha ao renovar convite", error);

    return NextResponse.json(
      { error: "Não foi possível renovar o convite." },
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

    const { id: pessoaId, conviteId } = await context.params;

    if (!(await podeGerenciar(pessoaId, session.contaId))) {
      return NextResponse.json(
        { error: "Somente o tutor principal pode cancelar convites." },
        { status: 403 },
      );
    }

    const convite = await prisma.conviteTutor.findFirst({
      where: {
        id: conviteId,
        usuarioId: pessoaId,
      },
    });

    if (!convite) {
      return NextResponse.json(
        { error: "Convite não encontrado." },
        { status: 404 },
      );
    }

    if (convite.status === "ACEITO") {
      return NextResponse.json(
        { error: "Um convite aceito não pode ser cancelado." },
        { status: 400 },
      );
    }

    await prisma.conviteTutor.update({
      where: {
        id: convite.id,
      },
      data: {
        status: "CANCELADO",
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Falha ao cancelar convite", error);

    return NextResponse.json(
      { error: "Não foi possível cancelar o convite." },
      { status: 500 },
    );
  }
}
