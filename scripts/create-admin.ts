import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PapelConta } from "../lib/generated/prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const senha = process.env.ADMIN_PASSWORD;
const nome = process.env.ADMIN_NAME?.trim() || "Administrador SACV";
const connectionString = process.env.DATABASE_URL;

if (!email || !senha || senha.length < 10 || !connectionString) {
  console.error("Defina ADMIN_EMAIL, ADMIN_PASSWORD (10+ caracteres) e DATABASE_URL no .env.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const senhaHash = await bcrypt.hash(senha, 12);

const conta = await prisma.conta.upsert({
  where: { email },
  update: { nome, senhaHash, ativo: true },
  create: { nome, email, senhaHash },
});
await prisma.contaPapel.upsert({
  where: { contaId_papel: { contaId: conta.id, papel: PapelConta.ADMIN } },
  update: {},
  create: { contaId: conta.id, papel: PapelConta.ADMIN },
});
console.log(`Administrador criado/atualizado: ${email}`);
await prisma.$disconnect();
