import { redirect } from "next/navigation";
import { getSession, hasRole } from "@/lib/auth";
import { PapelConta } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasRole(session, PapelConta.ADMIN)) redirect("/painel");

  const [contas, usuarios, assinaturas] = await Promise.all([
    prisma.conta.count(), prisma.usuarioSACV.count(), prisma.assinatura.count(),
  ]);

  return (
    <main className="protected-page">
      <header className="protected-header"><div><span className="brand-mark small">SACV</span><strong>Administração</strong></div><a href="/painel">Voltar ao painel</a></header>
      <section className="welcome-card"><p className="eyebrow">Área restrita</p><h1>Painel Administrativo</h1><p>Acesso concedido a {session.nome}.</p></section>
      <section className="metric-grid">
        <article className="metric"><span>Contas</span><strong>{contas}</strong></article>
        <article className="metric"><span>Usuários SACV</span><strong>{usuarios}</strong></article>
        <article className="metric"><span>Assinaturas</span><strong>{assinaturas}</strong></article>
      </section>
    </main>
  );
}
