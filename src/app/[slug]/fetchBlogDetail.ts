import { cache } from "react";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;
const FETCH_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 3;

// The blog endpoint lives at the shared mpn/v1 root, not under the
// motorhomes-specific sub-path API_BASE points at — it's one shared table
// across the whole Marketplace Network, filtered per site via `vehicle_type`
// (confirmed live: omitting it returns every sister site's posts mixed in).
const API_ROOT = API_BASE?.replace(/\/motorhomes\/?$/, "");

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // Short revalidate window — also means a failed attempt's retries below
    // don't each add a fresh hit to the backend's origin server.
    return await fetch(url, {
      next: { revalidate: 60 },
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

// WP occasionally stores an image URL with a doubled protocol
// (e.g. "https://https://...") from a bad copy-paste in the admin — that
// malformed URL crashes next/image's hostname check and takes down the
// whole page for every visitor (same issue fixed in src/api/blog/api.ts).
const sanitizeImageUrl = (url?: string): string | undefined =>
  url ? url.replace(/^(https?:\/\/)+(?=https?:\/\/)/i, "") : undefined;

// The "Easy Table of Contents" plugin bakes its heading anchors into the
// article HTML as absolute links back to the WordPress admin host
// (admin.marketplacenetwork.com.au/{slug}/#Heading) — clicking one on this
// site navigated visitors away to that (non-public) backend host instead of
// just jumping to the section on this page. Our own sidebar TOC also reads
// these same hrefs straight out of the rendered content, so fixing them
// here once covers both the embedded in-article TOC and the sidebar one.
function stripAdminHostFromAnchors(html: string): string {
  return html.replace(/https?:\/\/admin\.marketplacenetwork\.com\.au\/[^"'#]*#/g, "#");
}

// /blog/{slug} used to 404 "no route" back when the backend had zero blog
// posts to serve — now that real content exists it's live and returns the
// full article (content/toc/faq/product_sections/category_featured_products),
// unlike the /blog listing endpoint (filtered by `slug`) this used to fall
// back to, which only ever had excerpt-level fields and no article body.
//
// cache() dedupes identical (slug, seed) calls within a single request, so
// generateMetadata + layout + page no longer each hit the WP API separately.
export const fetchBlogDetail = cache(async (slug: string, seed?: number): Promise<any | null> => {
  if (!API_ROOT) return null;
  const seedParam = seed ? `&seed=${seed}` : "";

  const json = await fetchJson(`${API_ROOT}/blog/${encodeURIComponent(slug)}?vehicle_type=motorhomes${seedParam}`);
  const post = json?.data?.blog_detail ?? null;
  if (!post) return null;
  if (post.featured_image) post.featured_image = sanitizeImageUrl(post.featured_image);
  if (post.image) post.image = sanitizeImageUrl(post.image);
  if (post.content) post.content = stripAdminHostFromAnchors(post.content);
  delete post.link;

  const listJson = await fetchJson(`${API_ROOT}/blog?vehicle_type=motorhomes&per_page=7${seedParam}`);
  const related = (Array.isArray(listJson?.data) ? listJson.data : [])
    .filter((p: any) => p.slug !== slug)
    .slice(0, 6)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      slug: p.slug,
      image: sanitizeImageUrl(p.featured_image),
    }));

  return {
    data: {
      blog_detail: post,
      related_blogs: related,
    },
  };
});
