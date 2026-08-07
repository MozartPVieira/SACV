import RotinaClient from "./RotinaClient";

export default function RotinaPage() {
  return (
    <section className="module-page">
      <p className="eyebrow">SACV 0.4</p>
      <h1>Rotina</h1>
      <p>
        Medicamentos, horários, atividades e organização diária da pessoa
        acompanhada.
      </p>

      <RotinaClient />
    </section>
  );
}
