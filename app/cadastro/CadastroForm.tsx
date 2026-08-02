"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CadastroForm() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    const form = new FormData(event.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const confirmar = String(form.get("confirmarSenha") ?? "");
    if (senha !== confirmar) {
      setErro("As senhas não conferem.");
      setEnviando(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.get("nome"), email: form.get("email"), telefone: form.get("telefone"),
          senha, tipo: form.get("tipo"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha no cadastro.");
      router.push(data.redirectTo ?? "/painel");
      router.refresh();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha no cadastro.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <label>Nome completo<input name="nome" required minLength={2} /></label>
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <label>Telefone<input name="telefone" type="tel" /></label>
      <label>O SACV será usado por
        <select name="tipo" defaultValue="CONTRATANTE">
          <option value="CONTRATANTE">Outra pessoa — serei contratante/tutor</option>
          <option value="USUARIO">Mim mesmo — modo autônomo</option>
        </select>
      </label>
      <label>Senha<input name="senha" type="password" minLength={8} required autoComplete="new-password" /></label>
      <label>Confirmar senha<input name="confirmarSenha" type="password" minLength={8} required autoComplete="new-password" /></label>
      {erro && <p className="form-error" role="alert">{erro}</p>}
      <button className="primary-button" disabled={enviando}>{enviando ? "Criando..." : "Criar conta"}</button>
    </form>
  );
}
