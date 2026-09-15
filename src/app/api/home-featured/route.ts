import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.CFS_API_KEY;

// Normalize each product so components always get image_format as string[]
// home_featured returns `thumbnail` (imagestack R2 URL); also handle `image` fallback
function normalizeProduct(p: any): any {
  if (!p.image_format) {
    const img = p.thumbnail ?? p.image ?? p.main_image ?? null;
    p.image_format = img ? [img] : [];
  } else if (typeof p.image_format === "string") {
    p.image_format = [p.image_format];
  }
  if (!p.seller_type) p.seller_type = "dealer";
  return p;
}

async function fetchType(
  type: string,
  seed: string | null,
  visitorIp: string
): Promise<{ products: any[] } | { error: string; status: number }> {
  const url = `${API_BASE}/home_featured?type=${encodeURIComponent(type)}${seed ? `&seed=${encodeURIComponent(seed)}` : ""}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  const t0 = Date.now();

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
        ...(visitorIp && { "X-Visitor-IP": visitorIp }),
      },
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    console.log(`[WP API] home_featured type=${type} ip=${visitorIp || "(none)"} — ${Date.now() - t0}ms`);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "(unreadable)");
      console.error(`[WP API] home_featured type=${type} non-OK status: ${res.status} body: ${errBody}`);
      return { error: errBody, status: res.status };
    }

    const raw = await res.text();
    const jsonStart = raw.indexOf('{');
    const json = JSON.parse(jsonStart > 0 ? raw.substring(jsonStart) : raw);

    // Response shape: { success, products: [...], meta: {...} }
    const rawProducts: any[] = json?.products ?? json?.data?.products ?? [];
    return { products: rawProducts.map(normalizeProduct) };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const status = err?.name === "AbortError" ? 504 : 500;
    console.error(`[WP API] home_featured type=${type} fetch error (${status}):`, err?.message);
    return { error: err?.message ?? "fetch failed", status };
  }
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "all";
  const seed = request.nextUrl.searchParams.get("seed");

  const visitorIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "";

  // "combined" lets the homepage fetch all/new/used in a single browser-visible
  // request instead of 3 — we still hit the backend 3 times, just from the server.
  if (type === "combined") {
    const [all, newer, used] = await Promise.all([
      fetchType("all", seed, visitorIp),
      fetchType("new", seed, visitorIp),
      fetchType("used", seed, visitorIp),
    ]);

    const firstError = [all, newer, used].find((r) => "error" in r) as { error: string; status: number } | undefined;
    if (firstError && [all, newer, used].every((r) => "error" in r)) {
      return NextResponse.json(
        { success: false, _wp_error: firstError.error },
        {
          status: firstError.status,
          headers: { "X-Debug-Visitor-IP": visitorIp || "(none)", "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        products: {
          all: "products" in all ? all.products : [],
          new: "products" in newer ? newer.products : [],
          used: "products" in used ? used.products : [],
        },
      },
      { headers: { "X-Debug-Visitor-IP": visitorIp || "(none)", "Cache-Control": "no-store" } }
    );
  }

  const result = await fetchType(type, seed, visitorIp);

  if ("error" in result) {
    return NextResponse.json(
      { success: false, _wp_error: result.error },
      {
        status: result.status,
        headers: { "X-Debug-Visitor-IP": visitorIp || "(none)", "Cache-Control": "no-store" },
      }
    );
  }

  return NextResponse.json(
    { success: true, products: result.products },
    { headers: { "X-Debug-Visitor-IP": visitorIp || "(none)", "Cache-Control": "no-store" } }
  );
}
