const AUS_ABBR: Record<string, string> = {
  "VICTORIA": "VIC",
  "NEW SOUTH WALES": "NSW",
  "QUEENSLAND": "QLD",
  "SOUTH AUSTRALIA": "SA",
  "WESTERN AUSTRALIA": "WA",
  "TASMANIA": "TAS",
  "NORTHERN TERRITORY": "NT",
  "AUSTRALIAN CAPITAL TERRITORY": "ACT",
};

const toTitleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Always show just the state (e.g. "victoria" → "VIC"), same as the rest of
 *  the site — home_featured's `location` field is a suburb/region/state
 *  join (e.g. "Brisbane, Queensland") and shouldn't be shown as-is. Only
 *  falls back to it when an item has no state at all. */
export function getLocationLabel(item: { location?: string; state?: string }): string {
  const stateName = item.state?.replace(/-/g, " ") ?? "";
  if (!stateName) return item.location ?? "";
  return AUS_ABBR[stateName.toUpperCase()] ?? toTitleCase(stateName);
}
