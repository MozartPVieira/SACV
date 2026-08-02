"use client";

import { useState } from "react";

type TutorGerenciado = {
  vinculoId: string;
  nome: string;
  principal: boolean;
  ativo: boolean;
  podeEditar: boolean;
  recebeResumo: boolean;
  recebeAlertas: boolean;
};

export default function TutorActions({
  pessoaId,
  tutor,
  onUpdated,
}: {
  pessoaId: string;
  tutor: TutorGerenciado;
  onUpdated: () => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [permissoes, setPermissoes] = useState({
    podeEditar: tutor.podeEditar,
    recebeResumo: tutor.recebeResumo,
    recebeAlertas: tutor.recebeAlertas,
  });

  async function atualizar(ativo = tutor.ativo) {
    setErro("");
    setProcessando(true);

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/tutores/${tutor.vinculoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...permissoes,
            ativo,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível atualizar o integrante.",
        );
      }

      setAberto(false);
      await onUpdated();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o integrante.",
      );
    } finally {
      setProcessando(false);
    }
  }

  async function remover() {
    const confirmou = window.confirm(
      `Remover ${tutor.nome} da equipe de cuidados?`,
    );

    if (!confirmou) {
      return;
    }

    setErro("");
    setProcessando(true);

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/tutores/${tutor.vinculoId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível remover o integrante.",
        );
      }

      await onUpdated();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o integrante.",
      );
    } finally {
      setProcessando(false);
    }
  }

  if (tutor.principal) {
    return (
      <div className="team-actions principal-note">
        Tutor principal protegido contra suspensão e remoção.
      </div>
    );
  }

  return (
    <div className="team-actions">
      <button
        type="button"
        className="secondary-button compact-button"
        onClick={() => setAberto((valor) => !valor)}
      >
        {aberto ? "Fechar gerenciamento" : "Gerenciar acesso"}
      </button>

      {aberto && (
        <div className="team-editor">
          <strong>Permissões de {tutor.nome}</strong>

          <div className="invite-permissions">
            <label>
              <input
                type="checkbox"
                checked={permissoes.podeEditar}
                onChange={(event) =>
                  setPermissoes({
                    ...permissoes,
                    podeEditar: event.target.checked,
                  })
                }
              />
              Pode editar
            </label>

            <label>
              <input
                type="checkbox"
                checked={permissoes.recebeResumo}
                onChange={(event) =>
                  setPermissoes({
                    ...permissoes,
                    recebeResumo: event.target.checked,
                  })
                }
              />
              Recebe resumos
            </label>

            <label>
              <input
                type="checkbox"
                checked={permissoes.recebeAlertas}
                onChange={(event) =>
                  setPermissoes({
                    ...permissoes,
                    recebeAlertas: event.target.checked,
                  })
                }
              />
              Recebe alertas
            </label>
          </div>

          {erro && <p className="form-error">{erro}</p>}

          <div className="team-editor-buttons">
            <button
              type="button"
              className="primary-button"
              disabled={processando}
              onClick={() => void atualizar()}
            >
              Salvar permissões
            </button>

            <button
              type="button"
              className="secondary-button"
              disabled={processando}
              onClick={() => void atualizar(!tutor.ativo)}
            >
              {tutor.ativo ? "Suspender acesso" : "Reativar acesso"}
            </button>

            <button
              type="button"
              className="danger-button"
              disabled={processando}
              onClick={() => void remover()}
            >
              Remover da equipe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
