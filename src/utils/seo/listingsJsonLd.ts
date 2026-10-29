import type { FilterState } from "@/app/listings/StateFilterBar";
import type { Listing, SeoV2 } from "@/app/listings/listingShared";
import { buildFilterBreadcrumbs } from "@/app/listings/urlUtils";
import { parseVehicleTitle, type NameItem } from "./parseVehicleTitle";

const BASE_URL = "https://www.motorhomesforsale.com.au";
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;

async function fetchGroupBy(groupBy: string): Promise<NameItem[]> {
  try {
    const res = await fetch(`${API_BASE}/params-count?group_by=${groupBy}`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const raw = await res.text();
    const idx = raw.indexOf('{"');
    const json = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
    return json?.data ?? [];
  } catch {
    return [];
  }
}

/** The make and vehicle-make (chassis) lists this schema's title parser
 * matches against — same data as the Motorhome Make / Base Vehicle Make
 * filter dropdowns, cached for an hour since these barely change. */
export async function fetchVehicleNameLists(): Promise<{ makes: NameItem[]; chassisMakes: NameItem[] }> {
  const [makes, chassisMakes] = await Promise.all([
    fetchGroupBy("make"),
    fetchGroupBy("vehicle_make"),
  ]);
  return { makes, chassisMakes };
}

/**
 * Matches the SEO-test-passed structure supplied by the user exactly: one
 * script, one @graph with WebSite + CollectionPage + BreadcrumbList +
 * ItemList linked by @id, Vehicle items with make/model/chassis/fuel/
 * transmission/features. The /pool listing endpoint only returns a flat
 * title per product (no separate make/model/chassis fields — confirmed
 * live), so those are derived from the title via parseVehicleTitle() using
 * the site's own real make/vehicle-make lists, not invented. Fields that
 * genuinely can't be determined (e.g. a title with no recognizable make) are
 * left out rather than guessed.
 */
export function buildListingsJsonLd(
  filters: FilterState,
  seo: SeoV2 | null,
  totalProducts: number,
  products: Listing[],
  canonicalPath: string,
  page: number,
  vehicleNames: { makes: NameItem[]; chassisMakes: NameItem[] }
) {
  const url = `${BASE_URL}${canonicalPath}`;
  const name = seo?.h1 || seo?.meta_title || `${totalProducts} Motorhomes for Sale in Australia`;
  // Same priority as the on-page description right under the H1
  // (StateHero: short_description || meta_description).
  const description =
    seo?.short_description ||
    seo?.meta_description ||
    "Browse new and used motorhomes for sale across Australia. Compare prices, layouts, sleeping capacity and key specifications from dealers and private sellers.";

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Motorhomes for Sale", href: "/listings/" },
    ...buildFilterBreadcrumbs(filters),
  ];

  const items = products.slice(0, 24);

  const itemListElement = items.map((product, i) => {
    const parsed = parseVehicleTitle(product.name || "", vehicleNames.makes, vehicleNames.chassisMakes);
    const productUrl = product.slug ? `${BASE_URL}/product/${product.slug}/` : url;

    const additionalProperty: Record<string, unknown>[] = [];
    if (parsed.chassis) {
      additionalProperty.push({ "@type": "PropertyValue", name: "Chassis", value: parsed.chassis });
    }
    if (product.length != null && product.length !== "") {
      additionalProperty.push({
        "@type": "PropertyValue",
        name: "Length",
        value: typeof product.length === "string" ? parseFloat(product.length) : product.length,
        unitCode: "FOT",
      });
    }
    if (parsed.features) {
      additionalProperty.push({ "@type": "PropertyValue", name: "Features", value: parsed.features });
    }

    const itemConditionUrl =
      product.condition?.toLowerCase() === "new"
        ? "https://schema.org/NewCondition"
        : product.condition?.toLowerCase() === "used"
          ? "https://schema.org/UsedCondition"
          : undefined;

    const vehicle: Record<string, unknown> = {
      "@type": "Vehicle",
      "@id": `${productUrl}#vehicle`,
      name: product.name || "",
      url: productUrl,
      ...(product.sku && { sku: product.sku }),
      bodyType: "Motorhome",
      ...(parsed.make && {
        brand: { "@type": "Brand", name: parsed.make },
      }),
      ...(parsed.model && { model: parsed.model }),
      ...(parsed.year && { vehicleModelDate: parsed.year }),
      ...(parsed.fuelType && { fuelType: parsed.fuelType }),
      ...(parsed.transmission && { vehicleTransmission: parsed.transmission }),
      ...(parsed.engineDisplacementLtr && {
        vehicleEngine: {
          "@type": "EngineSpecification",
          engineDisplacement: { "@type": "QuantitativeValue", value: parsed.engineDisplacementLtr, unitCode: "LTR" },
        },
      }),
      ...(additionalProperty.length && { additionalProperty }),
      // r2_thumbnails come back as http:// from the backend (confirmed live)
      // — same URL, forced to https so the schema itself is always clean.
      image: (product.image_format ?? []).map((src) => src.replace(/^http:\/\//i, "https://")),
      ...(itemConditionUrl && { itemCondition: itemConditionUrl }),
      offers: {
        "@type": "Offer",
        url: productUrl,
        price: Number(product.sale_price || product.regular_price || 0),
        priceCurrency: "AUD",
        availability: "https://schema.org/InStock",
        ...(itemConditionUrl && { itemCondition: itemConditionUrl }),
      },
    };

    return {
      "@type": "ListItem",
      position: i + 1,
      url: productUrl,
      item: vehicle,
    };
  });

  const graph = [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: `${BASE_URL}/`,
      name: "Motorhomes For Sale",
      inLanguage: "en-AU",
    },
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: "en-AU",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: { "@id": `${url}#itemlist` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumbItems.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.label,
        item: `${BASE_URL}${crumb.href}`,
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      name: `${name.replace(/^\d[\d,]*\s/, "")} – Page ${page}`,
      numberOfItems: items.length,
      itemListOrder: "https://schema.org/ItemListUnordered",
      itemListElement,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
