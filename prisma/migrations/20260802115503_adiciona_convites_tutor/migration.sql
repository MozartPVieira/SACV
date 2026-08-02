-- CreateEnum
CREATE TYPE "StatusConviteTutor" AS ENUM ('PENDENTE', 'ACEITO', 'RECUSADO', 'EXPIRADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "ConviteTutor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "convidadoPorContaId" TEXT NOT NULL,
    "convidadoNome" TEXT NOT NULL,
    "convidadoEmail" TEXT NOT NULL,
    "relacao" TEXT,
    "papel" "PapelConta" NOT NULL DEFAULT 'TUTOR',
    "podeEditar" BOOLEAN NOT NULL DEFAULT false,
    "recebeResumo" BOOLEAN NOT NULL DEFAULT true,
    "recebeAlertas" BOOLEAN NOT NULL DEFAULT true,
    "status" "StatusConviteTutor" NOT NULL DEFAULT 'PENDENTE',
    "token" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "aceitoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConviteTutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConviteTutor_token_key" ON "ConviteTutor"("token");

-- CreateIndex
CREATE INDEX "ConviteTutor_usuarioId_status_idx" ON "ConviteTutor"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "ConviteTutor_convidadoEmail_status_idx" ON "ConviteTutor"("convidadoEmail", "status");

-- AddForeignKey
ALTER TABLE "ConviteTutor" ADD CONSTRAINT "ConviteTutor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConviteTutor" ADD CONSTRAINT "ConviteTutor_convidadoPorContaId_fkey" FOREIGN KEY ("convidadoPorContaId") REFERENCES "Conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
