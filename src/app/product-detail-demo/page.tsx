import { cache } from "react";
import type { Metadata } from "next";
import ProductDetailDemo from "./ProductDetailDemo";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

const DEMO_SLUG = "2025-retreat-caravans-daydream-29ft6-off-road";

const fetchProduct = cache(async () => {
  const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE!;
  const API_KEY  = process.env.MFS_API_KEY;
  try {
    const res = await fetch(
      `${API_BASE}/${encodeURIComponent(DEMO_SLUG)}`,
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/json",
          ...(API_KEY && { "X-Secret-Key": API_KEY }),
        },
      }
    );
    if (!res.ok) return null;
    const raw = await res.text();
    const idx = raw.indexOf('{"');
    return JSON.parse(idx > 0 ? raw.substring(idx) : raw);
  } catch {
    return null;
  }
});

function normalizeSimilarItem(raw: any) {
  return {
    id: raw.id,
    name: raw.title ?? raw.name ?? "",
    slug: raw.slug,
    image_format: Array.isArray(raw.r2_thumbnails) ? raw.r2_thumbnails : (raw.image_format ?? []),
    regular_price: raw.regular_price,
    sale_price: raw.sale_price,
    state: raw.state,
    region: raw.region,
    condition: raw.condition,
    seller_type: raw.seller_type,
    categories: Array.isArray(raw.category) ? raw.category : (raw.category ? [raw.category] : []),
  };
}

// Mirrors product/[slug]/page.tsx's fetchSimilarProducts — same slug-based
// /{slug}/similar endpoint on the live mpn/v1 host.
async function fetchSimilarProducts(slug: string) {
  const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
  const API_KEY = process.env.MFS_API_KEY;
  try {
    const res = await fetch(
      `${API_BASE}/${encodeURIComponent(slug)}/similar`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(API_KEY && { "X-Secret-Key": API_KEY }),
        },
      }
    );
    if (!res.ok) return null;
    const raw = await res.text();
    const idx = raw.indexOf("{");
    const json = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
    return {
      make_similar: (json?.same_make ?? []).map(normalizeSimilarItem),
      price_similar: (json?.price_range ?? []).map(normalizeSimilarItem),
      blogs: json?.blog ?? [],
    };
  } catch {
    return null;
  }
}

export default async function ProductDetailDemoPage() {
  const data = await fetchProduct();

  const pd = data?.data?.product_details ?? {};
  const slug = pd.slug ?? data?.data?.slug ?? data?.slug ?? DEMO_SLUG;
  const similarData = await fetchSimilarProducts(slug);

  return (
    <main>
      <ProductDetailDemo data={data} similarData={similarData} />
    </main>
  );
}
