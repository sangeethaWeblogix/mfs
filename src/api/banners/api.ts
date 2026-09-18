// src/api/banners/api.ts
// Shared server-side fetch used by both the root layout (SSR) and the
// /api/banners/ route handler (kept for any external/CDN callers).
const PLACEMENTS = ["listings", "home"];
// "cfs" (caravansforsale.com.au) returns a sister site's banners — this site
// is motorhomesforsale.com.au, whose campaigns are registered under "mfs".
const SITE = "mfs";

export type Banner = {
  id: number;
  [key: string]: unknown;
};

export async function fetchBanners(): Promise<Banner[]> {
  try {
    const results = await Promise.allSettled(
      PLACEMENTS.map(async (placement) => {
        const url = `https://admin.marketplacenetwork.com.au/wp-json/ads-manager/v1/banners?placement=${placement}&limit=50&paged=1&site=${SITE}`;

        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" },
          cache: "no-store",
        });

        if (!res.ok) {
          // 404 means the placement hasn't been configured in WordPress yet — not an error.
          // Log other unexpected failures as warnings so they're visible but not alarming.
          if (res.status !== 404) {
            console.warn(`⚠️ banners/${placement}: ${res.status}`);
          }
          return [];
        }

        const raw = await res.text();
        const idx = raw.search(/[[{]/);
        if (idx === -1) return [];
        let data;
        try {
          data = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
        } catch {
          return [];
        }
        return Array.isArray(data) ? data : data.data || [];
      })
    );

    const merged = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : []
    );

    const unique = merged.filter(
      (banner: { id: unknown }, index: number, self: { id: unknown }[]) =>
        index === self.findIndex((b) => b.id === banner.id)
    );

    return unique;
  } catch (error) {
    console.error("🔴 Error fetching banners:", error);
    return [];
  }
}
