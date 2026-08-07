"use client";

import { FormEvent, useState } from "react";

export default function EmailTestClient() {
  const [destinatario, setDestinatario] = useState(
    "mozart@mpvinfo.com.br",
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function testar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setEnviando(true);

    try {
      const response = await fetch("/api/admin/email/teste", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinatario,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível enviar o e-mail.",
        );
      }

      setSucesso(data.message);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o e-mail.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="email-test-card">
      <div>
        <p className="eyebrow">Validação SMTP</p>
        <h2>Enviar e-mail de teste</h2>
        <p>
          Confirme a conexão com o servidor e registre o resultado
          no histórico do SACV.
        </p>
      </div>

      <form onSubmit={testar}>
        <label>
          E-mail destinatário
          <input
            type="email"
            required
            value={destinatario}
            onChange={(event) =>
              setDestinatario(event.target.value)
            }
          />
        </label>

        {erro && (
          <p className="form-error" role="alert">
            {erro}
          </p>
        )}

        {sucesso && (
          <p className="form-success" role="status">
            {sucesso}
          </p>
        )}

        <button
          className="primary-button"
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar teste"}
        </button>
      </form>
    </section>
  );
}
