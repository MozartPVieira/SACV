"use client";

import { FormEvent, useEffect, useState } from "react";
import TutorActions from "./TutorActions";
import ConviteActions from "./ConviteActions";

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

type ConvitePendente = {
  id: string;
  token: string;
  convidadoNome: string;
  convidadoEmail: string;
  relacao: string | null;
  papel: "TUTOR" | "FAMILIAR" | "CUIDADOR";
  podeEditar: boolean;
  recebeResumo: boolean;
  recebeAlertas: boolean;
  status: "PENDENTE";
  expiraEm: string;
  criadoEm: string;
};

const formularioInicial = {
  nome: "",
  email: "",
  relacao: "",
  papel: "TUTOR",
  podeEditar: true,
  recebeResumo: true,
  recebeAlertas: true,
};

export default function TutoresClient({
  pessoaId,
}: {
  pessoaId: string;
}) {
  const [tutores, setTutores] = useState<TutorVinculado[]>([]);
  const [convites, setConvites] = useState<ConvitePendente[]>([]);
  const [podeGerenciarEquipe, setPodeGerenciarEquipe] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregar() {
    try {
      setErro("");

      const response = await fetch(
        `/api/pessoas/${pessoaId}/tutores`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível carregar a equipe.",
        );
      }

      setTutores(data.tutores);
      setConvites(data.convites ?? []);
      setPodeGerenciarEquipe(Boolean(data.podeGerenciarEquipe));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a equipe.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, [pessoaId]);

  async function convidar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/tutores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formulario),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível registrar o convite.",
        );
      }

      setFormulario(formularioInicial);
      setMostrarFormulario(false);
      setSucesso("Convite registrado com sucesso.");
      await carregar();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar o convite.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="tutores-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Equipe de cuidados</p>
          <h2>Tutores e rede de apoio</h2>
          <p>Pessoas autorizadas a acompanhar e cuidar.</p>
        </div>

        <div className="team-heading-actions">
          <span className="count-badge">
            {tutores.length + convites.length}
          </span>

          {podeGerenciarEquipe && (
          <button
            type="button"
            className="primary-button"
            onClick={() => setMostrarFormulario((valor) => !valor)}
          >
            {mostrarFormulario ? "Fechar" : "Convidar pessoa"}
          </button>
          )}
        </div>
      </div>

      {mostrarFormulario && (
        <form className="invite-form" onSubmit={convidar}>
          <div className="form-grid-two">
            <label>
              Nome
              <input
                required
                value={formulario.nome}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    nome: event.target.value,
                  })
                }
                placeholder="Nome da pessoa"
              />
            </label>

            <label>
              E-mail
              <input
                required
                type="email"
                value={formulario.email}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    email: event.target.value,
                  })
                }
                placeholder="pessoa@email.com"
              />
            </label>
          </div>

          <div className="form-grid-two">
            <label>
              Relação com a pessoa acompanhada
              <input
                value={formulario.relacao}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    relacao: event.target.value,
                  })
                }
                placeholder="Ex.: Filho, filha, cuidador"
              />
            </label>

            <label>
              Papel na equipe
              <select
                value={formulario.papel}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    papel: event.target.value,
                  })
                }
              >
                <option value="TUTOR">Tutor</option>
                <option value="FAMILIAR">Familiar</option>
                <option value="CUIDADOR">Cuidador</option>
              </select>
            </label>
          </div>

          <div className="invite-permissions">
            <label>
              <input
                type="checkbox"
                checked={formulario.podeEditar}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    podeEditar: event.target.checked,
                  })
                }
              />
              Pode editar informações
            </label>

            <label>
              <input
                type="checkbox"
                checked={formulario.recebeResumo}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    recebeResumo: event.target.checked,
                  })
                }
              />
              Recebe resumos
            </label>

            <label>
              <input
                type="checkbox"
                checked={formulario.recebeAlertas}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    recebeAlertas: event.target.checked,
                  })
                }
              />
              Recebe alertas
            </label>
          </div>

          <div className="invite-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={salvando}
            >
              {salvando ? "Registrando..." : "Registrar convite"}
            </button>
          </div>
        </form>
      )}

      {erro && <p className="form-error">{erro}</p>}
      {sucesso && <p className="form-success">{sucesso}</p>}
      {carregando && <p>Carregando equipe...</p>}

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

            {podeGerenciarEquipe && (
            <TutorActions
              pessoaId={pessoaId}
              tutor={tutor}
              onUpdated={carregar}
            />
            )}
          </article>
        ))}

        {convites.map((convite) => (
          <article className="tutor-card pending-card" key={convite.id}>
            <span className="tutor-avatar pending-avatar">
              {convite.convidadoNome.trim().charAt(0).toUpperCase()}
            </span>

            <div className="tutor-info">
              <div className="tutor-title">
                <strong>{convite.convidadoNome}</strong>
                <span>{convite.papel.toLowerCase()}</span>
              </div>

              <small>{convite.convidadoEmail}</small>
              <a className="invite-link" href={`/convite/${convite.token}`} target="_blank" rel="noreferrer">Abrir convite</a>
              {convite.relacao && <small>{convite.relacao}</small>}

              <div className="permission-list">
                {convite.podeEditar && <span>Pode editar</span>}
                {convite.recebeResumo && <span>Recebe resumos</span>}
                {convite.recebeAlertas && <span>Recebe alertas</span>}
              </div>
            </div>

            <span className="pending-status">Convite pendente</span>

            {podeGerenciarEquipe && (
            <ConviteActions
              pessoaId={pessoaId}
              conviteId={convite.id}
              token={convite.token}
              nome={convite.convidadoNome}
              onUpdated={carregar}
            />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
