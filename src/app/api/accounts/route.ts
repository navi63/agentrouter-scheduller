import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const accounts = await prisma.routerAccount.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cookie: true,
    },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { username, name, cookieId } = body;

  if (!username || !name || !cookieId) {
    return NextResponse.json(
      { error: "Username, name, and cookieId are required" },
      { status: 400 }
    );
  }

  // Check if cookie exists
  const cookie = await prisma.cookie.findUnique({
    where: { id: cookieId },
  });

  if (!cookie) {
    return NextResponse.json(
      { error: "Cookie not found" },
      { status: 404 }
    );
  }

  // Check if account already exists for this cookie
  const existingAccount = await prisma.routerAccount.findUnique({
    where: { cookieId },
  });

  if (existingAccount) {
    return NextResponse.json(
      { error: "Account already exists for this cookie" },
      { status: 400 }
    );
  }

  const account = await prisma.routerAccount.create({
    data: { username, name, cookieId },
    include: { cookie: true },
  });

  return NextResponse.json(account, { status: 201 });
}
