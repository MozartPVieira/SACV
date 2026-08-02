import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { PapelConta } from "./generated/prisma/client";

const COOKIE_NAME = "sacv_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SacvSession = {
  contaId: string;
  nome: string;
  email: string;
  papeis: PapelConta[];
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value === "troque-por-um-segredo-forte") {
    throw new Error("AUTH_SECRET precisa ser configurado com um valor forte.");
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(session: SacvSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SacvSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      contaId: String(payload.contaId),
      nome: String(payload.nome),
      email: String(payload.email),
      papeis: (payload.papeis ?? []) as PapelConta[],
    };
  } catch {
    return null;
  }
}

export function hasRole(session: SacvSession, ...roles: PapelConta[]) {
  return roles.some((role) => session.papeis.includes(role));
}
