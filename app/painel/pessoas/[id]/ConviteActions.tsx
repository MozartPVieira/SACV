"use client";

import { useState } from "react";

export default function ConviteActions({
  pessoaId,
  conviteId,
  token,
  nome,
  onUpdated,
}: {
  pessoaId: string;
  conviteId: string;
  token: string;
  nome: string;
  onUpdated: () => Promise<void>;
}) {
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function copiarLink() {
    setErro("");

    try {
      const link = `${window.location.origin}/convite/${token}`;
      await navigator.clipboard.writeText(link);
      setMensagem("Link copiado.");
    } catch {
      setErro("Não foi possível copiar o link.");
    }
  }

  async function renovar() {
    setErro("");
    setMensagem("");
    setProcessando(true);

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/convites/${conviteId}`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível renovar o convite.",
        );
      }

      setMensagem("Convite renovado por mais 7 dias.");
      await onUpdated();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível renovar o convite.",
      );
    } finally {
      setProcessando(false);
    }
  }

  async function cancelar() {
    const confirmou = window.confirm(
      `Cancelar o convite enviado para ${nome}?`,
    );

    if (!confirmou) {
      return;
    }

    setErro("");
    setMensagem("");
    setProcessando(true);

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/convites/${conviteId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível cancelar o convite.",
        );
      }

      await onUpdated();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar o convite.",
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="team-actions pending-actions">
      <div className="pending-action-buttons">
        <button
          type="button"
          className="secondary-button compact-button"
          onClick={() => void copiarLink()}
        >
          Copiar link
        </button>

        <button
          type="button"
          className="secondary-button compact-button"
          disabled={processando}
          onClick={() => void renovar()}
        >
          Renovar por 7 dias
        </button>

        <button
          type="button"
          className="danger-button compact-button"
          disabled={processando}
          onClick={() => void cancelar()}
        >
          Cancelar convite
        </button>
      </div>

      {mensagem && <p className="inline-success">{mensagem}</p>}
      {erro && <p className="form-error">{erro}</p>}
    </div>
  );
}
