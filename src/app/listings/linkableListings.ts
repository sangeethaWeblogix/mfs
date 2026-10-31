import { parseSlugToFilters, type Filters } from "@/app/components/urlBuilder";
import { buildSlugFromFilters } from "@/app/components/slugBuilter";

/**
 * Guards for internal links to /listings/ pages — a link is only worth
 * showing when its page answers 200 with products. The middleware 410s any
 * URL not in canonical segment order (e.g. every "-category" URL, since
 * buildSlugFromFilters never re-emits one) and any state/region/make it can't
 * find in params-count; a URL with 0 products renders an empty noindex page.
 *
 * Isomorphic (no env/fs) — the params-count fetcher is passed in, so the
 * server calls WP directly and the client goes through /api/params-count/.
 */

/** params-count JSON for a query string; null = unknown (API down/throttled). */
export type ParamsCountFetcher = (query: string) => Promise<any | null>;

/** params-count filter params for a /listings/ href (empty = all listings),
 * or null when the href isn't canonical — the middleware would 410 it. Param
 * names mirror the middleware's buildApiParams (its 0-product check). */
export function listingCountParams(href: string): URLSearchParams | null {
  const slugParts = href.split("?")[0].replace(/^https?:\/\/[^/]+/, "").replace(/^\/listings/, "").split("/").filter(Boolean);
  const p = new URLSearchParams();
  if (slugParts.length === 0) return p;
  let f: Filters;
  try {
    f = parseSlugToFilters(slugParts);
    const norm = (s: string) => s.replace(/\/$/, "").toLowerCase();
    if (norm(buildSlugFromFilters(f)) !== norm(`/listings/${slugParts.join("/")}`)) return null;
  } catch {
    return null;
  }
  if (f.make) p.set("motorhome_make", f.make);
  if (f.model) p.set("model", f.model);
  if (f.engine_make) p.set("vehicle_make", f.engine_make);
  if (f.state) p.set("state", f.state);
  if (f.region) p.set("region", f.region);
  if (f.suburb) p.set("suburb", f.suburb);
  if (f.pincode) p.set("pincode", f.pincode);
  if (f.from_price) p.set("from_price", `${f.from_price}`);
  if (f.to_price) p.set("to_price", `${f.to_price}`);
  if (f.minKg) p.set("from_gvm", `${f.minKg}`);
  if (f.maxKg) p.set("to_gvm", `${f.maxKg}`);
  if (f.from_length) p.set("from_length", `${f.from_length}`);
  if (f.to_length) p.set("to_length", `${f.to_length}`);
  if (f.condition) p.set("condition", f.condition.toLowerCase().replace(/\s+/g, "-"));
  if (f.sleeps) p.set("sleep", `${f.sleeps}`);
  if (f.from_sleep) p.set("from_sleep", `${f.from_sleep}`);
  if (f.to_sleep) p.set("to_sleep", `${f.to_sleep}`);
  if (f.acustom_fromyears) p.set("from_year", `${f.acustom_fromyears}`);
  if (f.acustom_toyears) p.set("to_year", `${f.acustom_toyears}`);
  return p;
}

/** Listings behind a href's filters; null = unknown. params-count ignores the
 * filter on the dimension it groups by (facet counts), so a state/region
 * page reads its own entry from group_by=state / group_by=region — the same
 * region-within-state lookup the middleware 410s on. */
async function listingTotal(params: URLSearchParams, fetchCounts: ParamsCountFetcher): Promise<number | null> {
  const groupBy = params.has("region") ? "region" : "state";
  const target = params.get(groupBy)?.toLowerCase().replace(/\s+/g, "-");
  const query = new URLSearchParams(params);
  query.delete(groupBy);
  query.set("group_by", groupBy);
  const json = await fetchCounts(query.toString());
  if (!json) return null;
  if (!target) return json.total_products == null ? null : Number(json.total_products);
  if (!Array.isArray(json.data)) return null;
  const entry = json.data.find((d: any) => String(d?.slug ?? "").toLowerCase() === target);
  return Number(entry?.count ?? 0);
}

/** The hrefs that are safe to link: canonical, and with listings behind them.
 * An unknown count keeps the link (API down shouldn't strip every link), and
 * counts are live — a hidden link comes back by itself once stock arrives. */
export async function linkableListingHrefs(hrefs: string[], fetchCounts: ParamsCountFetcher): Promise<string[]> {
  const unique = Array.from(new Set(hrefs));
  const keep: boolean[] = new Array(unique.length).fill(true);
  // A few calls at a time — a burst of ~40 gets throttled by the backend,
  // and every throttled (unknown) count would keep a dead link.
  let next = 0;
  const worker = async () => {
    while (next < unique.length) {
      const i = next++;
      const params = listingCountParams(unique[i]);
      if (params === null) { keep[i] = false; continue; }
      if (params.toString() === "") continue;
      const total = await listingTotal(params, fetchCounts);
      keep[i] = total === null || total > 0;
    }
  };
  await Promise.all(Array.from({ length: LINK_CHECK_CONCURRENCY }, worker));
  return unique.filter((_, i) => keep[i]);
}

const LINK_CHECK_CONCURRENCY = 6;

/** Client-side fetcher (filters changed after SSR) — /api/params-count/
 * proxies params-count. */
export const fetchParamsCountClient: ParamsCountFetcher = async (query) => {
  try {
    const res = await fetch(`/api/params-count/?${query}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};
