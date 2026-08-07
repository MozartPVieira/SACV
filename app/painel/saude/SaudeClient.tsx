"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type PessoaResumo = {
  id: string;
  nome: string;
  nomePreferido: string | null;
};

type PerfilSaude = {
  id?: string;
  convenio: string | null;
  planoSaude: string | null;
  numeroCarteirinha: string | null;
  alergias: string | null;
  condicoesClinicas: string | null;
  protesesImplantes: string | null;
  limitacoesFisicas: string | null;
  observacoesCognitivas: string | null;
  orientacoesMedicas: string | null;
  medicoReferencia: string | null;
  telefoneMedico: string | null;
  contatoEmergencia: string | null;
  telefoneEmergencia: string | null;
  observacoesGerais: string | null;
};

type DadosSaude = {
  pessoa: PessoaResumo;
  perfilSaude: PerfilSaude | null;
};

export default function SaudeClient({
  pessoaInicialId = "",
}: {
  pessoaInicialId?: string;
}) {
  const [pessoas, setPessoas] = useState<PessoaResumo[]>([]);
  const [pessoaId, setPessoaId] = useState("");
  const [dados, setDados] = useState<DadosSaude | null>(null);
  const [carregandoPessoas, setCarregandoPessoas] = useState(true);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);
  const [salvando, setSalvando] = useState(false);
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
          const pessoaExiste = lista.some(
            (pessoa) => pessoa.id === pessoaInicialId,
          );

          setPessoaId(
            pessoaExiste
              ? pessoaInicialId
              : lista[0].id,
          );
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
  }, [pessoaInicialId]);

  const carregarPerfil = useCallback(async () => {
    if (!pessoaId) {
      setDados(null);
      return;
    }

    setCarregandoPerfil(true);
    setErro("");
    setSucesso("");

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/saude`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível carregar o perfil de saúde.",
        );
      }

      setDados(data);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o perfil de saúde.",
      );
    } finally {
      setCarregandoPerfil(false);
    }
  }, [pessoaId]);

  useEffect(() => {
    void carregarPerfil();
  }, [carregarPerfil]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pessoaId) return;

    setSalvando(true);
    setErro("");
    setSucesso("");

    const formulario = event.currentTarget;
    const campos = new FormData(formulario);

    try {
      const response = await fetch(
        `/api/pessoas/${pessoaId}/saude`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            convenio: campos.get("convenio"),
            planoSaude: campos.get("planoSaude"),
            numeroCarteirinha: campos.get("numeroCarteirinha"),
            alergias: campos.get("alergias"),
            condicoesClinicas: campos.get("condicoesClinicas"),
            protesesImplantes: campos.get("protesesImplantes"),
            limitacoesFisicas: campos.get("limitacoesFisicas"),
            observacoesCognitivas: campos.get("observacoesCognitivas"),
            orientacoesMedicas: campos.get("orientacoesMedicas"),
            medicoReferencia: campos.get("medicoReferencia"),
            telefoneMedico: campos.get("telefoneMedico"),
            contatoEmergencia: campos.get("contatoEmergencia"),
            telefoneEmergencia: campos.get("telefoneEmergencia"),
            observacoesGerais: campos.get("observacoesGerais"),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível salvar o perfil de saúde.",
        );
      }

      setDados((atual) =>
        atual
          ? {
              ...atual,
              perfilSaude: data.perfilSaude,
            }
          : atual,
      );

      setSucesso("Perfil de saúde atualizado com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o perfil de saúde.",
      );
    } finally {
      setSalvando(false);
    }
  }

  const perfil = dados?.perfilSaude;

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
    <div className="saude-layout">
      <section className="perfil-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pessoa acompanhada</p>
            <h2>Perfil clínico</h2>
          </div>
        </div>

        <label>
          Selecione a pessoa
          <select
            value={pessoaId}
            onChange={(event) => setPessoaId(event.target.value)}
          >
            {pessoas.map((pessoa) => (
              <option value={pessoa.id} key={pessoa.id}>
                {pessoa.nomePreferido
                  ? `${pessoa.nomePreferido} — ${pessoa.nome}`
                  : pessoa.nome}
              </option>
            ))}
          </select>
        </label>
      </section>

      {carregandoPerfil ? (
        <p>Carregando perfil de saúde...</p>
      ) : (
        <form className="perfil-form" onSubmit={salvar}>
          <section className="perfil-card">
            <p className="eyebrow">Convênio</p>
            <h2>Plano e identificação</h2>

            <div className="form-grid-two">
              <label>
                Convênio
                <input
                  name="convenio"
                  defaultValue={perfil?.convenio ?? ""}
                  placeholder="Ex.: AMS"
                />
              </label>

              <label>
                Plano de saúde
                <input
                  name="planoSaude"
                  defaultValue={perfil?.planoSaude ?? ""}
                  placeholder="Ex.: Petros"
                />
              </label>
            </div>

            <label>
              Número da carteirinha
              <input
                name="numeroCarteirinha"
                defaultValue={perfil?.numeroCarteirinha ?? ""}
              />
            </label>
          </section>

          <section className="perfil-card">
            <p className="eyebrow">Condições clínicas</p>
            <h2>Alergias, diagnósticos e limitações</h2>

            <label>
              Alergias
              <textarea
                name="alergias"
                rows={3}
                defaultValue={perfil?.alergias ?? ""}
                placeholder="Ex.: Penicilina e diclofenaco"
              />
            </label>

            <label>
              Condições clínicas e diagnósticos
              <textarea
                name="condicoesClinicas"
                rows={4}
                defaultValue={perfil?.condicoesClinicas ?? ""}
              />
            </label>

            <label>
              Próteses e implantes
              <textarea
                name="protesesImplantes"
                rows={3}
                defaultValue={perfil?.protesesImplantes ?? ""}
                placeholder="Ex.: Prótese no joelho"
              />
            </label>

            <label>
              Limitações físicas
              <textarea
                name="limitacoesFisicas"
                rows={4}
                defaultValue={perfil?.limitacoesFisicas ?? ""}
              />
            </label>

            <label>
              Observações cognitivas
              <textarea
                name="observacoesCognitivas"
                rows={4}
                defaultValue={perfil?.observacoesCognitivas ?? ""}
              />
            </label>
          </section>

          <section className="perfil-card">
            <p className="eyebrow">Referências</p>
            <h2>Orientações e contatos</h2>

            <label>
              Orientações médicas
              <textarea
                name="orientacoesMedicas"
                rows={4}
                defaultValue={perfil?.orientacoesMedicas ?? ""}
              />
            </label>

            <div className="form-grid-two">
              <label>
                Médico de referência
                <input
                  name="medicoReferencia"
                  defaultValue={perfil?.medicoReferencia ?? ""}
                />
              </label>

              <label>
                Telefone do médico
                <input
                  name="telefoneMedico"
                  type="tel"
                  defaultValue={perfil?.telefoneMedico ?? ""}
                />
              </label>
            </div>

            <div className="form-grid-two">
              <label>
                Contato de emergência
                <input
                  name="contatoEmergencia"
                  defaultValue={perfil?.contatoEmergencia ?? ""}
                />
              </label>

              <label>
                Telefone de emergência
                <input
                  name="telefoneEmergencia"
                  type="tel"
                  defaultValue={perfil?.telefoneEmergencia ?? ""}
                />
              </label>
            </div>

            <label>
              Observações gerais
              <textarea
                name="observacoesGerais"
                rows={4}
                defaultValue={perfil?.observacoesGerais ?? ""}
              />
            </label>
          </section>

          {erro && <p className="form-error">{erro}</p>}
          {sucesso && <p className="form-success">{sucesso}</p>}

          <div className="perfil-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : "Salvar perfil de saúde"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
