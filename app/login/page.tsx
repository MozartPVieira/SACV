import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

type PageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const returnTo =
    params.returnTo?.startsWith("/") &&
    !params.returnTo.startsWith("//")
      ? params.returnTo
      : "/painel";

  const session = await getSession();

  if (session) {
    redirect(returnTo);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">CIDA</div>
        <h1>Entrar no SACV</h1>
        <p>Acesse sua rotina, acompanhamento e rede de apoio.</p>

        <LoginForm returnTo={returnTo} />

        <p className="auth-foot">
          Primeiro acesso? <Link href="/cadastro">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}
