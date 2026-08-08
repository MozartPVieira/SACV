import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import "./dashboard-v05.css";

export default async function PainelPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
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
    select: {
      id: true,
      nome: true,
      nomePreferido: true,
    },
    orderBy: {
      nome: "asc",
    },
  });

  const pessoaIds = pessoas.map((pessoa) => pessoa.id);
  const agora = new Date();
  const inicioHoje = new Date(agora);
  inicioHoje.setHours(0, 0, 0, 0);
  const fimHoje = new Date(agora);
  fimHoje.setHours(23, 59, 59, 999);

  const [totalMedicamentos, cuidadosHoje, agendaHoje] =
    pessoaIds.length > 0
      ? await Promise.all([
          prisma.medicamento.count({
            where: {
              usuarioId: { in: pessoaIds },
              ativo: true,
            },
          }),
          prisma.agendamento.count({
            where: {
              usuarioId: { in: pessoaIds },
              inicio: {
                gte: inicioHoje,
                lte: fimHoje,
              },
            },
          }),
          prisma.agendamento.findMany({
            where: {
              usuarioId: { in: pessoaIds },
              inicio: {
                gte: inicioHoje,
                lte: fimHoje,
              },
            },
            include: {
              usuario: {
                select: {
                  nome: true,
                  nomePreferido: true,
                },
              },
            },
            orderBy: {
              inicio: "asc",
            },
            take: 6,
          }),
        ])
      : [0, 0, []];

  function horario(data: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  }

  const primeiroNome = session.nome.split(" ")[0];
  const dataHoje = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(agora);

  return (
    <div className="sacv-dashboard">
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">Painel de acompanhamento</p>
          <h1>Bom dia, {primeiroNome}! 👋</h1>
          <p className="dashboard-welcome-copy">Aqui está o resumo de hoje.</p>
          <span className="dashboard-date">{dataHoje}</span>
        </div>

        <Link href="/painel/rotina" className="dashboard-new-action">
          <strong>＋</strong>
          <span>Novo cuidado</span>
        </Link>
      </section>

      <section className="dashboard-metrics">
        <article className="dashboard-metric-card">
          <span className="dashboard-metric-icon">👥</span>
          <div>
            <strong>{pessoas.length}</strong>
            <span className="dashboard-metric-label">Pessoas acompanhadas</span>
            <span className="dashboard-metric-help">Ativas no acompanhamento</span>
            <Link href="/painel/pessoas">Ver pessoas →</Link>
          </div>
        </article>

        <article className="dashboard-metric-card metric-green">
          <span className="dashboard-metric-icon">💊</span>
          <div>
            <strong>{totalMedicamentos}</strong>
            <span className="dashboard-metric-label">Medicamentos ativos</span>
            <span className="dashboard-metric-help">Plano clínico em acompanhamento</span>
            <Link href="/painel/saude">Ver Perfil clínico →</Link>
          </div>
        </article>

        <article className="dashboard-metric-card metric-blue">
          <span className="dashboard-metric-icon">📅</span>
          <div>
            <strong>{cuidadosHoje}</strong>
            <span className="dashboard-metric-label">Cuidados hoje</span>
            <span className="dashboard-metric-help">Consultas, atividades e lembretes</span>
            <Link href="/painel/rotina">Ver rotina →</Link>
          </div>
        </article>

        <article className="dashboard-metric-card metric-orange">
          <span className="dashboard-metric-icon">⚠</span>
          <div>
            <strong>—</strong>
            <span className="dashboard-metric-label">Alertas importantes</span>
            <span className="dashboard-metric-help">Itens que precisam de atenção</span>
            <Link href="/painel/alertas">Ver alertas →</Link>
          </div>
        </article>
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="eyebrow">Hoje</p>
              <h2>Agenda do dia</h2>
            </div>
            <Link href="/painel/rotina">Ver agenda completa</Link>
          </div>

          {agendaHoje.length === 0 ? (
            <div className="dashboard-empty">
              <strong>Nenhum cuidado agendado para hoje</strong>
              <span>Os compromissos e cuidados aparecerão aqui.</span>
            </div>
          ) : (
            <div className="dashboard-agenda-list">
              {agendaHoje.map((item) => (
                <div key={item.id} className="dashboard-agenda-item">
                  <time>{horario(item.inicio)}</time>
                  <div>
                    <strong>{item.titulo}</strong>
                    <span>{item.usuario.nomePreferido ?? item.usuario.nome}</span>
                  </div>
                  <small>{item.status}</small>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="eyebrow">Acompanhamento</p>
              <h2>Pessoas acompanhadas</h2>
            </div>
            <Link href="/painel/pessoas">Ver todas</Link>
          </div>

          {pessoas.length === 0 ? (
            <div className="dashboard-empty">
              <strong>Nenhuma pessoa cadastrada</strong>
              <span>Cadastre a primeira pessoa acompanhada.</span>
            </div>
          ) : (
            <div className="dashboard-people-list">
              {pessoas.slice(0, 5).map((pessoa) => (
                <Link
                  key={pessoa.id}
                  href={`/painel/pessoas/${pessoa.id}`}
                  className="dashboard-person"
                >
                  <span className="dashboard-person-avatar">
                    {(pessoa.nomePreferido ?? pessoa.nome).charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{pessoa.nomePreferido ?? pessoa.nome}</strong>
                    {pessoa.nomePreferido && <small>{pessoa.nome}</small>}
                  </div>
                  <span className="dashboard-person-arrow">›</span>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel dashboard-quick-card">
          <h2>Acesso rápido</h2>
          <div className="dashboard-quick-grid">
            <Link href="/painel/saude">
              <span className="dashboard-quick-icon">💊</span>
              Medicamentos
              <small>Perfil clínico</small>
            </Link>
            <Link href="/painel/rotina">
              <span className="dashboard-quick-icon">📅</span>
              Novo cuidado
              <small>Agendar</small>
            </Link>
            <Link href="/painel/rotina">
              <span className="dashboard-quick-icon">✅</span>
              Registrar atividade
              <small>Rotina</small>
            </Link>
            <Link href="/painel/pessoas">
              <span className="dashboard-quick-icon">👤＋</span>
              Pessoas
              <small>Gerenciar</small>
            </Link>
            <Link href="/painel/relatorios">
              <span className="dashboard-quick-icon">📋</span>
              Relatórios
              <small>Acessar</small>
            </Link>
          </div>
        </article>

        <article className="dashboard-cida-card">
          <div>
            <p className="eyebrow">CIDA</p>
            <h2>Assistente de Cuidados</h2>
            <p>
              Use a CIDA para organizar lembretes, consultar informações do acompanhamento
              e acessar rapidamente os próximos cuidados.
            </p>
          </div>
          <div className="dashboard-cida-actions">
            <Link href="/painel/cida">Perguntar algo</Link>
            <Link href="/painel/rotina">Ver rotina</Link>
            <Link href="/painel/mensagens">Mensagens</Link>
          </div>
        </article>
      </section>

      <footer className="dashboard-footer">
        <span>♡ Cuidar é um ato de amor. Estamos juntos nessa jornada.</span>
        <span>SACV v0.5</span>
      </footer>
    </div>
  );
}
