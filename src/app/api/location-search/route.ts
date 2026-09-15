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
  const searchParams = readObfuscatedQuery(req.nextUrl.searchParams);
  const keyword = searchParams.get("keyword") ?? "";

  if (!API_BASE) {
    return obf({ message: "API base not configured" }, { status: 500 });
  }

  const res = await fetch(
    `${API_BASE}/location-search?keyword=${encodeURIComponent(keyword)}`,
    {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
      next: { revalidate: 86400 }, // location data is static — cache for 24h
    }
  );

  const raw = await res.text();
  let json: object;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    json = { message: raw || "Invalid JSON from server" };
  }

  const response = obf(json, { status: res.status });
  response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  return response;
}
