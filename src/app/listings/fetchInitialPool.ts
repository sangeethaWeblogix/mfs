/**
 * Server-side fetch of initial pool data for SSR/ISR.
 *
 * Priority:
 *  1. WordPress pool_test directly (when seed > 0) — bypasses Cloudflare's pool cache
 *     which strips `seed` from its cache key, returning the same pool for all seeds.
 *  2. /api/d1/ — live fetch through Cloudflare → WP (seed=0 fallback)
 *
 * The parsed result is passed as `initialPool` to StateHome so the SSR HTML
 * contains real product listings from the first byte.
 */

import { Listing, SeoV2, buildFeaturedOrder } from "./listingShared";
import type { InitialPool } from "./home";
import type { FilterState } from "./StateFilterBar";
import { seededShuffle } from "./seededShuffle";
import { parseObfuscatedResponse } from "@/lib/obfuscation";

const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || "https://www.motorhomesforsale.com.au";
// Direct WP API — used when seed > 0 to bypass Cloudflare's pool cache (which strips seed).
const WP_API_BASE     = process.env.NEXT_PUBLIC_MFS_API_BASE;
const WP_API_KEY      = process.env.CFS_API_KEY;

/** Build the /api/d1/ query string from the full FilterState. */
function buildApiParams(filters: FilterState, seed: number, perPage = 24): URLSearchParams {
  const params = new URLSearchParams({ orderby: "default", per_page: String(perPage), page: "1", seed: String(seed || 1) });
  if (filters.state)              params.set("state",             String(filters.state));
  if (filters.region)             params.set("region",            String(filters.region));
  if (filters.category)           params.set("category",          String(filters.category));
  if (filters.condition)          params.set("condition",         String(filters.condition));
  if (filters.make)               params.set("make",              String(filters.make));
  if (filters.model)              params.set("model",             String(filters.model));
  if (filters.suburb)             params.set("suburb",            String(filters.suburb));
  if (filters.pincode)            params.set("pincode",           String(filters.pincode));
  if (filters.from_price)         params.set("from_price",        String(filters.from_price));
  if (filters.to_price)           params.set("to_price",          String(filters.to_price));
  if (filters.minKg)              params.set("from_gvm",          String(filters.minKg));
  if (filters.maxKg)              params.set("to_gvm",            String(filters.maxKg));
  if (filters.from_sleep)         params.set("from_sleep",        String(filters.from_sleep));
  if (filters.to_sleep)           params.set("to_sleep",          String(filters.to_sleep));
  if (filters.from_length)        params.set("from_length",       String(filters.from_length));
  if (filters.to_length)          params.set("to_length",         String(filters.to_length));
  if (filters.acustom_fromyears)  params.set("acustom_fromyears", String(filters.acustom_fromyears));
  if (filters.acustom_toyears)    params.set("acustom_toyears",   String(filters.acustom_toyears));
  if (filters.keyword) {
    const kw = String(filters.keyword).replace(/\+/g, " ").trim().replace(/\s+/g, " ");
    if (kw) params.set("search", kw);
  }
  return params;
}

/** Parse a raw pool_test JSON response into the InitialPool shape.
 *
 * @param displaySeed  Purely a local re-shuffle seed (mirrors what the client
 *   used to compute randomly on every mount) — it never touches the API
 *   request, so it adds zero extra backend load. Applying it here means the
 *   server-rendered order is already "fresh-looking" per request, so the
 *   client no longer needs its own live re-fetch just to reshuffle.
 */
function parsePoolJson(json: any, isIndexed: boolean, displaySeed: number): InitialPool | null {
  const seo: SeoV2 | null = json?.data?.seo_v2 ?? json?.seo_v2 ?? null;
  const products: Listing[]         = json?.data?.products         ?? json?.products         ?? [];
  const premiumsRaw: Listing[]      = json?.data?.premium_products  ?? json?.premium_products  ?? [];
  const exclusivesRaw: Listing[]    = json?.data?.exclusive_products ?? json?.exclusive_products ?? [];
  const empExclusivesRaw: Listing[] = json?.data?.emp_exclusive_products ?? json?.emp_exclusive_products ?? [];
  const totalCount: number          = json?.data?.counts?.total_count ?? json?.counts?.total_count ?? products.length;

  if (!products.length && !premiumsRaw.length) return null;

  const totalProducts = json?.data?.pagination?.total_products ?? json?.pagination?.total_products ?? totalCount;
  const perPage = 24;
  const maxPages = Math.max(1, Math.ceil(totalProducts / perPage));

  let featured: Listing[] = [];
  let newItems: Listing[]  = [];
  let usedItems: Listing[] = [];

  if (isIndexed) {
    const featuredSource = seededShuffle(
      products.filter((p) => p.slot_bucket === "featured"),
      displaySeed
    );
    featured = buildFeaturedOrder(featuredSource, premiumsRaw, exclusivesRaw);
    const featuredIds = new Set(featured.map((p) => p.id));
    newItems  = seededShuffle(
      products.filter((p) => p.slot_bucket === "new"  && !p.is_premium && !p.is_exclusive && !featuredIds.has(p.id)),
      displaySeed + 1000
    );
    usedItems = seededShuffle(
      products.filter((p) => p.slot_bucket === "used" && !p.is_premium && !p.is_exclusive && !featuredIds.has(p.id)),
      displaySeed + 2000
    );
  } else {
    // Non-indexed: combined grid, no slot splitting
    const totalC = totalCount === 0 && empExclusivesRaw.length > 0;
    featured = totalC
      ? empExclusivesRaw
      : buildFeaturedOrder(seededShuffle(products, displaySeed), premiumsRaw, exclusivesRaw);
    newItems  = [];
    usedItems = [];
  }

  return { seo, featured, new: newItems, used: usedItems, maxPages, isIndexed };
}

/**
 * Live fetch — two paths:
 *  - seed > 0: call WordPress pool_test directly (bypasses Cloudflare pool cache
 *    which strips `seed` from its key, so all seeds would hit the same entry).
 *  - seed = 0: call via /api/d1/ through Cloudflare (normal fallback).
 */
async function fetchFromApi(filters: FilterState, seed: number, perPage = 24): Promise<any | null> {
  const params = buildApiParams(filters, seed, perPage);

  // When a specific seed is requested, the Cloudflare Worker's pool cache must be
  // bypassed — it normalises its cache key by deleting `seed`, so every seed would
  // return the same cached pool. Call WordPress directly instead.
  if (seed > 0 && WP_API_BASE) {
    try {
      const res = await fetch(`${WP_API_BASE}/pool_test?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(WP_API_KEY && { "X-API-Key": WP_API_KEY }),
        },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const raw = await res.text();
      const jsonStart = raw.indexOf("{");
      return jsonStart >= 0 ? JSON.parse(raw.substring(jsonStart)) : null;
    } catch {
      return null;
    }
  }

  // Default: go through /api/d1/ (Cloudflare orange-cloud → WP).
  try {
    const res = await fetch(`${APP_URL}/api/d1/?${params.toString()}`, {
      cache: "no-store",
    });
    return await parseObfuscatedResponse(res);
  } catch {
    return null;
  }
}

/**
 * Fetch the initial pool for SSR rendering.
 *
 * @param seed        Passed through to the live API — used by the HTML cache
 *                    warmer, which passes ?shuffle_seed=N so each cached HTML
 *                    variant gets a genuinely different product pool. 0 for a
 *                    normal live request (goes through the CF-cached path).
 * @param displaySeed Local-only re-shuffle seed, always a fresh random value
 *                    per request — see parsePoolJson for why this never
 *                    touches the API call itself.
 */
export async function fetchInitialPool(
  filters: FilterState,
  isIndexed = true,
  seed = 0,
  displaySeed = 1
): Promise<InitialPool | null> {
  const apiJson = await fetchFromApi(filters, seed);
  if (apiJson) {
    const parsed = parsePoolJson(apiJson, isIndexed, displaySeed);
    if (parsed) {
      console.log(`[fetchInitialPool] API OK seed=${seed} displaySeed=${displaySeed} (${parsed.featured.length + parsed.new.length + parsed.used.length} products)`);
      return parsed;
    }
  }

  console.log(`[fetchInitialPool] API failed for filters: ${JSON.stringify(filters)}`);
  return null;
}

/**
 * Server-side counterpart to home.tsx's condition-locked New/Used seo_v2
 * fetch — same endpoint/params, called during SSR so no client-visible
 * request is needed just to populate those two section titles.
 */
export async function fetchConditionSeo(
  filters: FilterState,
  condition: "New" | "Used",
  seed = 0
): Promise<SeoV2 | null> {
  const apiJson = await fetchFromApi({ ...filters, condition }, seed, 1);
  return apiJson?.data?.seo_v2 ?? apiJson?.seo_v2 ?? null;
}
