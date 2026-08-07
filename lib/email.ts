import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { StatusEnvioEmail } from "@/lib/generated/prisma/client";

type EnviarEmailEntrada = {
  destinatario: string;
  assunto: string;
  texto?: string;
  html?: string;
  tipo: string;
  referenciaId?: string | null;
};

export async function enviarEmail({
  destinatario,
  assunto,
  texto,
  html,
  tipo,
  referenciaId,
}: EnviarEmailEntrada) {
  const configuracao = await prisma.configuracaoEmail.findFirst({
    where: {
      ativo: true,
      principal: true,
    },
    orderBy: {
      atualizadoEm: "desc",
    },
  });

  if (!configuracao) {
    throw new Error("Nenhuma configuração principal de e-mail está ativa.");
  }

  if (
    configuracao.provedor !== "SMTP" ||
    !configuracao.hostSmtp ||
    !configuracao.portaSmtp ||
    !configuracao.usuarioSmtp
  ) {
    throw new Error("A configuração SMTP está incompleta.");
  }

  const senha = process.env[configuracao.segredoReferencia];

  if (!senha) {
    throw new Error(
      `O segredo ${configuracao.segredoReferencia} não está configurado.`,
    );
  }

  const registro = await prisma.envioEmail.create({
    data: {
      configuracaoId: configuracao.id,
      destinatario,
      assunto,
      tipo,
      referenciaId: referenciaId ?? null,
      status: StatusEnvioEmail.PENDENTE,
    },
  });

  try {
    await prisma.envioEmail.update({
      where: { id: registro.id },
      data: {
        status: StatusEnvioEmail.ENVIANDO,
        tentativas: {
          increment: 1,
        },
      },
    });

    const transportador = nodemailer.createTransport({
      host: configuracao.hostSmtp,
      port: configuracao.portaSmtp,
      secure: configuracao.portaSmtp === 465,
      requireTLS:
        configuracao.usarTls && configuracao.portaSmtp !== 465,
      auth: {
        user: configuracao.usuarioSmtp,
        pass: senha,
      },
      tls: {
        minVersion: "TLSv1.2",
      },
    });

    const resultado = await transportador.sendMail({
      from: {
        name: configuracao.nomeRemetente,
        address: configuracao.emailRemetente,
      },
      replyTo: configuracao.emailResposta ?? undefined,
      to: destinatario,
      subject: assunto,
      text: texto,
      html,
    });

    await prisma.envioEmail.update({
      where: { id: registro.id },
      data: {
        status: StatusEnvioEmail.ENVIADO,
        provedorMensagemId: resultado.messageId,
        mensagemErro: null,
        enviadoEm: new Date(),
      },
    });

    return {
      envioId: registro.id,
      mensagemId: resultado.messageId,
    };
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Falha desconhecida no envio.";

    await prisma.envioEmail.update({
      where: { id: registro.id },
      data: {
        status: StatusEnvioEmail.FALHOU,
        mensagemErro: mensagem.slice(0, 1000),
      },
    });

    throw new Error(`Não foi possível enviar o e-mail: ${mensagem}`);
  }
}
