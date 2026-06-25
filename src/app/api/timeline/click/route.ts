/**
 * Timeline Click Tracking
 *
 * POST — Records a "link clicked" timeline event when a user
 * clicks a search result. Called from the client before navigation.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { emitLinkClicked } from "@/lib/timeline/emit";

export async function POST(request: Request) {
  const session = await getSession("ye-search").catch(() => null);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, title, query } = await request.json();
  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  // Fire-and-forget — respond immediately
  emitLinkClicked(session.userId, url, title || "", query || "").catch(() => {});

  return NextResponse.json({ ok: true });
}
