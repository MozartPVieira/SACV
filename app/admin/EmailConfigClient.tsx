"use client";

import { FormEvent, useEffect, useState } from "react";

type Configuracao = {
  id: string;
  nome: string;
  nomeRemetente: string;
  emailRemetente: string;
  provedor: string;
  hostSmtp: string | null;
  portaSmtp: number | null;
  principal: boolean;
  ativo: boolean;
  segredoReferencia: string;
  _count: {
    envios: number;
  };
};

const inicial = {
  nome: "Remetente principal SACV",
  nomeRemetente: "SACV - MPV Informática",
  emailRemetente: "mozart@mpvinfo.com.br",
  emailResposta: "mozart@mpvinfo.com.br",
  provedor: "SMTP",
  hostSmtp: "",
  portaSmtp: "587",
  usarTls: true,
  usuarioSmtp: "mozart@mpvinfo.com.br",
  segredoReferencia: "SACV_SMTP_PASSWORD",
  principal: true,
  ativo: true,
};

export default function EmailConfigClient() {
  const [formulario, setFormulario] = useState(inicial);
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregar() {
    try {
      const response = await fetch("/api/admin/email", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao consultar remetentes.");
      }

      setConfiguracoes(data.configuracoes);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Falha ao consultar remetentes.",
      );
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const response = await fetch("/api/admin/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível salvar o remetente.",
        );
      }

      setSucesso("Configuração salva com sucesso.");
      await carregar();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o remetente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="admin-email-section">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">Comunicação</p>
          <h2>Remetentes de e-mail</h2>
          <p>Configuração usada para convites, alertas e relatórios.</p>
        </div>
        <span className="count-badge">{configuracoes.length}</span>
      </div>

      <form className="email-config-form" onSubmit={salvar}>
        <div className="form-grid-two">
          <label>
            Nome da configuração
            <input
              required
              value={formulario.nome}
              onChange={(event) =>
                setFormulario({ ...formulario, nome: event.target.value })
              }
            />
          </label>

          <label>
            Nome exibido ao destinatário
            <input
              required
              value={formulario.nomeRemetente}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  nomeRemetente: event.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="form-grid-two">
          <label>
            E-mail remetente
            <input
              required
              type="email"
              value={formulario.emailRemetente}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  emailRemetente: event.target.value,
                })
              }
            />
          </label>

          <label>
            Responder para
            <input
              type="email"
              value={formulario.emailResposta}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  emailResposta: event.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="form-grid-two">
          <label>
            Provedor
            <select
              value={formulario.provedor}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  provedor: event.target.value,
                })
              }
            >
              <option value="SMTP">Servidor SMTP</option>
              <option value="RESEND">Resend</option>
              <option value="SENDGRID">SendGrid</option>
              <option value="AMAZON_SES">Amazon SES</option>
              <option value="OUTRO">Outro</option>
            </select>
          </label>

          <label>
            Referência da senha ou chave
            <input
              required
              value={formulario.segredoReferencia}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  segredoReferencia: event.target.value,
                })
              }
            />
          </label>
        </div>

        {formulario.provedor === "SMTP" && (
          <>
            <div className="form-grid-two">
              <label>
                Servidor SMTP
                <input
                  required
                  value={formulario.hostSmtp}
                  placeholder="smtp.exemplo.com"
                  onChange={(event) =>
                    setFormulario({
                      ...formulario,
                      hostSmtp: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Porta SMTP
                <input
                  required
                  type="number"
                  min="1"
                  max="65535"
                  value={formulario.portaSmtp}
                  onChange={(event) =>
                    setFormulario({
                      ...formulario,
                      portaSmtp: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <label>
              Usuário SMTP
              <input
                value={formulario.usuarioSmtp}
                onChange={(event) =>
                  setFormulario({
                    ...formulario,
                    usuarioSmtp: event.target.value,
                  })
                }
              />
            </label>
          </>
        )}

        <div className="email-config-checks">
          <label>
            <input
              type="checkbox"
              checked={formulario.usarTls}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  usarTls: event.target.checked,
                })
              }
            />
            Usar conexão segura TLS
          </label>

          <label>
            <input
              type="checkbox"
              checked={formulario.principal}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  principal: event.target.checked,
                })
              }
            />
            Remetente principal
          </label>

          <label>
            <input
              type="checkbox"
              checked={formulario.ativo}
              onChange={(event) =>
                setFormulario({
                  ...formulario,
                  ativo: event.target.checked,
                })
              }
            />
            Configuração ativa
          </label>
        </div>

        {erro && <p className="form-error">{erro}</p>}
        {sucesso && <p className="form-success">{sucesso}</p>}

        <button className="primary-button" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar configuração"}
        </button>
      </form>

      <div className="email-config-list">
        {configuracoes.map((item) => (
          <article className="email-config-card" key={item.id}>
            <div>
              <strong>{item.nome}</strong>
              <span>
                {item.nomeRemetente} · {item.emailRemetente}
              </span>
              <small>
                {item.provedor}
                {item.hostSmtp
                  ? ` · ${item.hostSmtp}:${item.portaSmtp}`
                  : ""}
              </small>
            </div>

            <div className="email-config-status">
              {item.principal && <span>Principal</span>}
              <b>{item.ativo ? "Ativo" : "Inativo"}</b>
              <small>{item._count.envios} envios</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
