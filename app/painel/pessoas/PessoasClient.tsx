"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Pessoa = {
  id: string;
  nome: string;
  nomePreferido: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  modoUso: "AUTONOMO" | "ASSISTIDO";
  nivelAcompanhamento: "PREVENTIVO" | "ASSISTIDO" | "INTENSIVO";
};

export default function PessoasClient() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarPessoas = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/pessoas", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível carregar as pessoas.");
      }

      setPessoas(data);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as pessoas.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPessoas();
  }, [carregarPessoas]);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    const form = event.currentTarget;
    const dados = new FormData(form);

    try {
      const response = await fetch("/api/pessoas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: dados.get("nome"),
          nomePreferido: dados.get("nomePreferido"),
          telefone: dados.get("telefone"),
          dataNascimento: dados.get("dataNascimento"),
          modoUso: dados.get("modoUso"),
          nivelAcompanhamento: dados.get("nivelAcompanhamento"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível cadastrar a pessoa.");
      }

      form.reset();
      setSucesso("Pessoa cadastrada com sucesso.");
      await carregarPessoas();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a pessoa.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function formatarData(data: string | null) {
    if (!data) return "Não informada";

    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC",
    }).format(new Date(data));
  }

  return (
    <div className="pessoas-layout">
      <section className="pessoas-form-card">
        <div>
          <p className="eyebrow">Novo cadastro</p>
          <h2>Cadastrar pessoa acompanhada</h2>
          <p>
            Informe os dados iniciais do usuário que será acompanhado pela
            CIDA.
          </p>
        </div>

        <form onSubmit={cadastrar} className="pessoas-form">
          <label>
            Nome completo
            <input
              name="nome"
              required
              minLength={2}
              placeholder="Ex.: Clementina Pereira Vieira"
            />
          </label>

          <label>
            Nome preferido
            <input
              name="nomePreferido"
              placeholder="Ex.: Tina"
            />
          </label>

          <div className="form-grid-two">
            <label>
              Data de nascimento
              <input name="dataNascimento" type="date" />
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

          <div className="form-grid-two">
            <label>
              Modo de uso
              <select name="modoUso" defaultValue="ASSISTIDO">
                <option value="ASSISTIDO">Acompanhado por tutor</option>
                <option value="AUTONOMO">Uso autônomo</option>
              </select>
            </label>

            <label>
              Nível de acompanhamento
              <select
                name="nivelAcompanhamento"
                defaultValue="PREVENTIVO"
              >
                <option value="PREVENTIVO">Preventivo</option>
                <option value="ASSISTIDO">Assistido</option>
                <option value="INTENSIVO">Intensivo</option>
              </select>
            </label>
          </div>

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
            type="submit"
            className="primary-button"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Cadastrar pessoa"}
          </button>
        </form>
      </section>

      <section className="pessoas-list-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pessoas vinculadas</p>
            <h2>Assistidos</h2>
          </div>

          <span className="count-badge">{pessoas.length}</span>
        </div>

        {carregando ? (
          <p>Carregando pessoas...</p>
        ) : pessoas.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma pessoa cadastrada</strong>
            <span>Use o formulário para realizar o primeiro cadastro.</span>
          </div>
        ) : (
          <div className="pessoas-list">
            {pessoas.map((pessoa) => (
              <article key={pessoa.id} className="pessoa-card">
                <div className="pessoa-avatar">
                  {(pessoa.nomePreferido ?? pessoa.nome)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="pessoa-info">
                  <strong>{pessoa.nome}</strong>

                  {pessoa.nomePreferido && (
                    <span>Nome preferido: {pessoa.nomePreferido}</span>
                  )}

                  <span>
                    Nascimento: {formatarData(pessoa.dataNascimento)}
                  </span>

                  <span>
                    Telefone: {pessoa.telefone ?? "Não informado"}
                  </span>
                </div>

                <div className="pessoa-status">
                  <span>{pessoa.modoUso}</span>
                  <small>{pessoa.nivelAcompanhamento}</small>
                  <Link
                    href={`/painel/pessoas/${pessoa.id}`}
                    className="perfil-link"
                  >
                    Ver perfil
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

