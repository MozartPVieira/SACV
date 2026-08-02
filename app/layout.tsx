import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SACV 0.1 | Preview",
  description: "Preview navegável do Sistema de Acompanhamento e Cuidador Virtual"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
