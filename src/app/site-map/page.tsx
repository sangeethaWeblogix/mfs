import type { Metadata } from "next";
import "./site-map.css";
import { fetchSitemapPaths, filterIndexable } from "@/lib/sitemapApi";
import { parseSlugToFilters } from "@/app/components/urlBuilder";
import { STATES, buildAllRegionsForState } from "@/app/listings/browseSectionShared";
import {
  PRICE_BANDS_ORDERED,
  GVM_BANDS_ORDERED,
  LENGTH_BANDS_ORDERED,
  SLEEP_BANDS_ORDERED,
} from "@/utils/seo/band-utils";

// A human-readable HTML sitemap, separate from the XML sitemaps — gives
// Google (and visitors) a real, single-page set of internal links into the
// many filter-combination pages (state+price, state+weight, state+length,
// state+sleeping-capacity, make+state, vehicle-make+region, etc.) that
// otherwise have no other page linking to them anywhere on the site
// (confirmed via Ahrefs' "Orphan page" reports). Modelled on the sister
// site's own /site-map/ page (campervansforsale.au/site-map/).
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Site Map | Motorhomes for Sale",
  description: "Browse every way to find a motorhome for sale on MotorhomesForSale.com.au — by state, region, make, model, price, weight, length and sleeping capacity.",
  alternates: { canonical: "https://www.motorhomesforsale.com.au/site-map/" },
  robots: "index, follow",
};

function titleCase(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Matches the sister site's own /site-map/ convention exactly
// (campervansforsale.au/site-map/) rather than this site's own page
// <title>/H1 wording — short state abbreviations, no "in Australia" on
// unscoped pages, "{Make} [Model] Motorhomes for Sale[ in {Place}]".
const STATE_ABBR: Record<string, string> = {
  "new south wales": "NSW",
  queensland: "QLD",
  "western australia": "WA",
  victoria: "VIC",
  "south australia": "SA",
  tasmania: "TAS",
  "northern territory": "NT",
  "australian capital territory": "ACT",
};

function stateAbbr(state: string): string {
  return STATE_ABBR[state.toLowerCase()] ?? titleCase(state);
}

function fmtMoney(n: string): string {
  return `$${parseInt(n, 10).toLocaleString("en-AU")}`;
}

/** Just the filter-specific phrase (no "Motorhomes for Sale" prefix) —
 * "Under $50,000", "$50,000 – $75,000", "Under 3,500kg GVM", "Under 20ft",
 * "Sleeping 2 People" — matching the reference site's own band wording. */
function bandPhrase(parsed: ReturnType<typeof parseSlugToFilters>): string {
  if (parsed.to_price && parsed.from_price) return `${fmtMoney(String(parsed.from_price))} – ${fmtMoney(String(parsed.to_price))}`;
  if (parsed.to_price) return `Under ${fmtMoney(String(parsed.to_price))}`;
  if (parsed.from_price) return `Over ${fmtMoney(String(parsed.from_price))}`;

  if (parsed.maxKg && parsed.minKg) return `${Number(parsed.minKg).toLocaleString("en-AU")}kg – ${Number(parsed.maxKg).toLocaleString("en-AU")}kg GVM`;
  if (parsed.maxKg) return `Under ${Number(parsed.maxKg).toLocaleString("en-AU")}kg GVM`;
  if (parsed.minKg) return `Over ${Number(parsed.minKg).toLocaleString("en-AU")}kg GVM`;

  if (parsed.to_length && parsed.from_length) return `${parsed.from_length}ft – ${parsed.to_length}ft`;
  if (parsed.to_length) return `Under ${parsed.to_length}ft`;
  if (parsed.from_length) return `Over ${parsed.from_length}ft`;

  if (parsed.from_sleep && parsed.to_sleep && parsed.from_sleep !== parsed.to_sleep) return `Sleeping ${parsed.from_sleep} – ${parsed.to_sleep} People`;
  if (parsed.from_sleep && parsed.to_sleep) return `Sleeping ${parsed.from_sleep} People`;
  if (parsed.to_sleep) return `Sleeping Up to ${parsed.to_sleep} People`;
  if (parsed.from_sleep) return `Sleeping Over ${parsed.from_sleep} People`;

  return "";
}

function placePhrase(parsed: ReturnType<typeof parseSlugToFilters>): string {
  if (!parsed.state) return "";
  const state = stateAbbr(parsed.state);
  return parsed.region ? `${titleCase(parsed.region)}, ${state}` : state;
}

/** Builds a human link label for any /listings/ path, following the sister
 * site's own /site-map/ wording. Vehicle-make segments are spliced in by
 * hand since they're not a concept parseSlugToFilters' make/model cover. */
function labelForPath(path: string): string {
  const segments = path.replace(/\/$/, "").split("/").filter(Boolean);
  const vehicleMakeSeg = segments.find((s) => s.endsWith("-vehicle-make"));
  const rest = vehicleMakeSeg ? segments.filter((s) => s !== vehicleMakeSeg) : segments;
  const parsed = parseSlugToFilters(rest);

  const makeName = vehicleMakeSeg
    ? titleCase(vehicleMakeSeg.replace(/-vehicle-make$/, ""))
    : parsed.make
      ? titleCase(parsed.make)
      : "";
  const modelName = parsed.model ? titleCase(parsed.model) : "";

  const noun = [makeName, modelName].filter(Boolean).join(" ");
  const base = noun ? `${noun} Motorhomes for Sale` : "Motorhomes for Sale";

  const band = bandPhrase(parsed);
  const place = placePhrase(parsed);

  if (band && place) return `${base} ${band} in ${place}`;
  if (band) return `${base} ${band}`;
  if (place) return `${base} in ${place}`;
  return base;
}

type LinkItem = { name: string; href: string };

function toLinks(paths: string[]): LinkItem[] {
  return paths
    .map((p) => ({ name: labelForPath(p), href: `/listings/${p}` }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function Section({ title, links }: { title: string; links: LinkItem[] }) {
  if (links.length === 0) return null;
  return (
    <section className="sm-section">
      <h2 className="sm-section__title">{title}</h2>
      <ul className="sm-section__list">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.name}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function SiteMapPage() {
  const [
    statePaths,
    regionPaths,
    makePaths,
    vehicleMakePaths,
    modelPaths,
    stateMakePaths,
    regionMakePaths,
    stateVehicleMakePaths,
    regionVehicleMakePaths,
  ] = await Promise.all([
    fetchSitemapPaths("states", revalidate),
    fetchSitemapPaths("regions", revalidate),
    fetchSitemapPaths("makes", revalidate),
    fetchSitemapPaths("vehicle-makes", revalidate),
    fetchSitemapPaths("models", revalidate),
    fetchSitemapPaths("state-make", revalidate),
    fetchSitemapPaths("region-make", revalidate),
    fetchSitemapPaths("state-vehicle-make", revalidate),
    fetchSitemapPaths("region-vehicle-make", revalidate),
  ]);

  const bareBandLinks = toLinks(
    filterIndexable(
      [...PRICE_BANDS_ORDERED, ...GVM_BANDS_ORDERED, ...LENGTH_BANDS_ORDERED, ...SLEEP_BANDS_ORDERED].map((b) => `${b}/`),
      "listings"
    )
  );

  const stateBandPaths: string[] = [];
  for (const state of STATES) {
    const stateSlug = state.href.replace(/^\/listings\/|\/$/g, "");
    for (const band of [...PRICE_BANDS_ORDERED, ...GVM_BANDS_ORDERED, ...LENGTH_BANDS_ORDERED, ...SLEEP_BANDS_ORDERED]) {
      stateBandPaths.push(`${stateSlug}/${band}/`);
    }
  }
  const stateBandLinks = toLinks(filterIndexable(stateBandPaths, "listings"));

  const regionLinks: LinkItem[] = STATES.flatMap((state) =>
    buildAllRegionsForState(state.name).map((r) => ({
      name: labelForPath(r.href.replace(/^\/listings\//, "")),
      href: r.href,
    }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="sm-page">
      <div className="container">
        <h1 className="sm-page__title">Site Map</h1>

        <Section
          title="Browse Motorhomes"
          links={[
            { name: "All Motorhomes for Sale", href: "/listings/" },
            { name: "New Motorhomes for Sale", href: "/listings/new-condition/" },
            { name: "Used Motorhomes for Sale", href: "/listings/used-condition/" },
          ]}
        />
        <Section title="Motorhomes for Sale by State" links={toLinks(filterIndexable(statePaths, "listings"))} />
        <Section title="Motorhomes for Sale by Region" links={regionLinks.length ? regionLinks : toLinks(filterIndexable(regionPaths, "listings"))} />
        <Section title="Motorhomes for Sale by Make" links={toLinks(filterIndexable(makePaths, "listings"))} />
        <Section title="Motorhomes for Sale by Vehicle Make" links={toLinks(filterIndexable(vehicleMakePaths, "listings"))} />
        <Section title="Motorhomes for Sale by Model" links={toLinks(filterIndexable(modelPaths, "listings"))} />
        <Section title="Motorhomes for Sale by Make and State" links={toLinks(filterIndexable(stateMakePaths, "listings"))} />
        <Section title="Motorhomes for Sale by Make and Region" links={toLinks(filterIndexable(regionMakePaths, "listings"))} />
        <Section title="Motorhomes for Sale by Vehicle Make and State" links={toLinks(filterIndexable(stateVehicleMakePaths, "listings"))} />
        <Section title="Motorhomes for Sale by Vehicle Make and Region" links={toLinks(filterIndexable(regionVehicleMakePaths, "listings"))} />
        <Section title="Motorhomes for Sale by Price" links={toLinks(filterIndexable(PRICE_BANDS_ORDERED.map((b) => `${b}/`), "listings"))} />
        <Section title="Motorhomes for Sale by Length" links={toLinks(filterIndexable(LENGTH_BANDS_ORDERED.map((b) => `${b}/`), "listings"))} />
        <Section title="Motorhomes for Sale by Weight (GVM)" links={toLinks(filterIndexable(GVM_BANDS_ORDERED.map((b) => `${b}/`), "listings"))} />
        <Section title="Motorhomes for Sale by Sleeping Capacity" links={toLinks(filterIndexable(SLEEP_BANDS_ORDERED.map((b) => `${b}/`), "listings"))} />
        <Section title="Motorhomes for Sale by Price, Size, Weight and Sleeping Capacity, by State" links={stateBandLinks} />
      </div>
    </div>
  );
}
