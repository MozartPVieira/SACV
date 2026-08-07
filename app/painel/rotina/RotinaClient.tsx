"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type PessoaResumo = {
  id: string;
  nome: string;
  nomePreferido: string | null;
};

type HorarioMedicamento = {
  id: string;
  horario: string;
  diasSemana: string | null;
};

type Medicamento = {
  id: string;
  nome: string;
  dose: string | null;
  instrucoes: string | null;
  ativo: boolean;
  horarios: HorarioMedicamento[];
};

type DadosMedicamentos = {
  pessoa: PessoaResumo;
  medicamentos: Medicamento[];
};

const dias = [
  ["DOM", "Dom"],
  ["SEG", "Seg"],
  ["TER", "Ter"],
  ["QUA", "Qua"],
  ["QUI", "Qui"],
  ["SEX", "Sex"],
  ["SAB", "Sáb"],
];

export default function RotinaClient() {
  const [pessoas, setPessoas] = useState<PessoaResumo[]>([]);
  const [pessoaId, setPessoaId] = useState("");
  const [dados, setDados] = useState<DadosMedicamentos | null>(null);
  const [carregandoPessoas, setCarregandoPessoas] = useState(true);
  const [carregandoMedicamentos, setCarregandoMedicamentos] =
    useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarPessoas() {
      try {
        const response = await fetch("/api/pessoas", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Não foi possível carregar as pessoas.",
          );
        }

        const lista = data as PessoaResumo[];
        setPessoas(lista);

        if (lista.length > 0) {
          setPessoaId(lista[0].id);
        }
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as pessoas.",
        );
      } finally {
        setCarregandoPessoas(false);
      }
    }

    void carregarPessoas();
  }, []);

  const carregarMedicamentos = useCallback(async () => {
    if (!pessoaId) {
      setDados(null);
      return;
    }

    setCarregandoMedicamentos(true);
    setErro("");
    setSucesso("");

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/medicamentos`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível carregar os medicamentos.",
        );
      }

      setDados(data);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os medicamentos.",
      );
    } finally {
      setCarregandoMedicamentos(false);
    }
  }, [pessoaId]);

  useEffect(() => {
    void carregarMedicamentos();
  }, [carregarMedicamentos]);

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pessoaId) return;

    setSalvando(true);
    setErro("");
    setSucesso("");

    const formulario = event.currentTarget;
    const campos = new FormData(formulario);

    const diasSelecionados = dias
      .map(([codigo]) => codigo)
      .filter((codigo) => campos.get(`dia-${codigo}`) === "on");

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/medicamentos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: campos.get("nome"),
            dose: campos.get("dose"),
            instrucoes: campos.get("instrucoes"),
            horarios: [
              {
                horario: campos.get("horario"),
                diasSemana: diasSelecionados,
              },
            ],
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível cadastrar o medicamento.",
        );
      }

      formulario.reset();
      setMostrarFormulario(false);
      setSucesso("Medicamento cadastrado com sucesso.");
      await carregarMedicamentos();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o medicamento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function formatarDias(valor: string | null) {
    if (!valor) return "Todos os dias";

    const nomes = Object.fromEntries(dias);

    return valor
      .split(",")
      .map((dia) => nomes[dia] ?? dia)
      .join(", ");
  }

  if (carregandoPessoas) {
    return <p>Carregando pessoas...</p>;
  }

  if (pessoas.length === 0) {
    return (
      <div className="empty-state">
        <strong>Nenhuma pessoa cadastrada</strong>
        <span>Cadastre primeiro uma pessoa no módulo Pessoas.</span>
      </div>
    );
  }

  return (
    <div className="rotina-layout">
      <section className="perfil-card">
        <div className="team-heading-actions">
          <div>
            <p className="eyebrow">Pessoa acompanhada</p>
            <h2>Medicamentos e horários</h2>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setMostrarFormulario((valorAtual) => !valorAtual)
            }
          >
            {mostrarFormulario
              ? "Fechar cadastro"
              : "Adicionar medicamento"}
          </button>
        </div>

        <label>
          Selecione a pessoa
          <select
            value={pessoaId}
            onChange={(event) => setPessoaId(event.target.value)}
          >
            {pessoas.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nomePreferido
                  ? `${pessoa.nomePreferido} — ${pessoa.nome}`
                  : pessoa.nome}
              </option>
            ))}
          </select>
        </label>
      </section>

      {mostrarFormulario && (
        <form className="perfil-card medicamento-form" onSubmit={cadastrar}>
          <p className="eyebrow">Novo medicamento</p>
          <h2>Dados da medicação</h2>

          <div className="form-grid-two">
            <label>
              Medicamento
              <input
                name="nome"
                required
                minLength={2}
                placeholder="Ex.: Alois"
              />
            </label>

            <label>
              Dose
              <input
                name="dose"
                placeholder="Ex.: 10 mg ou 1 comprimido"
              />
            </label>
          </div>

          <div className="form-grid-two">
            <label>
              Horário
              <input name="horario" type="time" required />
            </label>

            <label>
              Instruções
              <input
                name="instrucoes"
                placeholder="Ex.: Após o café da manhã"
              />
            </label>
          </div>

          <fieldset className="dias-fieldset">
            <legend>Dias da semana</legend>

            <div className="dias-grid">
              {dias.map(([codigo, nome]) => (
                <label className="dia-option" key={codigo}>
                  <input
                    name={`dia-${codigo}`}
                    type="checkbox"
                    defaultChecked
                  />
                  {nome}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="primary-button"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Cadastrar medicamento"}
          </button>
        </form>
      )}

      {erro && <p className="form-error">{erro}</p>}
      {sucesso && <p className="form-success">{sucesso}</p>}

      <section className="perfil-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Plano atual</p>
            <h2>Medicamentos cadastrados</h2>
          </div>

          <span className="count-badge">
            {dados?.medicamentos.length ?? 0}
          </span>
        </div>

        {carregandoMedicamentos ? (
          <p>Carregando medicamentos...</p>
        ) : !dados || dados.medicamentos.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum medicamento cadastrado</strong>
            <span>
              Use “Adicionar medicamento” para criar o primeiro item.
            </span>
          </div>
        ) : (
          <div className="medicamentos-list">
            {dados.medicamentos.map((medicamento) => (
              <article
                className={
                  medicamento.ativo
                    ? "medicamento-card"
                    : "medicamento-card inativo"
                }
                key={medicamento.id}
              >
                <div className="medicamento-icon" aria-hidden="true">
                  ✚
                </div>

                <div className="medicamento-info">
                  <strong>{medicamento.nome}</strong>
                  <span>
                    {medicamento.dose ?? "Dose não informada"}
                  </span>

                  {medicamento.instrucoes && (
                    <span>{medicamento.instrucoes}</span>
                  )}

                  <div className="horarios-list">
                    {medicamento.horarios.map((horario) => (
                      <div className="horario-chip" key={horario.id}>
                        <strong>{horario.horario}</strong>
                        <small>
                          {formatarDias(horario.diasSemana)}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <span
                  className={
                    medicamento.ativo
                      ? "medicamento-status ativo"
                      : "medicamento-status"
                  }
                >
                  {medicamento.ativo ? "Ativo" : "Inativo"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}