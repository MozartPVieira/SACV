import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ModoUso,
  NivelAcompanhamento,
} from "@/lib/generated/prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function pessoaPertenceAConta(
  pessoaId: string,
  contaId: string,
) {
  return prisma.usuarioSACV.findFirst({
    where: {
      id: pessoaId,
      OR: [
        {
          contaId,
        },
        {
          tutores: {
            some: {
              tutor: {
                contaId,
              },
            },
          },
        },
      ],
    },
    include: {
      perfil: true,
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
                },
              },
            },
          },
        },
      },
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

    const pessoa = await pessoaPertenceAConta(
      id,
      session.contaId,
    );

    if (!pessoa) {
      return NextResponse.json(
        { error: "Pessoa não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json(pessoa);
  } catch (error) {
    console.error(
      "Falha ao consultar pessoa do SACV",
      error,
    );

    return NextResponse.json(
      { error: "Não foi possível consultar a pessoa." },
      { status: 500 },
    );
  }
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

    const { id } = await context.params;

    const existente = await pessoaPertenceAConta(
      id,
      session.contaId,
    );

    if (!existente) {
      return NextResponse.json(
        { error: "Pessoa não encontrada." },
        { status: 404 },
      );
    }

    const body = await request.json();

    const nome = String(body.nome ?? "").trim();
    const nomePreferido =
      String(body.nomePreferido ?? "").trim() || null;
    const telefone =
      String(body.telefone ?? "").trim() || null;
    const dataNascimentoTexto =
      String(body.dataNascimento ?? "").trim();

    const tratamentoPreferido =
      String(body.tratamentoPreferido ?? "").trim() || null;
    const estiloCida =
      String(body.estiloCida ?? "").trim() || null;
    const horarioAcordar =
      String(body.horarioAcordar ?? "").trim() || null;
    const horarioDormir =
      String(body.horarioDormir ?? "").trim() || null;
    const observacoesRotina =
      String(body.observacoesRotina ?? "").trim() || null;
    const preferencias =
      String(body.preferencias ?? "").trim() || null;
    const limitacoes =
      String(body.limitacoes ?? "").trim() || null;

    if (nome.length < 2) {
      return NextResponse.json(
        { error: "Informe o nome completo." },
        { status: 400 },
      );
    }

    let dataNascimento: Date | null = null;

    if (dataNascimentoTexto) {
      dataNascimento = new Date(
        `${dataNascimentoTexto}T12:00:00.000Z`,
      );

      if (Number.isNaN(dataNascimento.getTime())) {
        return NextResponse.json(
          { error: "Data de nascimento inválida." },
          { status: 400 },
        );
      }
    }

    const modoUso =
      body.modoUso === "AUTONOMO"
        ? ModoUso.AUTONOMO
        : ModoUso.ASSISTIDO;

    const nivelAcompanhamento =
      body.nivelAcompanhamento === "INTENSIVO"
        ? NivelAcompanhamento.INTENSIVO
        : body.nivelAcompanhamento === "ASSISTIDO"
          ? NivelAcompanhamento.ASSISTIDO
          : NivelAcompanhamento.PREVENTIVO;

    const pessoa = await prisma.usuarioSACV.update({
      where: {
        id,
      },
      data: {
        nome,
        nomePreferido,
        telefone,
        dataNascimento,
        modoUso,
        nivelAcompanhamento,
        perfil: {
          upsert: {
            create: {
              tratamentoPreferido,
              estiloCida,
              horarioAcordar,
              horarioDormir,
              observacoesRotina,
              preferencias,
              limitacoes,
            },
            update: {
              tratamentoPreferido,
              estiloCida,
              horarioAcordar,
              horarioDormir,
              observacoesRotina,
              preferencias,
              limitacoes,
            },
          },
        },
      },
      include: {
        perfil: true,
      },
    });

    return NextResponse.json({
      ok: true,
      pessoa,
    });
  } catch (error) {
    console.error(
      "Falha ao atualizar pessoa no SACV",
      error,
    );

    return NextResponse.json(
      { error: "Não foi possível atualizar a pessoa." },
      { status: 500 },
    );
  }
}
