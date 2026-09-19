// app/product-details/[slug]/page.tsx
import ProductDetailDemo from "../../product-detail-demo/ProductDetailDemo";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import './product.css?=30006'

export const dynamic = "force-dynamic";

// export async function generateStaticParams() {
//   const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
//   const API_KEY = process.env.MFS_API_KEY;
//   if (!API_BASE) return [];
//
//   const headers: Record<string, string> = {
//     Accept: "application/json",
//     ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
//   };
//
//   const fetchPage = async (page: number): Promise<string[]> => {
//     const res = await fetch(
//       `${API_BASE}/new_optimize_code?page=${page}&per_page=500`,
//       { headers, cache: "no-store" }
//     );
//     if (!res.ok) return [];
//     const data = await res.json();
//     const products: { slug?: string }[] = data?.data?.products ?? [];
//     return products.map((p) => p.slug ?? "").filter(Boolean);
//   };
//
//   // Page 1 — also tells us total_pages
//   const firstRes = await fetch(
//     `${API_BASE}/new_optimize_code?page=1&per_page=500`,
//     { headers, cache: "no-store" }
//   );
//   if (!firstRes.ok) return [];
//   const firstData = await firstRes.json();
//   const firstSlugs = (firstData?.data?.products ?? [])
//     .map((p: { slug?: string }) => p.slug ?? "")
//     .filter(Boolean) as string[];
//   const totalPages: number = firstData?.pagination?.total_pages ?? 1;
//
//   // Remaining pages — 10 at a time in parallel
//   const allSlugs = [...firstSlugs];
//   const BATCH = 10;
//   for (let i = 2; i <= totalPages; i += BATCH) {
//     const pages = Array.from(
//       { length: Math.min(BATCH, totalPages - i + 1) },
//       (_, j) => fetchPage(i + j)
//     );
//     const results = await Promise.all(pages);
//     allSlugs.push(...results.flat());
//   }
//
//   return allSlugs.map((slug) => ({ slug }));
// }

export const dynamicParams = true;

type RouteParams = { slug: string };
type PageProps = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await Promise.race([
    fetchProductDetail(slug),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
  ]);
  const pd = data?.data?.product_details ?? {};
  const seo = data?.seo ?? data?.product?.seo ?? {};
  const slugTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const title = seo.metatitle || seo.meta_title || pd.name || data?.name || slugTitle || "Motorhome for Sale";
  const description = seo.metadescription || seo.meta_description || pd.short_description || "View motorhome details on Motorhomes For Sale Australia.";
  const canonicalUrl = `https://www.motorhomesforsale.com.au/product/${slug}/`;
  const rawImages = pd.image_url ?? pd.images ?? [];
  const images: string[] = (Array.isArray(rawImages) ? rawImages : [rawImages]).filter(Boolean);

  return {
    title,
    description,
    robots: seo.index === "noindex" ? "noindex, nofollow" : "index, follow",
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Motorhomes for Sale",
      ...(images.length > 0 && { images: [{ url: images[0], alt: title }] }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function titleCase(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function attr(label: string, value: unknown): { label: string; value: string } | null {
  if (value === null || value === undefined || value === "") return null;
  return { label, value: String(value) };
}

/**
 * The WP API's product endpoint now returns a flat object (title, make: {name,
 * slug}, numeric regular_price/sale_price, etc.) instead of the nested
 * { data: { product_details: { attribute_urls: [...] } } } shape ProductDetailDemo
 * was built against — without this adapter every product page gets stuck on
 * "Loading product…" because product.name is never populated.
 */
function normalizeProductDetail(raw: any) {
  if (raw?.data?.product_details) return raw;
  if (!raw?.title && !raw?.slug) return raw;

  // Custom Built has no real model — its "model" field is actually the
  // chassis name (e.g. "Sprinter"), already shown via Vehicle Make, so it's
  // redundant/confusing to also show as "Model" here.
  const isCustomBuilt = raw.make?.slug === "custom-built";

  const attribute_urls = [
    attr("Make", raw.make?.name),
    attr(" Vehicle Make", raw.engine_make),
    attr("Model", isCustomBuilt ? null : raw.model?.name),
    attr("Years", raw.year),
    attr("Conditions", raw.condition),
    attr("RV Class", raw.category?.[0]),
    attr("Length", raw.length != null ? `${raw.length} ft` : null),
    attr("Width", raw.width),
    attr("Height", raw.height),
    attr("ATM", raw.gvm != null ? `${raw.gvm} kg` : null),
    attr("Tare Mass", raw.tare_mass != null ? `${raw.tare_mass} kg` : null),
    attr("Payload Weight", raw.payload_weight != null ? `${raw.payload_weight} kg` : null),
    attr("GCM", raw.gcm != null ? `${raw.gcm} kg` : null),
    attr("Engine Capacity", raw.engine_capacity),
    attr("Fuel Type", raw.fuel_type),
    attr("Transmission", raw.transmission),
    attr("Odometer", raw.odometer),
    attr("sleeps", raw.sleep),
    attr("Seats", raw.seats),
    attr("Location", raw.state ? titleCase(raw.state) : null),
  ].filter(Boolean);

  const product_details = {
    id: raw.id,
    slug: raw.slug,
    name: raw.title,
    description: raw.description,
    image_url: raw.images_full?.length ? raw.images_full : raw.r2_thumbnails,
    regular_price: raw.regular_price,
    sale_price: raw.sale_price,
    make: raw.make?.name,
    condition: raw.condition,
    categories: raw.category ?? [],
    attribute_urls,
    sku: raw.sku,
    seller_type: raw.seller_type,
    region: raw.region ? { value: titleCase(raw.region), slug: raw.region } : undefined,
  };

  return {
    data: { id: raw.id, product_details },
    seo: { meta_title: raw.seo_title, meta_description: raw.seo_description },
  };
}

const fetchProductDetail = cache(async (slug: string) => {
  const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE!;
  const API_KEY = process.env.MFS_API_KEY;
  try {
    const res = await fetch(
      `${API_BASE}/${encodeURIComponent(slug)}`,
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
    const idx = raw.indexOf('{"');
    const parsed = JSON.parse(idx >= 0 ? raw.substring(idx) : raw);
    return normalizeProductDetail(parsed);
  } catch {
    return null;
  }
});


/** Adapts a raw /{slug}/similar product (title, r2_thumbnails, category, gvm)
 * into the fields ProductDetailDemo's MakeListing expects (name, image_format,
 * categories) — same field-name mismatch as the pool endpoint's products. */
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

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchProductDetail(slug);

  if (!data || Object.keys(data).length === 0) {
    // Middleware handles 410 for the common path; this covers the rare case where
    // the middleware check timed out and let the request through.
    redirect("/410/");
  }

  const pd = data?.data?.product_details ?? {};
  const seo = data?.seo ?? data?.product?.seo ?? {};
  const pdName = seo.metatitle || seo.meta_title || pd.name || data?.name || "";
  const pdDesc = seo.metadescription || seo.meta_description || pd.short_description || data?.short_description || "";
  const canonicalUrl = `https://www.motorhomesforsale.com.au/product/${slug}/`;

  const rawImages = pd.image_url ?? pd.images ?? [];
  const images: string[] = (Array.isArray(rawImages) ? rawImages : [rawImages]).filter(Boolean);

  const rawPrice = pd.sale_price || pd.regular_price || pd.price;
  const priceStr = rawPrice ? String(rawPrice).replace(/[^0-9.]/g, "") : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pdName,
    ...(pdDesc && { description: pdDesc }),
    ...(images.length > 0 && { image: images }),
    ...(pd.make && { brand: { "@type": "Brand", name: pd.make } }),
    ...(pd.condition && {
      itemCondition:
        String(pd.condition).toLowerCase() === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "AUD",
      ...(priceStr && { price: priceStr }),
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      seller: { "@type": "Organization", name: "Motorhomes For Sale" },
    },
  };

  const seed = Math.ceil(Math.random() * 10);
  const similarData = await fetchSimilarProducts(slug);

  // Shuffle price section server-side (API doesn't shuffle it)
  if (similarData?.price_similar?.length) {
    const arr = similarData.price_similar;
    let s = seed * 9301 + 49297;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  return (
    <main className="mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailDemo data={data} similarData={similarData} />
    </main>
  );
}