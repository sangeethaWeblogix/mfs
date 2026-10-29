/**
 * The /pool listing endpoint only returns a flat `title` string per
 * product — no separate make/model/chassis/fuel/transmission fields the way
 * the full product-detail endpoint does (fetching detail for every item on
 * a 24-result listings page isn't practical). This derives those fields
 * from the title text instead, using the site's own real make and
 * vehicle-make (chassis) lists — already fetched for the Motorhome Make /
 * Base Vehicle Make filter dropdowns — as the source of truth for what to
 * match, rather than guessing from free text. Best-effort: titles don't
 * follow a single fixed template, so model/features extraction is
 * heuristic and may legitimately come back empty for an unusual title.
 */

export type NameItem = { name: string };

const FEATURE_KEYWORDS = [
  "reverse camera", "reversing camera", "rear view camera", "wireless camera",
  "lithium battery", "solar panels", "solar panel", "solar system",
  "awning", "slide out", "slide-out", "tow bar",
  "microwave", "turbocharged", "diesel heater", "gas heater",
  "queen bed", "king bed", "bunk beds", "bunk bed",
  "air conditioner", "airconditioning", "air conditioning", "airconditioner",
  "outdoor kitchen", "cruise control", "twin beds", "dual axle",
  "independent suspension", "full ensuite", "outside shower",
  "hot water system", "ducted heating", "reverse cycle",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findEarliestMatch(text: string, patterns: RegExp[]): number {
  let earliest = -1;
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m.index !== undefined && (earliest === -1 || m.index < earliest)) {
      earliest = m.index;
    }
  }
  return earliest;
}

function titleCaseFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export type ParsedVehicleTitle = {
  year?: string;
  make?: string;
  model?: string;
  chassis?: string;
  fuelType?: string;
  transmission?: string;
  engineDisplacementLtr?: number;
  features?: string;
};

export function parseVehicleTitle(
  title: string,
  makes: NameItem[],
  chassisMakes: NameItem[]
): ParsedVehicleTitle {
  const result: ParsedVehicleTitle = {};
  let rest = title.trim();

  const yearMatch = rest.match(/^(\d{4})\s+/);
  if (yearMatch) {
    result.year = yearMatch[1];
    rest = rest.slice(yearMatch[0].length);
  }

  // Make: longest-name-first match at the very start of the remaining text.
  const sortedMakes = [...makes].sort((a, b) => b.name.length - a.name.length);
  let remainder = rest;
  for (const m of sortedMakes) {
    if (!m.name) continue;
    const re = new RegExp(`^${escapeRegex(m.name)}\\b`, "i");
    if (re.test(remainder)) {
      result.make = m.name;
      remainder = remainder.slice(m.name.length).trim();
      break;
    }
  }

  // Chassis: search the whole original title (it can appear even where the
  // make itself consumed the same word, e.g. a van badged as its own chassis
  // brand — "Mercedes-Benz Sprinter...").
  const sortedChassis = [...chassisMakes].sort((a, b) => b.name.length - a.name.length);
  for (const c of sortedChassis) {
    if (!c.name) continue;
    const re = new RegExp(`\\b${escapeRegex(c.name)}\\b`, "i");
    if (re.test(title)) {
      result.chassis = c.name
        .split("-")
        .map((part) => titleCaseFirst(part))
        .join("-");
      break;
    }
  }

  // Everything after make, up to whichever of these markers appears first,
  // is the model. No marker found at all -> use the rest as-is.
  const markerPatterns: RegExp[] = [
    /\d+['’]\s?\d*/, // length like 23'11 or 26'
    /\b\d+\s?ft\b/i,
    /\b(automatic|manual)\b/i,
    /\b(diesel|petrol)\b(?!\s+heater)/i,
    ...FEATURE_KEYWORDS.map((k) => new RegExp(`\\b${escapeRegex(k)}\\b`, "i")),
  ];
  if (result.chassis) {
    markerPatterns.push(new RegExp(`\\b${escapeRegex(result.chassis)}\\b`, "i"));
  }
  const cutIdx = findEarliestMatch(remainder, markerPatterns);
  const model = (cutIdx >= 0 ? remainder.slice(0, cutIdx) : remainder).trim();
  if (model) result.model = model;

  const fuelMatch = remainder.match(/\b(diesel|petrol)\b(?!\s+heater)/i);
  if (fuelMatch) result.fuelType = titleCaseFirst(fuelMatch[1]);

  const transMatch = remainder.match(/\b(automatic|manual)\b/i);
  if (transMatch) result.transmission = titleCaseFirst(transMatch[1]);

  const engineMatch = remainder.match(/(\d+(?:\.\d+)?)\s*L\b/);
  if (engineMatch) result.engineDisplacementLtr = parseFloat(engineMatch[1]);

  const foundFeatures: string[] = [];
  for (const keyword of FEATURE_KEYWORDS) {
    const re = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
    if (re.test(remainder) && !foundFeatures.some((f) => f.toLowerCase() === keyword)) {
      foundFeatures.push(keyword);
    }
  }
  if (foundFeatures.length) {
    result.features = foundFeatures
      .map((f, i) => (i === 0 ? titleCaseFirst(f) : f.toLowerCase()))
      .join(", ");
  }

  return result;
}
