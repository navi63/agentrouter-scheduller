import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: new Headers(),
  });

  return NextResponse.json(session);
}
