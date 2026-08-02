import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/painel");

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">CIDA</div>
        <h1>Entrar no SACV</h1>
        <p>Acesse sua rotina, acompanhamento e rede de apoio.</p>
        <LoginForm />
        <p className="auth-foot">Primeiro acesso? <Link href="/cadastro">Criar conta</Link></p>
      </section>
    </main>
  );
}
