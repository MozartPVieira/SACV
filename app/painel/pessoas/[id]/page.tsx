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
      <p className="eyebrow">SACV 0.4</p>
      <h1>Perfil da pessoa</h1>
      <p>Dados pessoais, rotina e preferências utilizadas pela CIDA.</p>

      <PessoaPerfilClient pessoaId={id} />
      <TutoresClient pessoaId={id} />
    </section>
  );
}
