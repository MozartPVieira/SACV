import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { ModoUso, PapelConta } from "@/lib/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const telefone = String(body.telefone ?? "").trim() || null;
    const senha = String(body.senha ?? "");
    const tipo = body.tipo === "USUARIO" ? "USUARIO" : "CONTRATANTE";

    if (nome.length < 2 || !email.includes("@") || senha.length < 8) {
      return NextResponse.json(
        { error: "Informe nome, e-mail válido e senha com pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    const existente = await prisma.conta.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const papel = tipo === "USUARIO" ? PapelConta.USUARIO : PapelConta.CONTRATANTE;

    const conta = await prisma.$transaction(async (tx) => {
      const criada = await tx.conta.create({
        data: {
          nome,
          email,
          telefone,
          senhaHash,
          papeis: { create: [{ papel }] },
        },
      });

      if (tipo === "CONTRATANTE") {
        await tx.contratante.create({ data: { contaId: criada.id } });
      } else {
        await tx.usuarioSACV.create({
          data: {
            contaId: criada.id,
            nome,
            nomePreferido: nome.split(" ")[0],
            modoUso: ModoUso.AUTONOMO,
            perfil: { create: {} },
          },
        });
      }

      return criada;
    });

    const session = { contaId: conta.id, nome, email, papeis: [papel] };
    const token = await createSessionToken(session);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, redirectTo: "/painel" }, { status: 201 });
  } catch (error) {
    console.error("Falha no cadastro SACV", error);
    return NextResponse.json({ error: "Não foi possível concluir o cadastro." }, { status: 500 });
  }
}
