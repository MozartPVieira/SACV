import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, hasRole } from "@/lib/auth";
import { PapelConta } from "@/lib/generated/prisma/client";

export default async function PainelPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <section className="welcome-card">
        <p className="eyebrow">Painel de acompanhamento</p>
        <h1>Bom dia, {session.nome.split(" ")[0]}</h1>
        <p>
          Acompanhe pessoas, rotinas, cuidados e informações da CIDA.
        </p>

        <div className="role-row">
          {session.papeis.map((papel) => (
            <span key={papel} className="role-chip">
              {papel}
            </span>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="simple-card">
          <h2>Pessoas</h2>
          <p>Assistidos, tutores, rede de apoio e perfil da CIDA.</p>
          <Link href="/painel/pessoas">Abrir Pessoas</Link>
        </article>

        <article className="simple-card">
          <h2>Rotina</h2>
          <p>Agenda diária, atividades e compromissos.</p>
          <Link href="/painel/rotina">Abrir Rotina</Link>
        </article>

        <article className="simple-card">
          <h2>Saúde</h2>
          <p>Medicamentos, hidratação, sono, exercícios e consultas.</p>
          <Link href="/painel/saude">Abrir Saúde</Link>
        </article>

        <article className="simple-card">
          <h2>CIDA</h2>
          <p>Personalidade, conversas, listas e histórico.</p>
          <Link href="/painel/cida">Abrir CIDA</Link>
        </article>

        {hasRole(session, PapelConta.ADMIN) && (
          <article className="simple-card">
            <h2>Administração</h2>
            <p>Usuários, assinaturas, dispositivos e auditoria.</p>
            <Link href="/admin">Abrir administração</Link>
          </article>
        )}
      </section>
    </>
  );
}
