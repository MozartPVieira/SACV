"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({
  returnTo = "/painel",
}: {
  returnTo?: string;
}) {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          senha: form.get("senha"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha no login.");
      }

      router.push(returnTo);
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Falha no login.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <label>
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label>
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      {erro && (
        <p className="form-error" role="alert">
          {erro}
        </p>
      )}

      <button className="primary-button" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
