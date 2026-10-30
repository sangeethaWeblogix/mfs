import { INDEXABLE_URLS } from "@/utils/seo/indexable-urls";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.motorhomesforsale.com.au";

/**
 * Shared builder for every sitemap backed by {{baseUrl}}/sitemap/{type} —
 * the documented replacement for the old per-type cfs/v1 endpoints (which
 * 401 on every request regardless of key) and for the handful of routes that
 * were reading a static local JSON/CSV snapshot instead of live data.
 *
 * `type` matches the API's own enum: base|listings|states|regions|makes|
 * models|vehicle-makes|state-make|region-make|state-vehicle-make|
 * region-vehicle-make|length|gvm|price. "listings" returns individual
 * product slugs (rendered under /product/), everything else returns a
 * /listings/ filter path.
 */
async function fetchParamsCount(query: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/params-count?${query}`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const raw = await res.text();
    const idx = raw.indexOf('{"');
    return JSON.parse(idx > 0 ? raw.slice(idx) : raw);
  } catch {
    return null;
  }
}

/**
 * /sitemap/models?min_count=1 has been confirmed (live) to keep reporting
 * make/model combos whose last product has already sold — the same combo
 * 410s on the actual /listings/{make}/{model}/ page because middleware's
 * isValidMakeModel() checks a different, accurate endpoint
 * (/params-count?group_by=model&motorhome_make=X). bust_cache=1 doesn't
 * help — it's not a caching issue, the sitemap endpoint's own min_count
 * logic is just wrong/stale server-side. Cross-checking against the same
 * params-count endpoint middleware trusts keeps dead models out of both
 * the sitemap and url.csv regardless of that backend bug.
 */
async function filterLiveModels(paths: string[]): Promise<string[]> {
  const byMake = new Map<string, string[]>();
  for (const path of paths) {
    const [make, model] = path.split("/").filter(Boolean);
    if (!make || !model) continue;
    if (!byMake.has(make)) byMake.set(make, []);
    byMake.get(make)!.push(model);
  }

  const validModelsByMake = new Map<string, Set<string>>();
  await Promise.all(
    Array.from(byMake.keys()).map(async (make) => {
      const data = await fetchParamsCount(`group_by=model&motorhome_make=${encodeURIComponent(make)}`);
      const models = Array.isArray(data?.data) ? data.data : null;
      // API error for this make — don't drop its models, we have no signal either way.
      validModelsByMake.set(make, models ? new Set(models.map((m: any) => m.slug)) : new Set());
      if (!models) validModelsByMake.delete(make);
    })
  );

  return paths.filter((path) => {
    const [make, model] = path.split("/").filter(Boolean);
    const validModels = validModelsByMake.get(make);
    return !validModels || validModels.has(model);
  });
}

export async function fetchSitemapPaths(type: string): Promise<string[]> {
  if (!API_BASE) return [];
  try {
    const res = await fetch(`${API_BASE}/sitemap/${type}?min_count=1&bust_cache=0`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const raw = await res.text();
    const idx = raw.indexOf('{"');
    const json = JSON.parse(idx > 0 ? raw.slice(idx) : raw);
    const paths = Array.isArray(json?.paths) ? json.paths : [];
    return type === "models" ? await filterLiveModels(paths) : paths;
  } catch {
    return [];
  }
}

/**
 * /listings/ filter pages have their own noindex policy, driven by whether
 * the exact path is in the curated src/app/url.csv (INDEXABLE_URLS — the
 * same set metaFromSlug() checks to decide the page's own <meta
 * name="robots"> tag). The backend's /sitemap/{type} endpoint only knows
 * "this combination has products", not whether it's SEO-curated as
 * indexable, so without this filter a sitemap can list a real, working page
 * whose own meta tag says noindex — exactly what Ahrefs flags as "Noindex
 * page in sitemap". /product/ pages have no such policy (always indexable),
 * so this only applies when prefix is "listings".
 */
function filterIndexable(paths: string[], prefix: "listings" | "product"): string[] {
  if (prefix !== "listings") return paths;
  return paths.filter((path) => INDEXABLE_URLS.has(`/listings/${path}`));
}

export function buildSitemapXml(
  paths: string[],
  prefix: "listings" | "product",
  changefreq = "weekly",
  priority = "0.7"
): string {
  const lastmod = new Date().toISOString();
  const urls = filterIndexable(paths, prefix)
    .map(
      (path) => `
  <url>
    <loc>${SITE_URL}/${prefix}/${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
