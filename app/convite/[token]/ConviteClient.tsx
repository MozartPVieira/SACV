"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Convite = {
  nome: string;
  email: string;
  relacao: string | null;
  papel: "TUTOR" | "FAMILIAR" | "CUIDADOR";
  status: string;
  expiraEm: string;
  pessoaAcompanhada: string;
  possuiConta: boolean;
};

export default function ConviteClient({
  token,
}: {
  token: string;
}) {
  const router = useRouter();
  const [convite, setConvite] = useState<Convite | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(`/api/convites/${token}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Não foi possível abrir o convite.",
          );
        }

        setConvite(data.convite);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível abrir o convite.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [token]);

  async function aceitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const form = new FormData(event.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const confirmarSenha = String(
      form.get("confirmarSenha") ?? "",
    );

    if (!convite?.possuiConta && senha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch(`/api/convites/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.get("nome"),
          telefone: form.get("telefone"),
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível aceitar o convite.",
        );
      }

      router.push(data.redirectTo ?? "/painel");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível aceitar o convite.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function aceitarComContaExistente() {
    setErro("");
    setEnviando(true);

    try {
      const response = await fetch(`/api/convites/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível aceitar o convite.",
        );
      }

      router.push(data.redirectTo ?? "/painel");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível aceitar o convite.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main className="invite-page">
        <section className="invite-accept-card">
          <p>Carregando convite...</p>
        </section>
      </main>
    );
  }

  if (!convite) {
    return (
      <main className="invite-page">
        <section className="invite-accept-card">
          <p className="eyebrow">SACV</p>
          <h1>Convite indisponível</h1>
          <p className="form-error">{erro}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="invite-page">
      <section className="invite-accept-card">
        <div className="invite-brand">
          <span>CIDA</span>
          <div>
            <strong>SACV</strong>
            <small>Sistema de Acompanhamento e Cuidador Virtual</small>
          </div>
        </div>

        <p className="eyebrow">Convite para a equipe de cuidados</p>
        <h1>Você foi convidado para acompanhar {convite.pessoaAcompanhada}</h1>

        <div className="invite-summary">
          <div>
            <span>Convidado</span>
            <strong>{convite.nome}</strong>
          </div>
          <div>
            <span>E-mail</span>
            <strong>{convite.email}</strong>
          </div>
          <div>
            <span>Papel</span>
            <strong>{convite.papel.toLowerCase()}</strong>
          </div>
          {convite.relacao && (
            <div>
              <span>Relação</span>
              <strong>{convite.relacao}</strong>
            </div>
          )}
        </div>

        {convite.possuiConta ? (
          <div className="existing-account">
            <h2>Você já possui uma conta SACV</h2>
            <p>
              Entre com o e-mail <strong>{convite.email}</strong> e depois
              abra novamente este convite.
            </p>
            <button
              className="primary-button"
              onClick={aceitarComContaExistente}
              disabled={enviando}
            >
              {enviando ? "Aceitando..." : "Aceitar convite com esta conta"}
            </button>

            <button
              className="primary-button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                const retorno = encodeURIComponent(`/convite/${token}`);
                router.push(`/login?returnTo=${retorno}`);
                router.refresh();
              }}
            >
              Trocar de conta e entrar
            </button>
          </div>
        ) : (
          <form className="invite-accept-form" onSubmit={aceitar}>
            <h2>Crie seu acesso</h2>

            <label>
              Nome completo
              <input
                name="nome"
                required
                minLength={2}
                defaultValue={convite.nome}
              />
            </label>

            <label>
              E-mail do convite
              <input value={convite.email} disabled />
            </label>

            <label>
              Telefone
              <input name="telefone" type="tel" />
            </label>

            <div className="form-grid-two">
              <label>
                Senha
                <input
                  name="senha"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <label>
                Confirmar senha
                <input
                  name="confirmarSenha"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
            </div>

            {erro && <p className="form-error">{erro}</p>}

            <button className="primary-button" disabled={enviando}>
              {enviando ? "Aceitando..." : "Aceitar convite e entrar"}
            </button>
          </form>
        )}

        {convite.possuiConta && erro && (
          <p className="form-error">{erro}</p>
        )}
      </section>
    </main>
  );
}

