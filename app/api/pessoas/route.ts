import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  ModoUso,
  NivelAcompanhamento,
  PapelConta,
} from "@/lib/generated/prisma/client";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 401 },
      );
    }

    const pessoas = await prisma.usuarioSACV.findMany({
      where: {
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
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(pessoas);
  } catch (error) {
    console.error("Falha ao consultar pessoas do SACV", error);

    return NextResponse.json(
      { error: "Não foi possível consultar as pessoas." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 401 },
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

    const modoUso =
      body.modoUso === "AUTONOMO"
        ? ModoUso.AUTONOMO
        : ModoUso.ASSISTIDO;

    const nivelAcompanhamento =
      body.nivelAcompanhamento === "ASSISTIDO"
        ? NivelAcompanhamento.ASSISTIDO
        : body.nivelAcompanhamento === "INTENSIVO"
          ? NivelAcompanhamento.INTENSIVO
          : NivelAcompanhamento.PREVENTIVO;

    if (nome.length < 2) {
      return NextResponse.json(
        { error: "Informe o nome completo da pessoa." },
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
          { error: "A data de nascimento é inválida." },
          { status: 400 },
        );
      }
    }

    const pessoa = await prisma.$transaction(async (tx) => {
      const tutor = await tx.tutor.upsert({
        where: {
          contaId: session.contaId,
        },
        update: {},
        create: {
          contaId: session.contaId,
        },
      });

      await tx.contaPapel.upsert({
        where: {
          contaId_papel: {
            contaId: session.contaId,
            papel: PapelConta.TUTOR,
          },
        },
        update: {},
        create: {
          contaId: session.contaId,
          papel: PapelConta.TUTOR,
        },
      });

      const criada = await tx.usuarioSACV.create({
        data: {
          nome,
          nomePreferido,
          telefone,
          dataNascimento,
          modoUso,
          nivelAcompanhamento,
          perfil: {
            create: {
              tratamentoPreferido: nomePreferido,
            },
          },
        },
      });

      await tx.vinculoTutorUsuario.create({
        data: {
          tutorId: tutor.id,
          usuarioId: criada.id,
          principal: true,
          podeEditar: true,
          recebeResumo: true,
          recebeAlertas: true,
        },
      });

      return criada;
    });

    return NextResponse.json(
      {
        ok: true,
        pessoa,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Falha ao cadastrar pessoa no SACV", error);

    return NextResponse.json(
      { error: "Não foi possível cadastrar a pessoa." },
      { status: 500 },
    );
  }
}

