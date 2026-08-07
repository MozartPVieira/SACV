-- CreateEnum
CREATE TYPE "ProvedorEmail" AS ENUM ('SMTP', 'RESEND', 'SENDGRID', 'AMAZON_SES', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusEnvioEmail" AS ENUM ('PENDENTE', 'ENVIANDO', 'ENVIADO', 'FALHOU', 'CANCELADO');

-- CreateTable
CREATE TABLE "ConfiguracaoEmail" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeRemetente" TEXT NOT NULL,
    "emailRemetente" TEXT NOT NULL,
    "emailResposta" TEXT,
    "provedor" "ProvedorEmail" NOT NULL DEFAULT 'SMTP',
    "hostSmtp" TEXT,
    "portaSmtp" INTEGER,
    "usarTls" BOOLEAN NOT NULL DEFAULT true,
    "usuarioSmtp" TEXT,
    "segredoReferencia" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvioEmail" (
    "id" TEXT NOT NULL,
    "configuracaoId" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "referenciaId" TEXT,
    "status" "StatusEnvioEmail" NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "provedorMensagemId" TEXT,
    "mensagemErro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoEm" TIMESTAMP(3),

    CONSTRAINT "EnvioEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConfiguracaoEmail_ativo_principal_idx" ON "ConfiguracaoEmail"("ativo", "principal");

-- CreateIndex
CREATE INDEX "EnvioEmail_destinatario_criadoEm_idx" ON "EnvioEmail"("destinatario", "criadoEm");

-- CreateIndex
CREATE INDEX "EnvioEmail_status_criadoEm_idx" ON "EnvioEmail"("status", "criadoEm");

-- CreateIndex
CREATE INDEX "EnvioEmail_referenciaId_idx" ON "EnvioEmail"("referenciaId");

-- AddForeignKey
ALTER TABLE "EnvioEmail" ADD CONSTRAINT "EnvioEmail_configuracaoId_fkey" FOREIGN KEY ("configuracaoId") REFERENCES "ConfiguracaoEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
