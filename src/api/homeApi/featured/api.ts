import { headers } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.CFS_API_KEY;

export type FeaturedListing = {
  id: number;
  name: string;
  slug: string;
  condition: string;
  location: string;
  state?: string;
  regular_price: string;
  sale_price: string;
  categories: string[];
  image_format: string[];
  seller_type?: string;
  berths?: string | number;
};

export type FeaturedByType = {
  all: FeaturedListing[];
  new: FeaturedListing[];
  used: FeaturedListing[];
};

const EMPTY_FEATURED: FeaturedByType = { all: [], new: [], used: [] };

// Normalize each product so components always get image_format as string[]
// home_featured returns `thumbnail` (imagestack R2 URL); also handle `image` fallback
function normalizeProduct(p: any): FeaturedListing {
  if (!p.image_format) {
    const img = p.thumbnail ?? p.image ?? p.main_image ?? null;
    p.image_format = img ? [img] : [];
  } else if (typeof p.image_format === "string") {
    p.image_format = [p.image_format];
  }
  if (!p.seller_type) p.seller_type = "dealer";
  return p;
}

async function fetchFeaturedType(type: string, seed: number, visitorIp: string): Promise<FeaturedListing[]> {
  const url = `${API_BASE}/home_featured?type=${encodeURIComponent(type)}&seed=${seed}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
        ...(visitorIp && { "X-Visitor-IP": visitorIp }),
      },
    });
    if (!res.ok) return [];

    const raw = await res.text();
    const jsonStart = raw.indexOf("{");
    const json = JSON.parse(jsonStart > 0 ? raw.substring(jsonStart) : raw);
    const rawProducts: any[] = json?.products ?? json?.data?.products ?? [];
    return rawProducts.map(normalizeProduct);
  } catch (err) {
    console.error(`[home_featured] type=${type} fetch failed:`, err);
    return [];
  }
}

// Server-side fetch (called from the page Server Component) — runs during
// SSR so the browser never sees this as a separate Network-tab request.
export async function fetchFeaturedListings(seed: number): Promise<FeaturedByType> {
  if (!API_BASE) return EMPTY_FEATURED;

  const h = await headers();
  const visitorIp =
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "";

  const [all, newListings, used] = await Promise.all([
    fetchFeaturedType("all", seed, visitorIp),
    fetchFeaturedType("new", seed, visitorIp),
    fetchFeaturedType("used", seed, visitorIp),
  ]);

  return { all, new: newListings, used };
}
