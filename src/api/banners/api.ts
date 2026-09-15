// src/api/banners/api.ts
// Shared server-side fetch used by both the root layout (SSR) and the
// /api/banners/ route handler (kept for any external/CDN callers).

// NOTE: intentionally no query string here — the WP host's nginx proxy cache
// (X-Proxy-Cache) keys on the full URL including query params, so the
// previous "?placement=...&limit=50&paged=1" variant was stuck serving a
// stale cached response after banner images were updated. The plain
// no-query-string URL was a cache miss and returned live data. This is a
// workaround, not a real fix — once this exact URL gets cached too, the same
// staleness can recur. The proxy cache config on the WP host needs fixing
// for a durable solution.
const BANNERS_URL = "https://admin.motorhomesforsale.com.au/wp-json/ads-manager/v1/banners/";

export type FullBanner = {
  id: number;
  name: string;
  image_url: string;
  placement: string;
  banner_type: string;
  target_url: string;
  page_url: string;
  banner_size: string;
  device_target: string;
  url_match_type: "exact" | "contains";
  excluded_urls?: string;
  position: string;
};

export async function fetchBanners(): Promise<FullBanner[]> {
  try {
    const res = await fetch(BANNERS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`❌ banners fetch failed: ${res.status}`);
      return [];
    }

    const raw = await res.text();
    const idx = raw.search(/[[{]/);
    let data: any = [];
    if (idx !== -1) {
      try {
        data = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
      } catch {
        data = [];
      }
    }

    const all = Array.isArray(data) ? data : data.data || [];
    const unique = all.filter(
      (banner: { id: unknown }, index: number, self: { id: unknown }[]) =>
        index === self.findIndex((b) => b.id === banner.id)
    );

    return unique;
  } catch (error) {
    console.error("🔴 Error fetching banners:", error);
    return [];
  }
}
