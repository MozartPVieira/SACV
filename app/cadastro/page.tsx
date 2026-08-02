import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CadastroForm from "./CadastroForm";

export default async function CadastroPage() {
  const session = await getSession();
  if (session) redirect("/painel");

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <div className="brand-mark">SACV</div>
        <h1>Começar com a CIDA</h1>
        <p>Crie a conta do contratante ou comece no modo autônomo.</p>
        <CadastroForm />
        <p className="auth-foot">Já possui conta? <Link href="/login">Entrar</Link></p>
      </section>
    </main>
  );
}
