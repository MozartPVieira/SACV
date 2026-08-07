import Link from "next/link";
import PessoaPerfilClient from "./PessoaPerfilClient";
import TutoresClient from "./TutoresClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PessoaPerfilPage({
  params,
}: PageProps) {
  const { id } = await params;

  return (
    <section className="module-page">
      <div className="profile-page-heading">
        <div>
          <p className="eyebrow">SACV 0.4</p>
          <h1>Perfil da pessoa</h1>
          <p>
            Dados pessoais, rotina, preferências e rede de apoio utilizadas
            pela CIDA.
          </p>
        </div>

        <Link
          href={`/painel/saude?pessoaId=${id}`}
          className="primary-button profile-health-link"
        >
          Abrir Perfil clínico
        </Link>
      </div>

      <PessoaPerfilClient pessoaId={id} />
      <TutoresClient pessoaId={id} />
    </section>
  );
}
