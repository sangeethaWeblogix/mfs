import { NextRequest, NextResponse } from "next/server";
import { encodeObfuscated, readObfuscatedQuery } from "@/lib/obfuscation";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.CFS_API_KEY;

// Body is obfuscated (see @/lib/obfuscation) so the raw JSON isn't readable
// straight off the DevTools Network "Preview"/"Response" tab.
function obf(data: unknown, init?: ResponseInit): NextResponse {
  return new NextResponse(encodeObfuscated(data), {
    ...init,
    headers: { ...init?.headers, "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  if (!API_BASE) {
    return obf({ error: "Missing API base" }, { status: 500 });
  }

  const searchParams = readObfuscatedQuery(req.nextUrl.searchParams);
  const keyword = searchParams.get("keyword");
  const url = keyword
    ? `${API_BASE}/home_search_new?keyword=${encodeURIComponent(keyword)}`
    : `${API_BASE}/home_search_new`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return obf(
        { error: `Upstream API failed: ${res.status}` },
        { status: res.status }
      );
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return obf(data);
    } catch {
      return obf({ error: "Invalid upstream response" }, { status: 502 });
    }
  } catch {
    return obf({ error: "Network error" }, { status: 502 });
  }
}
