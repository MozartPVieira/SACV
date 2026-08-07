import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
              usuarioId: {
                in: pessoaIds,
              },
              ativo: true,
            },
          }),

          prisma.agendamento.count({
            where: {
              usuarioId: {
                in: pessoaIds,
              },
              inicio: {
                gte: inicioHoje,
                lte: fimHoje,
              },
            },
          }),

          prisma.agendamento.findMany({
            where: {
              usuarioId: {
                in: pessoaIds,
              },
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

  return (
    <div className="sacv-dashboard">
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">Painel de acompanhamento</p>
          <h1>Bom dia, {primeiroNome}!</h1>
          <p>Aqui está o resumo atual do SACV.</p>
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
            <span>Pessoas acompanhadas</span>
            <Link href="/painel/pessoas">Ver pessoas</Link>
          </div>
        </article>

        <article className="dashboard-metric-card">
          <span className="dashboard-metric-icon">📅</span>
          <div>
            <strong>{cuidadosHoje}</strong>
            <span>Cuidados hoje</span>
            <Link href="/painel/rotina">Ver rotina</Link>
          </div>
        </article>

        <article className="dashboard-metric-card">
          <span className="dashboard-metric-icon">💊</span>
          <div>
            <strong>{totalMedicamentos}</strong>
            <span>Medicamentos ativos</span>
            <Link href="/painel/saude">Ver Perfil clínico</Link>
          </div>
        </article>

        <article className="dashboard-metric-card">
          <span className="dashboard-metric-icon">⚠</span>
          <div>
            <strong>—</strong>
            <span>Alertas importantes</span>
            <Link href="/painel/alertas">Ver alertas</Link>
          </div>
        </article>
      </section>

      <section className="dashboard-columns">
        <article className="dashboard-panel dashboard-agenda">
          <div className="dashboard-panel-heading">
            <div>
              <p className="eyebrow">Hoje</p>
              <h2>Agenda do dia</h2>
            </div>

            <Link href="/painel/rotina">Ver agenda</Link>
          </div>

          {agendaHoje.length === 0 ? (
            <div className="dashboard-empty">
              <strong>Nenhum cuidado agendado para hoje</strong>
              <span>
                Os compromissos e cuidados aparecerão aqui.
              </span>
            </div>
          ) : (
            <div className="dashboard-agenda-list">
              {agendaHoje.map((item) => (
                <div key={item.id} className="dashboard-agenda-item">
                  <time>{horario(item.inicio)}</time>

                  <div>
                    <strong>{item.titulo}</strong>
                    <span>
                      {item.usuario.nomePreferido ??
                        item.usuario.nome}
                    </span>
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
              <h2>Pessoas</h2>
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
                    {(pessoa.nomePreferido ?? pessoa.nome)
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <div>
                    <strong>
                      {pessoa.nomePreferido ?? pessoa.nome}
                    </strong>

                    {pessoa.nomePreferido && (
                      <small>{pessoa.nome}</small>
                    )}
                  </div>

                  <span>›</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="eyebrow">CIDA</p>
              <h2>Acesso rápido</h2>
            </div>
          </div>

          <div className="dashboard-quick-list">
            <Link href="/painel/saude">
              <span>♥</span>
              Perfil clínico
            </Link>

            <Link href="/painel/rotina">
              <span>📅</span>
              Rotina
            </Link>

            <Link href="/painel/mensagens">
              <span>✉</span>
              Mensagens
            </Link>

            <Link href="/painel/cida">
              <span>◉</span>
              Conversar com a CIDA
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
