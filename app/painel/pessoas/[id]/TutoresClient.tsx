"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type TipoMembro =
  | "FAMILIAR"
  | "CUIDADOR"
  | "PROFISSIONAL_SAUDE"
  | "VIZINHO"
  | "AMIGO"
  | "OUTRO";

type MembroRede = {
  id: string;
  nome: string;
  relacao: string | null;
  tipo: TipoMembro;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  podeEditar: boolean;
  recebeResumo: boolean;
  recebeAlertas: boolean;
  ativo: boolean;
};

type DadosRede = {
  pessoa: {
    id: string;
    nome: string;
  };
  membros: MembroRede[];
};

const nomesTipos: Record<TipoMembro, string> = {
  FAMILIAR: "Familiar",
  CUIDADOR: "Cuidador",
  PROFISSIONAL_SAUDE: "Profissional de saúde",
  VIZINHO: "Vizinho",
  AMIGO: "Amigo",
  OUTRO: "Outro",
};

export default function TutoresClient({
  pessoaId,
}: {
  pessoaId: string;
}) {
  const [dados, setDados] = useState<DadosRede | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarRede = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/tutores`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível carregar a rede de apoio.",
        );
      }

      setDados(data);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a rede de apoio.",
      );
    } finally {
      setCarregando(false);
    }
  }, [pessoaId]);

  useEffect(() => {
    void carregarRede();
  }, [carregarRede]);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    const formulario = event.currentTarget;
    const campos = new FormData(formulario);

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/tutores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: campos.get("nome"),
            relacao: campos.get("relacao"),
            tipo: campos.get("tipo"),
            telefone: campos.get("telefone"),
            email: campos.get("email"),
            observacoes: campos.get("observacoes"),
            podeEditar: campos.get("podeEditar") === "on",
            recebeResumo: campos.get("recebeResumo") === "on",
            recebeAlertas: campos.get("recebeAlertas") === "on",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível cadastrar o membro.",
        );
      }

      formulario.reset();
      setMostrarFormulario(false);
      setSucesso("Membro cadastrado na rede de apoio.");
      await carregarRede();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o membro.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="perfil-card rede-card">
      <div className="team-heading-actions">
        <div>
          <p className="eyebrow">Rede de apoio</p>
          <h2>Familiares e pessoas de confiança</h2>
          <p>
            Cadastro das pessoas que participam do acompanhamento e dos
            cuidados.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setMostrarFormulario((atual) => !atual);
            setErro("");
            setSucesso("");
          }}
        >
          {mostrarFormulario
            ? "Fechar cadastro"
            : "Adicionar membro"}
        </button>
      </div>

      {mostrarFormulario && (
        <form className="invite-form" onSubmit={cadastrar}>
          <div className="form-grid-two">
            <label>
              Nome
              <input
                name="nome"
                required
                minLength={2}
                placeholder="Ex.: Adriano"
              />
            </label>

            <label>
              Relação com a pessoa acompanhada
              <input
                name="relacao"
                placeholder="Ex.: Filho, vizinha, cuidadora"
              />
            </label>
          </div>

          <div className="form-grid-two">
            <label>
              Tipo de integrante
              <select name="tipo" defaultValue="FAMILIAR">
                <option value="FAMILIAR">Familiar</option>
                <option value="CUIDADOR">Cuidador</option>
                <option value="PROFISSIONAL_SAUDE">
                  Profissional de saúde
                </option>
                <option value="VIZINHO">Vizinho</option>
                <option value="AMIGO">Amigo</option>
                <option value="OUTRO">Outro</option>
              </select>
            </label>

            <label>
              Telefone
              <input
                name="telefone"
                type="tel"
                placeholder="(13) 99999-9999"
              />
            </label>
          </div>

          <label>
            E-mail — opcional
            <input
              name="email"
              type="email"
              placeholder="nome@exemplo.com"
            />
          </label>

          <label>
            Observações
            <textarea
              name="observacoes"
              rows={3}
              placeholder="Disponibilidade, orientações ou informações importantes."
            />
          </label>

          <div className="permission-grid">
            <label className="check-option">
              <input name="podeEditar" type="checkbox" />
              Pode editar informações
            </label>

            <label className="check-option">
              <input
                name="recebeResumo"
                type="checkbox"
                defaultChecked
              />
              Recebe resumos
            </label>

            <label className="check-option">
              <input
                name="recebeAlertas"
                type="checkbox"
                defaultChecked
              />
              Recebe alertas
            </label>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Cadastrar membro"}
          </button>
        </form>
      )}

      {erro && <p className="form-error">{erro}</p>}
      {sucesso && <p className="form-success">{sucesso}</p>}

      {carregando ? (
        <p>Carregando rede de apoio...</p>
      ) : !dados || dados.membros.length === 0 ? (
        <div className="empty-state">
          <strong>Nenhum membro cadastrado</strong>
          <span>
            Use o botão “Adicionar membro” para formar a rede de apoio.
          </span>
        </div>
      ) : (
        <div className="team-list">
          {dados.membros.map((membro) => (
            <article className="team-card" key={membro.id}>
              <div className="pessoa-avatar">
                {membro.nome.charAt(0).toUpperCase()}
              </div>

              <div className="team-info">
                <strong>{membro.nome}</strong>

                <span>
                  {membro.relacao ?? "Relação não informada"} •{" "}
                  {nomesTipos[membro.tipo]}
                </span>

                <span>
                  {membro.telefone ?? "Telefone não informado"}
                </span>

                {membro.email && <span>{membro.email}</span>}

                {membro.observacoes && (
                  <span className="member-notes">
                    {membro.observacoes}
                  </span>
                )}
              </div>

              <div className="team-permissions">
                <span className="team-badge">
                  {nomesTipos[membro.tipo]}
                </span>

                <small>
                  {membro.podeEditar
                    ? "Pode editar"
                    : "Somente acompanhamento"}
                </small>

                <small>
                  {membro.recebeAlertas
                    ? "Recebe alertas"
                    : "Sem alertas"}
                </small>

                <small>
                  {membro.recebeResumo
                    ? "Recebe resumos"
                    : "Sem resumos"}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}