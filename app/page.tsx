"use client";

import { useState } from "react";

const rotina = [
  { hora: "08:00", titulo: "Medicamento da manhã", status: "Confirmado", classe: "ok" },
  { hora: "10:30", titulo: "Caminhada", status: "Concluído", classe: "ok" },
  { hora: "14:00", titulo: "Nenhum compromisso", status: "Tudo tranquilo", classe: "neutral" },
  { hora: "20:00", titulo: "Medicamento da noite", status: "Pendente", classe: "warn" },
];

export default function Home() {
  const [modo, setModo] = useState<"cida" | "tutor">("cida");
  const [fala, setFala] = useState("Bom dia, Dona Tina. Estou aqui para ajudar no que precisar.");

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">SACV 0.1 • PREVIEW NAVEGÁVEL</span>
          <h1>Sistema de Acompanhamento e Cuidador Virtual</h1>
          <p>CIDA — Cuidadora Inteligente de Acompanhamento</p>
        </div>
        <div className="mode-switch" aria-label="Escolher visualização">
          <button className={modo === "cida" ? "active" : ""} onClick={() => setModo("cida")}>Usuário / CIDA</button>
          <button className={modo === "tutor" ? "active" : ""} onClick={() => setModo("tutor")}>Tutor</button>
        </div>
      </header>

      {modo === "cida" ? (
        <section className="mobile-wrap">
          <div className="phone-card">
            <div className="brand-row"><strong>CIDA</strong><span>● online</span></div>
            <div className="hero-user">
              <img src="/tina.jpg" alt="Dona Tina" />
              <div>
                <h2>Bom dia, Tina!</h2>
                <p>Domingo, 26 de julho</p>
                <button className="soft" onClick={() => setFala("Que bom falar com você, Tina. Como você está se sentindo hoje?")}>Como você está hoje?</button>
              </div>
            </div>

            <div className="cida-speech" aria-live="polite">“{fala}”</div>

            <div className="section-title"><span>Seu dia</span><small>4 atividades</small></div>
            <div className="routine-list">
              {rotina.map((item) => (
                <div className="routine-item" key={item.hora}>
                  <strong>{item.hora}</strong>
                  <span>{item.titulo}</span>
                  <em className={item.classe}>{item.status}</em>
                </div>
              ))}
            </div>

            <div className="mini-grid">
              <div className="mini-card"><span>🛒 Lista de compras</span><strong>4 itens</strong></div>
              <div className="mini-card"><span>💧 Água hoje</span><strong>4/8 copos</strong></div>
            </div>

            <button className="primary" onClick={() => setFala("Estou ouvindo, Tina. O que você gostaria de me dizer?")}>🎙 Falar com a CIDA</button>
            <div className="action-row">
              <button onClick={() => setFala("Sua próxima atividade é o medicamento da noite, às 20 horas.")}>Minha rotina</button>
              <button className="danger" onClick={() => setFala("Entendi. Vou ajudar a chamar uma pessoa da sua rede de apoio.")}>Preciso de ajuda</button>
            </div>
          </div>
        </section>
      ) : (
        <section className="dashboard">
          <aside>
            <div className="logo">SACV</div>
            {['Visão geral','Usuários','Rotina','Saúde','Alertas','Mensagens','Informativos','Relatórios','Dispositivos','Configurações'].map((i,idx)=><button key={i} className={idx===0?'selected':''}>{i}</button>)}
          </aside>
          <div className="dashboard-main">
            <div className="profile-head">
              <img src="/tina.jpg" alt="Dona Tina" />
              <div><h2>Dona Tina <span className="badge">Ativo</span></h2><p>Nível 1 — Preventivo</p><small>Último contato com a CIDA: hoje, 07:45</small></div>
              <div className="status-box"><span>Situação atual</span><strong>🙂 Tudo bem</strong><small>Sem alertas no momento</small></div>
            </div>

            <div className="metrics">
              <article><span>Atividades do dia</span><strong>3/4</strong><small>concluídas</small></article>
              <article><span>Medicamentos</span><strong>1/2</strong><small>confirmados</small></article>
              <article><span>Água hoje</span><strong>4/8</strong><small>copos</small></article>
              <article><span>Sono</span><strong>7h20</strong><small>noite anterior</small></article>
            </div>

            <div className="dash-grid">
              <article className="panel"><h3>Próximas atividades</h3><p><b>20:00</b> Medicamento da noite</p><p><b>21:00</b> Leitura antes de dormir</p><p><b>22:00</b> Hora de descansar</p></article>
              <article className="panel"><h3>Resumo de hoje</h3><p>✓ Medicamento da manhã confirmado às 08:05</p><p>✓ Caminhada concluída às 10:45</p><p>✓ Almoço registrado às 12:30</p><p>○ Hidratação: 4/8 copos</p><p className="warn-text">○ Medicamento da noite pendente</p></article>
              <article className="panel"><h3>Informativos recentes</h3><p><b>Hidratação</b><br/>Pequenos goles ao longo do dia.</p><p><b>Saúde e bem-estar</b><br/>Exercícios leves ajudam na mobilidade.</p></article>
            </div>

            <div className="dash-grid lower">
              <article className="panel"><h3>Observações recentes da CIDA</h3><p>Conversa tranquila e orientada.</p><p>Sem queixas de dor.</p><p>Boa disposição para as atividades.</p></article>
              <article className="panel"><h3>Rede de apoio</h3><p>Mozart Pereira Vieira — Tutor principal</p><p>Mariana Vieira — Familiar</p><p>Dr. Carlos Alberto — Médico</p></article>
              <article className="panel"><h3>Ações rápidas</h3><button>Enviar mensagem para CIDA</button><button>Registrar observação</button><button className="danger-outline">Registrar alerta</button></article>
            </div>
          </div>
        </section>
      )}

      <footer>Protótipo SACV 0.1 • CIDA • MPV Informática</footer>
    </main>
  );
}
