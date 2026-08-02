# SACV 0.3 — Autenticação e Perfis

Base funcional do SACV com PostgreSQL/Neon + Prisma 7, cadastro real, login, sessão segura por cookie HTTP-only, papéis de acesso e painel administrativo protegido.

## Atualização de uma instalação 0.2

1. Preserve o seu `.env` real e a pasta `prisma/migrations` já criada.
2. Copie os arquivos desta versão por cima do projeto 0.2.
3. Execute `npm install`.
4. Execute `npx prisma generate`.
5. Execute `npx prisma validate` e `npx prisma migrate status`.
6. Configure `AUTH_SECRET` no `.env` com um valor forte.
7. Execute `npm run dev`.

## Administrador inicial

Opcionalmente defina `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` e rode:

`npm run admin:create`

Depois remova `ADMIN_PASSWORD` do `.env` quando não for mais necessário.
