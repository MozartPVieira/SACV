import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const senha = String(body.senha ?? "");

    if (!email || !senha) {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    }

    const conta = await prisma.conta.findUnique({
      where: { email },
      include: { papeis: true },
    });

    if (!conta || !conta.ativo || !(await bcrypt.compare(senha, conta.senhaHash))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const papeis = conta.papeis.map((item) => item.papel);
    const token = await createSessionToken({
      contaId: conta.id,
      nome: conta.nome,
      email: conta.email,
      papeis,
    });
    await setSessionCookie(token);

    const redirectTo = papeis.includes("ADMIN") ? "/admin" : "/painel";
    return NextResponse.json({ ok: true, redirectTo });
  } catch (error) {
    console.error("Falha no login SACV", error);
    return NextResponse.json({ error: "Não foi possível entrar agora." }, { status: 500 });
  }
}
