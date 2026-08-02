"use client";

import { useEffect, useState } from "react";

type TutorVinculado = {
  vinculoId: string;
  tutorId: string;
  contaId: string;
  nome: string;
  email: string;
  telefone: string | null;
  ativo: boolean;
  principal: boolean;
  podeEditar: boolean;
  recebeResumo: boolean;
  recebeAlertas: boolean;
};

export default function TutoresClient({
  pessoaId,
}: {
  pessoaId: string;
}) {
  const [tutores, setTutores] = useState<TutorVinculado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(
          `/api/pessoas/${pessoaId}/tutores`,
          { cache: "no-store" },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Não foi possível carregar os tutores.",
          );
        }

        setTutores(data.tutores);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os tutores.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [pessoaId]);

  return (
    <section className="tutores-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Equipe de cuidados</p>
          <h2>Tutores e rede de apoio</h2>
          <p>Pessoas autorizadas a acompanhar e cuidar.</p>
        </div>

        <span className="count-badge">{tutores.length}</span>
      </div>

      {carregando && <p>Carregando equipe...</p>}
      {erro && <p className="form-error">{erro}</p>}

      {!carregando && !erro && tutores.length === 0 && (
        <div className="empty-state">
          <strong>Nenhum tutor vinculado</strong>
          <span>Adicione uma pessoa à equipe de cuidados.</span>
        </div>
      )}

      <div className="tutores-list">
        {tutores.map((tutor) => (
          <article className="tutor-card" key={tutor.vinculoId}>
            <span className="tutor-avatar">
              {tutor.nome.trim().charAt(0).toUpperCase()}
            </span>

            <div className="tutor-info">
              <div className="tutor-title">
                <strong>{tutor.nome}</strong>
                {tutor.principal && <span>Tutor principal</span>}
              </div>

              <small>{tutor.email}</small>
              {tutor.telefone && <small>{tutor.telefone}</small>}

              <div className="permission-list">
                {tutor.podeEditar && <span>Pode editar</span>}
                {tutor.recebeResumo && <span>Recebe resumos</span>}
                {tutor.recebeAlertas && <span>Recebe alertas</span>}
              </div>
            </div>

            <span className={tutor.ativo ? "active-status" : "inactive-status"}>
              {tutor.ativo ? "Ativo" : "Inativo"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
