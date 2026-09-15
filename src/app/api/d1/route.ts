
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

async function fetchPoolTest(url: string, signal: AbortSignal) {
  const res = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      ...(API_KEY && { "X-API-Key": API_KEY }),
    },
    cache: "no-store",
  });

  const raw = await res.text();
  const jsonStart = raw.indexOf("{");
  const cleaned =
    jsonStart === -1 ? raw : jsonStart === 0 ? raw : raw.substring(jsonStart);

  let data: any;
  try {
    data = JSON.parse(cleaned);
  } catch {
    data = null;
  }

  return { res, data, raw };
}

export async function GET(request: NextRequest) {
  const searchParams = readObfuscatedQuery(request.nextUrl.searchParams);
  const params = searchParams.toString();
  const url = `${API_BASE}/pool_test?${params}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  const t0 = Date.now();

  try {
    const { res, data, raw } = await fetchPoolTest(url, controller.signal);

    clearTimeout(timeoutId);
    console.log(`[WP API pool_test] ${Date.now() - t0}ms | ${params.substring(0, 80)}`);

    if (!res.ok) {
      if (res.status === 410) {
        try {
          const body = data ?? JSON.parse(raw);
          console.log("[WP API pool_test] 410 body:", body);
          return obf(body, { status: 410 });
        } catch {
          return obf({ success: false }, { status: 410 });
        }
      }
      console.log(`[WP API pool_test] non-OK status: ${res.status}`);
      if (data?.ts_debug || data?.message) {
        console.error(`[WP API pool_test] error message: ${data?.message}`, "ts_debug:", data?.ts_debug);
      }
      return obf({ success: false }, { status: res.status });
    }

    if (!data) {
      console.log("[WP API pool_test] JSON parse failed. Raw response:", raw.substring(0, 500));
      return obf({ success: false, error: "invalid_json" }, { status: 502 });
    }

    console.log("[WP API pool_test] summary:", {
      params: params.substring(0, 200),
      success: data?.success,
      total_products: data?.pagination?.total_products,
      pool_size: data?.pagination?.pool_size,
      products_returned: data?.products?.length ?? data?.data?.products?.length ?? 0,
      premium_products: data?.premium_products?.length ?? data?.data?.premium_products?.length ?? 0,
      exclusive_products: data?.exclusive_products?.length ?? data?.data?.exclusive_products?.length ?? 0,
    });

    return obf(data);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("[WP API pool_test] Error:", err);
    const status = err?.name === "AbortError" ? 504 : 500;
    console.log(`[WP API pool_test] fetch error (${status}):`, err?.message);
    return obf({ success: false }, { status });
  }
}
