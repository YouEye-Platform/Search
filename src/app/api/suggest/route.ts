import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProvider } from "@/lib/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const session = await getSession("ye-search").catch(() => null);
    if (!session) return NextResponse.json([]);
    const suggestions = await getProvider().suggest(q, session.userId);
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
