-- CreateTable
CREATE TABLE "PerfilSaude" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "convenio" TEXT,
    "planoSaude" TEXT,
    "numeroCarteirinha" TEXT,
    "alergias" TEXT,
    "condicoesClinicas" TEXT,
    "protesesImplantes" TEXT,
    "limitacoesFisicas" TEXT,
    "observacoesCognitivas" TEXT,
    "orientacoesMedicas" TEXT,
    "medicoReferencia" TEXT,
    "telefoneMedico" TEXT,
    "contatoEmergencia" TEXT,
    "telefoneEmergencia" TEXT,
    "observacoesGerais" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilSaude_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PerfilSaude_usuarioId_key" ON "PerfilSaude"("usuarioId");

-- AddForeignKey
ALTER TABLE "PerfilSaude" ADD CONSTRAINT "PerfilSaude_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
