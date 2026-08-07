import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

async function sair(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}

export async function GET(request: Request) {
  return sair(request);
}

export async function POST(request: Request) {
  return sair(request);
}
