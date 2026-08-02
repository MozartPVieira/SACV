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

    return NextResponse.json({
      pessoa: {
        id: pessoa.id,
        nome: pessoa.nome,
        nomePreferido: pessoa.nomePreferido,
      },
      tutores,
    });
  } catch (error) {
    console.error("Falha ao consultar tutores do SACV", error);

    return NextResponse.json(
      { error: "Não foi possível consultar os tutores." },
      { status: 500 },
    );
  }
}
