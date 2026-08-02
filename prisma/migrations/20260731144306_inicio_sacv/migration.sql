-- CreateEnum
CREATE TYPE "PapelConta" AS ENUM ('CONTRATANTE', 'USUARIO', 'TUTOR', 'FAMILIAR', 'CUIDADOR', 'ADMIN', 'COMERCIAL', 'SUPORTE');

-- CreateEnum
CREATE TYPE "ModoUso" AS ENUM ('AUTONOMO', 'ASSISTIDO');

-- CreateEnum
CREATE TYPE "NivelAcompanhamento" AS ENUM ('PREVENTIVO', 'ASSISTIDO', 'INTENSIVO');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'PENDENTE', 'EM_CARENCIA', 'SUSPENSA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "StatusLista" AS ENUM ('ABERTA', 'ENCERRADA', 'ENVIADA');

-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'NAO_REALIZADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Conta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaPapel" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "papel" "PapelConta" NOT NULL,

    CONSTRAINT "ContaPapel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contratante" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "documento" TEXT,

    CONSTRAINT "Contratante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioSACV" (
    "id" TEXT NOT NULL,
    "contaId" TEXT,
    "nome" TEXT NOT NULL,
    "nomePreferido" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "modoUso" "ModoUso" NOT NULL DEFAULT 'AUTONOMO',
    "nivelAcompanhamento" "NivelAcompanhamento" NOT NULL DEFAULT 'PREVENTIVO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioSACV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilUsuario" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tratamentoPreferido" TEXT,
    "estiloCida" TEXT,
    "horarioAcordar" TEXT,
    "horarioDormir" TEXT,
    "observacoesRotina" TEXT,
    "preferencias" TEXT,
    "limitacoes" TEXT,

    CONSTRAINT "PerfilUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "id" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VinculoTutorUsuario" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "podeEditar" BOOLEAN NOT NULL DEFAULT false,
    "recebeResumo" BOOLEAN NOT NULL DEFAULT true,
    "recebeAlertas" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VinculoTutorUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dose" TEXT,
    "instrucoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioMedicamento" (
    "id" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "diasSemana" TEXT,

    CONSTRAINT "HorarioMedicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfirmacaoMedicamento" (
    "id" TEXT NOT NULL,
    "horarioId" TEXT NOT NULL,
    "confirmado" BOOLEAN NOT NULL,
    "confirmadoEm" TIMESTAMP(3),
    "origem" TEXT,

    CONSTRAINT "ConfirmacaoMedicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3),
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "recorrencia" TEXT,
    "terminaEm" TIMESTAMP(3),
    "status" "StatusAgendamento" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lista" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "status" "StatusLista" NOT NULL DEFAULT 'ABERTA',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerradaEm" TIMESTAMP(3),

    CONSTRAINT "Lista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemLista" (
    "id" TEXT NOT NULL,
    "listaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" TEXT,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemLista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroSaude" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "valor" TEXT,
    "nota" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroSaude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valorMensal" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "contratanteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "planoId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "validade" TIMESTAMP(3) NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "referencia" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "modelo" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoDispositivo" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "dispositivoId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "devolvidoEm" TIMESTAMP(3),

    CONSTRAINT "ContratoDispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consentimento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "concedido" BOOLEAN NOT NULL,
    "concedidoEm" TIMESTAMP(3),
    "revogadoEm" TIMESTAMP(3),

    CONSTRAINT "Consentimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "contaId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "detalhes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conta_email_key" ON "Conta"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContaPapel_contaId_papel_key" ON "ContaPapel"("contaId", "papel");

-- CreateIndex
CREATE UNIQUE INDEX "Contratante_contaId_key" ON "Contratante"("contaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioSACV_contaId_key" ON "UsuarioSACV"("contaId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilUsuario_usuarioId_key" ON "PerfilUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_contaId_key" ON "Tutor"("contaId");

-- CreateIndex
CREATE UNIQUE INDEX "VinculoTutorUsuario_tutorId_usuarioId_key" ON "VinculoTutorUsuario"("tutorId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispositivo_serial_key" ON "Dispositivo"("serial");

-- AddForeignKey
ALTER TABLE "ContaPapel" ADD CONSTRAINT "ContaPapel_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contratante" ADD CONSTRAINT "Contratante_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioSACV" ADD CONSTRAINT "UsuarioSACV_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilUsuario" ADD CONSTRAINT "PerfilUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoTutorUsuario" ADD CONSTRAINT "VinculoTutorUsuario_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoTutorUsuario" ADD CONSTRAINT "VinculoTutorUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicamento" ADD CONSTRAINT "Medicamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioMedicamento" ADD CONSTRAINT "HorarioMedicamento_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfirmacaoMedicamento" ADD CONSTRAINT "ConfirmacaoMedicamento_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "HorarioMedicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lista" ADD CONSTRAINT "Lista_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemLista" ADD CONSTRAINT "ItemLista_listaId_fkey" FOREIGN KEY ("listaId") REFERENCES "Lista"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroSaude" ADD CONSTRAINT "RegistroSaude_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_contratanteId_fkey" FOREIGN KEY ("contratanteId") REFERENCES "Contratante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoDispositivo" ADD CONSTRAINT "ContratoDispositivo_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoDispositivo" ADD CONSTRAINT "ContratoDispositivo_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "Dispositivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consentimento" ADD CONSTRAINT "Consentimento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioSACV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAuditoria" ADD CONSTRAINT "LogAuditoria_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
