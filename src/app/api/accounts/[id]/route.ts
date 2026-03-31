import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = parseInt(idParam);
  const body = await req.json();
  const { username, name, cookieId } = body;

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // Check if account exists and belongs to user
  const existingAccount = await prisma.routerAccount.findFirst({
    where: {
      id: id,
      cookie: { userId: session.user.id },
    },
  });

  if (!existingAccount) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // If updating cookieId, check if cookie exists, belongs to user, and if another account already uses it
  if (cookieId !== undefined && cookieId !== existingAccount.cookieId) {
    const cookie = await prisma.cookie.findUnique({
      where: { id: cookieId },
    });

    if (!cookie) {
      return NextResponse.json({ error: "Cookie not found" }, { status: 404 });
    }

    if (cookie.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Cookie does not belong to you" },
        { status: 403 }
      );
    }

    const accountWithCookie = await prisma.routerAccount.findFirst({
      where: { cookieId },
    });

    if (accountWithCookie && accountWithCookie.id !== id) {
      return NextResponse.json(
        { error: "Another account already exists for this cookie" },
        { status: 400 }
      );
    }
  }

  const updateData: any = {};
  if (username !== undefined) updateData.username = username;
  if (name !== undefined) updateData.name = name;
  if (cookieId !== undefined) updateData.cookieId = cookieId;

  const account = await prisma.routerAccount.update({
    where: { id: id },
    data: updateData,
    include: { cookie: true },
  });

  return NextResponse.json(account);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = parseInt(idParam);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // Check if account exists and belongs to user
  const account = await prisma.routerAccount.findFirst({
    where: {
      id: id,
      cookie: { userId: session.user.id },
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await prisma.routerAccount.delete({
    where: { id: id },
  });

  return NextResponse.json({ success: true });
}
