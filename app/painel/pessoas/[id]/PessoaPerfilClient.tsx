"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Pessoa = {
  id: string;
  nome: string;
  nomePreferido: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  modoUso: "AUTONOMO" | "ASSISTIDO";
  nivelAcompanhamento: "PREVENTIVO" | "ASSISTIDO" | "INTENSIVO";
  perfil: {
    tratamentoPreferido: string | null;
    estiloCida: string | null;
    horarioAcordar: string | null;
    horarioDormir: string | null;
    observacoesRotina: string | null;
    preferencias: string | null;
    limitacoes: string | null;
  } | null;
};

export default function PessoaPerfilClient({
  pessoaId,
}: {
  pessoaId: string;
}) {
  const router = useRouter();
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(`/api/pessoas/${pessoaId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Não foi possível carregar o perfil.");
        }

        setPessoa(data);
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o perfil.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [pessoaId]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/pessoas/${pessoaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: form.get("nome"),
          nomePreferido: form.get("nomePreferido"),
          telefone: form.get("telefone"),
          dataNascimento: form.get("dataNascimento"),
          modoUso: form.get("modoUso"),
          nivelAcompanhamento: form.get("nivelAcompanhamento"),
          tratamentoPreferido: form.get("tratamentoPreferido"),
          estiloCida: form.get("estiloCida"),
          horarioAcordar: form.get("horarioAcordar"),
          horarioDormir: form.get("horarioDormir"),
          observacoesRotina: form.get("observacoesRotina"),
          preferencias: form.get("preferencias"),
          limitacoes: form.get("limitacoes"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível salvar o perfil.");
      }

      setPessoa(data.pessoa);
      setSucesso("Perfil atualizado com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o perfil.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function dataParaInput(data: string | null) {
    return data ? new Date(data).toISOString().slice(0, 10) : "";
  }

  if (carregando) {
    return <p>Carregando perfil...</p>;
  }

  if (!pessoa) {
    return <p className="form-error">{erro || "Pessoa não encontrada."}</p>;
  }

  return (
    <form className="perfil-form" onSubmit={salvar}>
      <section className="perfil-card">
        <p className="eyebrow">Identificação</p>
        <h2>Dados pessoais</h2>

        <div className="form-grid-two">
          <label>
            Nome completo
            <input name="nome" required defaultValue={pessoa.nome} />
          </label>

          <label>
            Nome preferido
            <input
              name="nomePreferido"
              defaultValue={pessoa.nomePreferido ?? ""}
            />
          </label>
        </div>

        <div className="form-grid-two">
          <label>
            Data de nascimento
            <input
              name="dataNascimento"
              type="date"
              defaultValue={dataParaInput(pessoa.dataNascimento)}
            />
          </label>

          <label>
            Telefone
            <input
              name="telefone"
              type="tel"
              defaultValue={pessoa.telefone ?? ""}
            />
          </label>
        </div>

        <div className="form-grid-two">
          <label>
            Modo de uso
            <select name="modoUso" defaultValue={pessoa.modoUso}>
              <option value="ASSISTIDO">Acompanhado por tutor</option>
              <option value="AUTONOMO">Uso autônomo</option>
            </select>
          </label>

          <label>
            Nível de acompanhamento
            <select
              name="nivelAcompanhamento"
              defaultValue={pessoa.nivelAcompanhamento}
            >
              <option value="PREVENTIVO">Preventivo</option>
              <option value="ASSISTIDO">Assistido</option>
              <option value="INTENSIVO">Intensivo</option>
            </select>
          </label>
        </div>
      </section>

      <section className="perfil-card">
        <p className="eyebrow">Personalização</p>
        <h2>Relacionamento com a CIDA</h2>

        <div className="form-grid-two">
          <label>
            Tratamento preferido
            <input
              name="tratamentoPreferido"
              placeholder="Ex.: Dona Tina"
              defaultValue={pessoa.perfil?.tratamentoPreferido ?? ""}
            />
          </label>

          <label>
            Estilo da CIDA
            <select
              name="estiloCida"
              defaultValue={pessoa.perfil?.estiloCida ?? ""}
            >
              <option value="">Selecione</option>
              <option value="CARINHOSA">Carinhosa e acolhedora</option>
              <option value="OBJETIVA">Objetiva e direta</option>
              <option value="DISCRETA">Discreta e respeitosa</option>
              <option value="ANIMADA">Animada e comunicativa</option>
            </select>
          </label>
        </div>

        <div className="form-grid-two">
          <label>
            Horário de acordar
            <input
              name="horarioAcordar"
              type="time"
              defaultValue={pessoa.perfil?.horarioAcordar ?? ""}
            />
          </label>

          <label>
            Horário de dormir
            <input
              name="horarioDormir"
              type="time"
              defaultValue={pessoa.perfil?.horarioDormir ?? ""}
            />
          </label>
        </div>
      </section>

      <section className="perfil-card">
        <p className="eyebrow">Acompanhamento</p>
        <h2>Rotina, preferências e limitações</h2>

        <label>
          Observações sobre a rotina
          <textarea
            name="observacoesRotina"
            rows={4}
            defaultValue={pessoa.perfil?.observacoesRotina ?? ""}
          />
        </label>

        <label>
          Preferências pessoais
          <textarea
            name="preferencias"
            rows={4}
            defaultValue={pessoa.perfil?.preferencias ?? ""}
          />
        </label>

        <label>
          Limitações e cuidados especiais
          <textarea
            name="limitacoes"
            rows={5}
            defaultValue={pessoa.perfil?.limitacoes ?? ""}
          />
        </label>
      </section>

      {erro && <p className="form-error">{erro}</p>}
      {sucesso && <p className="form-success">{sucesso}</p>}

      <div className="perfil-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => router.push("/painel/pessoas")}
        >
          Voltar
        </button>

        <button
          type="submit"
          className="primary-button"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>
    </form>
  );
}
