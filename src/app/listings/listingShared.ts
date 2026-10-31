export type Listing = {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  condition: string;
  location?: string;
  state?: string;
  region?: string;
  suburb?: string;
  regular_price: string | number;
  sale_price?: string | number | null;
  categories?: string[];
  image_format?: string[];
  image_url?: string[];
  image?: string;
  seller_type?: string;
  kg?: string;
  length?: string | number;
  make?: string;
  is_premium?: boolean;
  is_exclusive?: boolean;
  is_featured?: boolean;
  slot_bucket?: string;
};

/** The /pool endpoint (WordPress) returns raw product fields under different
 * names than the Listing type the grid renders (title vs name, r2_thumbnails
 * vs image_format, category vs categories, gvm vs kg) — mirrors the mapping
 * already applied to /home-featured's response in fetchHomeFeatured's
 * normalizeProduct. Without this, cards silently render a blank title/image. */
export function normalizeListing(raw: any): Listing {
  return {
    ...raw,
    name: raw.name ?? raw.title ?? "",
    image_format: Array.isArray(raw.image_format)
      ? raw.image_format
      : Array.isArray(raw.r2_thumbnails)
        ? raw.r2_thumbnails
        : undefined,
    categories: raw.categories ?? (Array.isArray(raw.category) ? raw.category : raw.category ? [raw.category] : []),
    kg: raw.kg ?? (raw.gvm != null ? String(raw.gvm) : undefined),
  };
}

// Blog content's product_sections carry the full product-detail payload
// (category/make as { name, slug } objects, plus sku, dealer, description…)
// — pick out only what ListingCard renders, so the private fields never
// reach the page's client props.
function toDisplayString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    const o = value as { name?: unknown; label?: unknown; value?: unknown; slug?: unknown };
    return String(o.name ?? o.label ?? o.value ?? o.slug ?? "");
  }
  return String(value);
}

export function normalizeBlogProduct(raw: any): Listing {
  const rawCategories: unknown[] = [raw.category ?? raw.categories ?? []].flat();
  const thumbs: string[] = raw.r2_thumbnails ?? raw.image_format ?? [];
  const length = parseFloat(String(raw.length ?? ""));
  const weight = raw.gvm ?? raw.atm ?? raw.kg;

  return {
    id: raw.id,
    name: raw.title ?? raw.name ?? "",
    slug: raw.slug,
    condition: raw.condition || "",
    state: raw.state || undefined,
    region: raw.region || undefined,
    suburb: raw.suburb || undefined,
    regular_price: raw.regular_price ?? "",
    sale_price: raw.sale_price ?? null,
    categories: rawCategories.map(toDisplayString).filter(Boolean),
    image_format: thumbs.map((t) => `https://${t.replace(/^(https?:)?\/\//, "")}`),
    seller_type: raw.seller_type,
    kg: weight != null && weight !== "" ? String(weight) : undefined,
    length: isNaN(length) ? undefined : length,
    make: raw.make != null ? toDisplayString(raw.make) : undefined,
    is_premium: raw.premium ?? raw.is_premium ?? false,
    is_exclusive: raw.exclusive ?? raw.is_exclusive ?? false,
    is_featured: raw.is_featured ?? raw.featured ?? false,
  };
}

export type SeoV2 = {
  h1?: string;
  meta_title?: string;
  meta_description?: string;
  short_description?: string;
  footer_description?: string;
  /** Either a JSON-encoded string or an already-parsed array of
   * `{ q: "...", a: "..." }` — the API has returned both forms. */
  faq?: string | { q: string; a: string }[];
};

/** Featured-tab ordering: slots 1 & 2 are regular featured vans, slot 3 is the
 * exclusive spotlight van, slots 4 & 5 are premium vans, then the rest of the
 * pool fills in after. Shared by the internal fetch path and any caller doing
 * its own shared fetch (e.g. StateHome splitting one response across grids). */
export function buildFeaturedOrder(products: Listing[], premiumsRaw: Listing[], exclusivesRaw: Listing[]): Listing[] {
  const premiums   = premiumsRaw.map((p) => ({ ...p, is_premium: true }));
  const exclusives = exclusivesRaw.map((p) => ({ ...p, is_exclusive: true }));

  // No regular products matched the filter (e.g. a GVM/price band with no
  // inventory) — nothing to fill slots 1/2 with, so show every spotlight
  // van instead of the usual single slot-3 pick, rather than a near-empty grid.
  if (products.length === 0 && exclusives.length > 0) {
    return exclusives;
  }

  const heroFeatured = products.slice(0, 2);
  const hero = [...heroFeatured, ...exclusives.slice(0, 1), ...premiums.slice(0, 2)];
  const heroIds = new Set(hero.map((p) => p.id));
  const rest = products.filter((p) => !heroIds.has(p.id));
  return [...hero, ...rest];
}
