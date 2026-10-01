import { cache } from "react";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;
const FETCH_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 3;

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url: string): Promise<any | null> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        lastErr = new Error(`blog status ${res.status}`);
        continue;
      }
      const raw = await res.text();
      const idx = raw.indexOf('{"');
      return JSON.parse(idx >= 0 ? raw.substring(idx) : raw);
    } catch (err) {
      lastErr = err;
    }
  }
  console.error("fetchBlogDetail: all attempts failed", lastErr);
  return null;
}

// mpn/v1 has no dedicated blog-by-slug route yet (confirmed live:
// /blog/{slug} 404s "no route", /blog-detail?slug= 500s) — only the /blog
// listing endpoint exists, and it currently has 0 posts (blog content
// hasn't been migrated to this backend yet). Filtering that listing by
// `slug` is the closest available match, so posts should start showing up
// here automatically once the backend adds them — but since there's no
// live sample yet, this hasn't been verified against a real post. If blog
// pages still don't render once content exists, check first whether
// `slug` actually filters the /blog endpoint, and whether its item field
// names (title/content/banner_image/etc.) match the old blog_detail shape
// assumed below.
//
// cache() dedupes identical (slug, seed) calls within a single request, so
// generateMetadata + layout + page no longer each hit the WP API separately.
export const fetchBlogDetail = cache(async (slug: string, seed?: number): Promise<any | null> => {
  if (!API_BASE) return null;
  const seedParam = seed ? `&seed=${seed}` : "";

  const json = await fetchJson(`${API_BASE}/blog?per_page=1&slug=${encodeURIComponent(slug)}${seedParam}`);
  const post = Array.isArray(json?.data) ? json.data[0] : null;
  if (!post) return null;

  const listJson = await fetchJson(`${API_BASE}/blog?per_page=7${seedParam}`);
  const related = (Array.isArray(listJson?.data) ? listJson.data : [])
    .filter((p: any) => p.slug !== slug)
    .slice(0, 6);

  return {
    data: {
      blog_detail: post,
      related_blogs: related,
    },
  };
});
