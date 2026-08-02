import PessoasClient from "./PessoasClient";

export default function PessoasPage() {
  return (
    <section className="module-page">
      <p className="eyebrow">SACV 0.4</p>
      <h1>Pessoas</h1>
      <p>
        Cadastro dos assistidos, tutores e integrantes da rede de apoio.
      </p>

      <PessoasClient />
    </section>
  );
}
