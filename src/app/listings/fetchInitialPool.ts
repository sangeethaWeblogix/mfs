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

import { Listing, SeoV2, buildFeaturedOrder, normalizeListing } from "./listingShared";
import type { InitialPool } from "./home";
import type { FilterState } from "./StateFilterBar";
import { seededShuffle } from "./seededShuffle";

const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || "https://www.motorhomesforsale.com.au";
// Direct WP API — used when seed > 0 to bypass Cloudflare's pool cache (which strips seed).
const WP_API_BASE     = process.env.NEXT_PUBLIC_MFS_API_BASE;
const WP_API_KEY      = process.env.MFS_API_KEY;

/** Build the /api/d1/ query string from the full FilterState. */
function buildApiParams(filters: FilterState, seed: number, perPage = 24): URLSearchParams {
  const params = new URLSearchParams({ orderby: "default", per_page: String(perPage), page: "1", seed: String(seed || 1) });
  if (filters.state)              params.set("state",             String(filters.state));
  if (filters.region)             params.set("region",            String(filters.region));
  if (filters.category)           params.set("category",          String(filters.category));
  if (filters.condition)          params.set("condition",         String(filters.condition));
  if (filters.make)               params.set("motorhome_make",    String(filters.make));
  if (filters.model)              params.set("model",             String(filters.model));
  if (filters.engine_make)        params.set("vehicle_make",      String(filters.engine_make));
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
  const seo: SeoV2 | null = json?.seo_v2 ?? null;
  const premiumsRaw: Listing[]   = (json?.premium_products   ?? []).map(normalizeListing);
  const exclusivesRaw: Listing[] = (json?.exclusive_products ?? []).map(normalizeListing);

  // Some filter combos (e.g. condition=New) make the backend return one flat
  // `products` array instead of the featured/new/used split — the same shape
  // page 2+ pagination already had to handle (see StateListingGrid's
  // self-fetch mode). Without this check, featuredRaw/newRaw/usedRaw all come
  // back empty and only the premium/exclusive hero picks render, dropping
  // every "regular" listing even though the real total (in pagination/counts)
  // is unaffected.
  const hasFlatProducts = Array.isArray(json?.products);
  const featuredRaw: Listing[] = hasFlatProducts
    ? (json.products as any[]).map(normalizeListing)
    : (json?.featured_products ?? []).map(normalizeListing);
  const newRaw: Listing[]  = hasFlatProducts ? [] : (json?.new_products  ?? []).map(normalizeListing);
  const usedRaw: Listing[] = hasFlatProducts ? [] : (json?.used_products ?? []).map(normalizeListing);

  if (!featuredRaw.length && !newRaw.length && !usedRaw.length && !premiumsRaw.length) return null;

  const totalProducts = json?.pagination?.total_products ?? json?.counts?.total ?? 0;
  const perPage = 24;
  const maxPages = Math.max(1, Math.ceil(totalProducts / perPage));

  let featured: Listing[] = [];
  let newItems: Listing[]  = [];
  let usedItems: Listing[] = [];

  if (isIndexed && !hasFlatProducts) {
    featured = buildFeaturedOrder(seededShuffle(featuredRaw, displaySeed), premiumsRaw, exclusivesRaw);
    newItems  = seededShuffle(newRaw, displaySeed + 1000);
    usedItems = seededShuffle(usedRaw, displaySeed + 2000);
  } else {
    // Non-indexed: combined grid, no slot splitting
    const combined = [...featuredRaw, ...newRaw, ...usedRaw];
    featured = buildFeaturedOrder(seededShuffle(combined, displaySeed), premiumsRaw, exclusivesRaw);
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
      const res = await fetch(`${WP_API_BASE}/pool?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(WP_API_KEY && { "X-Secret-Key": WP_API_KEY }),
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

  // Default: go through /api/pool-listings/ (proxies to WP's /pool).
  try {
    const res = await fetch(`${APP_URL}/api/pool-listings/?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
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
