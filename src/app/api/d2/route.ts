import { NextRequest, NextResponse } from "next/server";
import { readObfuscatedQuery, encodeObfuscated } from "@/lib/obfuscation";
import { normalizeCountItems } from "@/lib/paramsCountKv";

/**
 * Live combined params-count proxy for StateFilterBar's client-side make/
 * state/vehicle_make/region breakdowns. The upstream WordPress endpoint
 * (params-count, hyphenated) only accepts a single `group_by` value per call
 * — a comma-separated or array-style value 400s with "Invalid group_by
 * value" — so this route fans a client request like
 * `group_by=make,condition,state` out into one upstream call per recognized
 * dimension and merges the results back into the { data: { make: [...],
 * state: [...] } } shape the frontend already expects. Unrecognized
 * dimensions (e.g. "condition", which is a filter here, not a grouping) are
 * silently dropped instead of forwarded.
 */

const MPN_API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const MPN_API_KEY = process.env.MFS_API_KEY;

const VALID_GROUP_BYS = new Set(["make", "state", "vehicle_make", "region", "model"]);

async function fetchGroupBy(groupBy: string, filterParams: URLSearchParams): Promise<any[]> {
  const params = new URLSearchParams(filterParams);
  params.set("group_by", groupBy);

  try {
    const res = await fetch(`${MPN_API_BASE}/params-count?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        ...(MPN_API_KEY && { "X-Secret-Key": MPN_API_KEY }),
      },
    });
    if (!res.ok) return [];

    const raw = await res.text();
    const idx = raw.indexOf('{"');
    const json = JSON.parse(idx > 0 ? raw.slice(idx) : raw);
    return normalizeCountItems(json?.data ?? []);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = readObfuscatedQuery(request.nextUrl.searchParams);
  const groupBys = (searchParams.get("group_by") ?? "")
    .split(",")
    .map((g) => g.trim())
    .filter((g) => VALID_GROUP_BYS.has(g));

  const filterParams = new URLSearchParams(searchParams);
  filterParams.delete("group_by");

  const results = await Promise.all(groupBys.map((g) => fetchGroupBy(g, filterParams)));
  const data: Record<string, any[]> = {};
  groupBys.forEach((g, i) => { data[g] = results[i]; });

  return new NextResponse(encodeObfuscated({ data }), {
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
  });
}
