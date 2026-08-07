-- CreateEnum
CREATE TYPE "TipoMembroRedeApoio" AS ENUM ('FAMILIAR', 'CUIDADOR', 'PROFISSIONAL_SAUDE', 'VIZINHO', 'AMIGO', 'OUTRO');

-- CreateTable
CREATE TABLE "MembroRedeApoio" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "relacao" TEXT,
    "tipo" "TipoMembroRedeApoio" NOT NULL DEFAULT 'FAMILIAR',
    "telefone" TEXT,
    "email" TEXT,
    "observacoes" TEXT,
    "podeEditar" BOOLEAN NOT NULL DEFAULT false,
    "recebeResumo" BOOLEAN NOT NULL DEFAULT true,
    "recebeAlertas" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembroRedeApoio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembroRedeApoio_usuarioId_ativo_idx" ON "MembroRedeApoio"("usuarioId", "ativo");

-- AddForeignKey
ALTER TABLE "MembroRedeApoio" ADD CONSTRAINT "MembroRedeApoio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
