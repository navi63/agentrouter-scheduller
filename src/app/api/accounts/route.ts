import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.routerAccount.findMany({
    where: {
      cookie: {
        userId: session.user.id,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      cookie: true,
    },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, name, cookieId } = body;

  if (!username || !name || !cookieId) {
    return NextResponse.json(
      { error: "Username, name, and cookieId are required" },
      { status: 400 }
    );
  }

  // Check if cookie exists and belongs to user
  const cookie = await prisma.cookie.findUnique({
    where: { id: cookieId },
  });

  if (!cookie) {
    return NextResponse.json(
      { error: "Cookie not found" },
      { status: 404 }
    );
  }

  if (cookie.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden: Cookie does not belong to you" },
      { status: 403 }
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
