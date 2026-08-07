"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/painel", nome: "Dashboard", icone: "⌂" },
  { href: "/painel/pessoas", nome: "Pessoas", icone: "👥" },
  { href: "/painel/rotina", nome: "Rotina", icone: "📅" },
  { href: "/painel/saude", nome: "Perfil clínico", icone: "♥" },
  { href: "/painel/cida", nome: "CIDA", icone: "◉" },
  { href: "/painel/alertas", nome: "Alertas", icone: "⚠" },
  { href: "/painel/mensagens", nome: "Mensagens", icone: "✉" },
  { href: "/painel/informativos", nome: "Informativos", icone: "▣" },
  { href: "/painel/relatorios", nome: "Relatórios", icone: "▥" },
  { href: "/painel/dispositivos", nome: "Dispositivos", icone: "▤" },
  { href: "/painel/configuracoes", nome: "Configurações", icone: "⚙" },
];

export default function PainelSidebar() {
  const pathname = usePathname();

  return (
    <aside className="painel-sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark small">CIDA</span>
        <div>
          <strong>SACV</strong>
          <small>Acompanhamento</small>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {itens.map((item) => {
          const ativo =
            item.href === "/painel"
              ? pathname === "/painel"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={ativo ? "sidebar-link ativo" : "sidebar-link"}
            >
              <span aria-hidden="true">{item.icone}</span>
              {item.nome}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

