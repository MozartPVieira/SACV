import Link from "next/link";
import SaudeClient from "./SaudeClient";

type PageProps = {
  searchParams: Promise<{
    pessoaId?: string;
  }>;
};

export default async function SaudePage({
  searchParams,
}: PageProps) {
  const { pessoaId } = await searchParams;

  return (
    <section className="module-page">
      <div className="saude-page-heading">
        <div>
          <p className="eyebrow">SACV 0.4</p>
          <h1>Perfil clínico</h1>
          <p>
            Informações clínicas, medicamentos, alergias, condições, limitações e contatos de
            referência.
          </p>
        </div>

        <div className="saude-heading-actions">
          {pessoaId && (
            <Link
              href={`/painel/pessoas/${pessoaId}`}
              className="saude-back-link"
            >
              ← Voltar ao perfil
            </Link>
          )}

          <Link
            href="/painel/pessoas"
            className="saude-people-link"
          >
            Ver pessoas
          </Link>
        </div>
      </div>

      <SaudeClient pessoaInicialId={pessoaId ?? ""} />
    </section>
  );
}
