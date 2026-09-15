import { NextRequest, NextResponse } from "next/server";
import { encodeObfuscated, readObfuscatedQuery } from "@/lib/obfuscation";

const API_KEY = process.env.CFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE || "https://admin.motorhomesforsale.com.au/wp-json/mfs/v1";

// Body is obfuscated (see @/lib/obfuscation) so the raw JSON isn't readable
// straight off the DevTools Network "Preview"/"Response" tab.
function obf(data: unknown, init?: ResponseInit): NextResponse {
  return new NextResponse(encodeObfuscated(data), {
    ...init,
    headers: { ...init?.headers, "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = readObfuscatedQuery(request.nextUrl.searchParams);
  const url = `${API_BASE}/product_exists_check?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(
        `[product-exists-check] WP API returned HTTP ${response.status} for "${searchParams.toString()}".`
      );
      return obf({ count: 0, exists: false }, { status: response.status });
    }
    const raw = await response.text();
    const idx = raw.indexOf("{");
    try {
      const data = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
      return obf(data);
    } catch {
      console.error("[product-exists-check] WP API returned unparseable body.");
      return obf({ count: 0, exists: false });
    }
  } catch (err) {
    console.error("[product-exists-check] WP API request failed:", err);
    return obf({ count: 0, exists: false }, { status: 502 });
  }
}
