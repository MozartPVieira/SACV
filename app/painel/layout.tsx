import { ReactNode } from "react";
import { redirect } from "next/navigation";
import PainelSidebar from "@/components/PainelSidebar";
import { getSession } from "@/lib/auth";

export default async function PainelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="painel-shell">
      <PainelSidebar />

      <div className="painel-area">
        <header className="painel-header">
          <div>
            <strong>{session.nome}</strong>
            <small>{session.papeis.join(" • ")}</small>
          </div>

          <form action="/api/auth/logout" method="post">
            <button className="secondary-button" type="submit">
              Sair
            </button>
          </form>
        </header>

        <main className="painel-conteudo">{children}</main>
      </div>
    </div>
  );
}
