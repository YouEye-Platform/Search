import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProvider } from "@/lib/search";
import { emitSearchQuery } from "@/lib/timeline/emit";

export async function GET(request: Request) {
  const session = await getSession("ye-search").catch(() => null);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const category = searchParams.get("category") || "general";

  if (!q.trim()) {
    return NextResponse.json({ error: "No query" }, { status: 400 });
  }

  try {
    const data = await getProvider().search(q, page, category, session.userId);

    // Emit timeline event for search queries (page 1 only to avoid pagination spam)
    if (page === 1) {
      const resultCount = (data.results?.length ?? 0);
      emitSearchQuery(session.userId, q, category, resultCount).catch(() => {});
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Search engine unreachable";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
