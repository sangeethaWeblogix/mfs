import { NextResponse } from "next/server";
import { readObfuscatedBody } from "@/lib/obfuscation";
const API_KEY = process.env.MFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;

export async function POST(req: Request) {
  try {
    const { slug } = await readObfuscatedBody<{ slug?: string }>(req);
    if (!slug) return NextResponse.json({ success: false });

    const headers = {
      ...(API_KEY && { "X-Secret-Key": API_KEY }),
    };

    // Cache-buster: the upstream nginx proxy caches these GET endpoints by
    // URL, which have side effects (increment click/impression counters) —
    // without this, every repeat view of the same product replays the
    // first-ever cached response and never re-records the hit.
    const bust = Date.now();
    await Promise.all([
      fetch(`${API_BASE}/click?slug=${encodeURIComponent(slug)}&_=${bust}`, { headers }),
      fetch(`${API_BASE}/impression?slug=${encodeURIComponent(slug)}&_=${bust + 1}`, { headers }),
    ]);

    return NextResponse.json({ success: true });
  } catch (_e) {
    return NextResponse.json({ error: true });
  }
}
