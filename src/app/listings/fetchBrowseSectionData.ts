import {
  PRICE_BANDS,
  GVM_BANDS,
  LENGTH_BANDS,
  SLEEP_BANDS,
  defaultBrowseHrefs,
  type CountItem,
  type BrowseSectionData,
} from "./browseSectionShared";
import { linkableListingHrefs } from "./linkableListings";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;

const wpHeaders = (): Record<string
, string> => ({
  Accept: "application/json",
  ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
});

async function fetchGroupCountsServer(
  groupBy: string,
  scope: Record<string, string>
): Promise<CountItem[]> {
  try {
    const qs = new URLSearchParams({ group_by: groupBy, ...scope });
    const res = await fetch(`${API_BASE}/params_count?${qs.toString()}`, {
      headers: wpHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.[groupBy] ?? [];
  } catch {
    return [];
  }
}

/**
 * Band count for all pages — product_exists_check live call which returns
 * { count, exists }. Replaces both the old pool_test (indexed) and
 * exists-only (noindex) paths.
 */
async function fetchBandCountServer(scope: Record<string, string>, query: string): Promise<number> {
  const bandParams: Record<string, string> = { ...scope };
  new URLSearchParams(query).forEach((v, k) => { bandParams[k] = v; });

  try {
    const qs = new URLSearchParams(bandParams);
    const res = await fetch(`${API_BASE}/product_exists_check?${qs.toString()}`, {
      headers: wpHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return json?.count ?? (json?.exists ? 1 : 0);
  } catch {
    return 0;
  }
}

/** params-count JSON for a link guard; null = unknown. Same endpoint/key as
 * the middleware's state/region/make checks; a shorter cache than the counts
 * above so a region that sells out stops being linked soon after it 410s. */
async function fetchParamsCountServer(query: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/params-count?${query}`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const raw = await res.text();
    const idx = raw.indexOf('{"');
    return JSON.parse(idx > 0 ? raw.substring(idx) : raw);
  } catch {
    return null;
  }
}

/** Server-side link guard for home/footer/browse links — keeps only hrefs
 * that open a live, non-empty listings page (see linkableListings.ts). */
export function fetchLinkableHrefs(hrefs: string[]): Promise<string[]> {
  return linkableListingHrefs(hrefs, fetchParamsCountServer);
}

async function fetchAllBandCountsServer(scope: Record<string, string>) {
  const [price, gvm, length, sleep] = await Promise.all([
    Promise.all(PRICE_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
    Promise.all(GVM_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
    Promise.all(LENGTH_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
    Promise.all(SLEEP_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
  ]);
  return { price, gvm, length, sleep };
}

/** Server-side mirror of StateBrowseSection's four client-fetch modes — run
 * during SSR/ISR so the section's links land in the initial HTML instead of
 * only appearing after the client's useEffect fetches finish.
 *
 * Band counts use the live product_exists_check API (returns { count, exists })
 * — same path for both indexed and noindex pages.
 */
export async function fetchBrowseSectionData(
  filters: { state?: string; region?: string; category?: string },
): Promise<BrowseSectionData> {
  const { state, region, category } = filters;
  const hasState = !!state;
  const hasRegion = !!region;
  const hasCategory = !!category;

  const categoryOnly            = !hasState && hasCategory;
  const stateRegionMode         = hasState && hasRegion && !hasCategory;
  const categoryStateMode       = hasState && hasCategory && !hasRegion;
  const categoryStateRegionMode = hasState && hasCategory && hasRegion;

  if (categoryOnly) {
    const scope = { category: category! };
    const [makeCounts, stateCounts, regionCounts, priceCounts] = await Promise.all([
      fetchGroupCountsServer("make", scope),
      fetchGroupCountsServer("state", scope),
      fetchGroupCountsServer("region", scope),
      Promise.all(PRICE_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
    ]);
    return { makeCounts, stateCounts, regionCounts, priceCounts };
  }

  if (stateRegionMode) {
    const scope = { state: state!, region: region! };
    const [makeCounts, categoryCounts, priceCounts, gvmCounts, sleepCounts] = await Promise.all([
      fetchGroupCountsServer("make", scope),
      fetchGroupCountsServer("category", scope),
      Promise.all(PRICE_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
      Promise.all(GVM_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
      Promise.all(SLEEP_BANDS.map((b) => fetchBandCountServer(scope, b.query))),
    ]);
    return { makeCounts, categoryCounts, priceCounts, gvmCounts, sleepCounts };
  }

  if (categoryStateMode) {
    const scope = { category: category!, state: state! };
    const [regionCounts, makeCounts, bands] = await Promise.all([
      fetchGroupCountsServer("region", scope),
      fetchGroupCountsServer("make", scope),
      fetchAllBandCountsServer(scope),
    ]);
    return {
      regionCounts,
      makeCounts,
      priceCounts: bands.price,
      gvmCounts: bands.gvm,
      lengthCounts: bands.length,
      sleepCounts: bands.sleep,
    };
  }

  if (categoryStateRegionMode) {
    const scope = { category: category!, state: state!, region: region! };
    const [makeCounts, bands] = await Promise.all([
      fetchGroupCountsServer("make", scope),
      fetchAllBandCountsServer(scope),
    ]);
    return {
      makeCounts,
      priceCounts: bands.price,
      gvmCounts: bands.gvm,
      lengthCounts: bands.length,
      sleepCounts: bands.sleep,
    };
  }

  // Default mode (no state/category, or state-only) — the pills are static
  // (STATES/FILTERS_NO_STATE) or come from getRegionsByState, so check each
  // one live: a region with no stock 410s, an empty band renders 0 results.
  return { linkableHrefs: await fetchLinkableHrefs(defaultBrowseHrefs(state)) };
}
