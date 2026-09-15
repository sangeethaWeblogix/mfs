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

async function fetchFromWP(searchParams: URLSearchParams): Promise<NextResponse> {
  const url = `${API_BASE}/params_count?${searchParams.toString()}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
    });
    if (!response.ok) {
      console.error(
        `[params-count] WP API returned HTTP ${response.status} for ` +
          `"${searchParams.toString()}". Check CFS_API_KEY.`
      );
      return obf({}, { status: response.status });
    }
    const raw = await response.text();
    const idx = raw.indexOf('{"');
    try {
      const data = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
      return obf(data, { headers: { "X-Params-Cache": "MISS" } });
    } catch {
      console.error("[params-count] WP API returned unparseable body.");
      return obf({});
    }
  } catch (err) {
    console.error("[params-count] WP API request failed:", err);
    return obf({}, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = readObfuscatedQuery(request.nextUrl.searchParams);
  return fetchFromWP(searchParams);
}
