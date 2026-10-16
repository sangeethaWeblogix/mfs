import { NextRequest, NextResponse } from "next/server";

export const preferredRegion = "syd1";

// Middleware runs on Vercel's Edge Runtime, which executes at whichever edge
// location is nearest the incoming request and can't be pinned to a region
// the way a serverless function can. The backend host blocks/challenges
// requests from un-whitelisted regions (see the other pinned /api/* routes),
// so the product-existence check middleware needs for /product/[slug]/ 410s
// is proxied through this syd1-pinned route instead of hitting it directly
// from inside middleware itself.
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE || "https://admin.marketplacenetwork.com.au/wp-json/mpn/v1/motorhomes";
const API_KEY = process.env.MFS_API_KEY;

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ exists: null }, { status: 400 });

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      cache: "no-store",
    });

    const raw = await res.text();

    // A bot-challenge (SiteGround/Cloudflare) returns an HTML page, never
    // parseable JSON — that's "inconclusive", not "confirmed gone".
    if (raw.includes("sgcaptcha") || raw.includes("cf-chl") || raw.trimStart().startsWith("<html")) {
      console.error(`[product-slug-check] BOT CHALLENGE blocked request | slug="${slug}"`);
      return NextResponse.json({ exists: null }, { status: 503 });
    }

    const idx = raw.indexOf('{"');
    let data: any;
    try {
      data = JSON.parse(idx >= 0 ? raw.substring(idx) : raw);
    } catch {
      // Unparseable body that isn't a recognized bot-challenge either —
      // inconclusive, don't guess.
      return NextResponse.json({ exists: null }, { status: 502 });
    }

    // The backend answers a missing slug with its own structured WP error
    // body (confusingly under HTTP 500, not 404) rather than an empty
    // response — a real, valid JSON shape, so it's trustworthy either way.
    const isWpError = typeof data?.code === "string" && data?.data?.status != null;
    const exists = !isWpError && !!data && Object.keys(data).length > 0;
    return NextResponse.json({ exists });
  } catch (err) {
    console.error(`[product-slug-check] fetch failed | slug="${slug}" | error="${(err as Error).message}"`);
    return NextResponse.json({ exists: null }, { status: 502 });
  }
}
