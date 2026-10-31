// Footer's /listings/ links — kept in a plain module so layout.tsx (server)
// can count-check the same hrefs the client Footer renders.

// This site has no "-category" filter support — buildSlugFromFilters()
// never re-emits a category segment, so any "*-category" URL always 410s
// by design (not a data fluke). Browse by condition instead.
export const BROWSE_MOTORHOMES = [
  { text: "All Motorhomes for Sale", href: "/listings/" },
  { text: "New Motorhomes", href: "/listings/new-condition/" },
  { text: "Used Motorhomes", href: "/listings/used-condition/" },
];

export const BROWSE_STATES = [
  { text: "Victoria", href: "/listings/victoria-state/" },
  { text: "New South Wales", href: "/listings/new-south-wales-state/" },
  { text: "Queensland", href: "/listings/queensland-state/" },
  { text: "Western Australia", href: "/listings/western-australia-state/" },
  { text: "South Australia", href: "/listings/south-australia-state/" },
  { text: "Tasmania", href: "/listings/tasmania-state/" },
];

export const POPULAR_LOCATIONS = [
  { text: "Adelaide",    href: "/listings/south-australia-state/adelaide-region/" },
  { text: "Brisbane",    href: "/listings/queensland-state/brisbane-region/" },
  { text: "Gold Coast",  href: "/listings/queensland-state/gold-coast-region/" },
  { text: "Melbourne",   href: "/listings/victoria-state/melbourne-region/" },
  { text: "Perth",       href: "/listings/western-australia-state/perth-region/" },
  { text: "Sydney",      href: "/listings/new-south-wales-state/sydney-region/" },
  { text: "Cairns",      href: "/listings/queensland-state/cairns-region/" },
];

// Shown when "View All Locations" is expanded — same extra city list as
// home-demo/HomeLocationSection.tsx's MINOR_CITIES.
export const MORE_LOCATIONS = [
  { text: "Canberra",       href: "/listings/australian-capital-territory-state/australian-capital-territory-region/" },
  { text: "Darwin",         href: "/listings/northern-territory-state/darwin-region/" },
  { text: "Geelong",        href: "/listings/victoria-state/geelong-region/" },
  { text: "Hobart",         href: "/listings/tasmania-state/hobart-region/" },
  { text: "Newcastle",      href: "/listings/new-south-wales-state/newcastle-region/" },
  { text: "Sunshine Coast", href: "/listings/queensland-state/sunshine-coast-region/" },
  { text: "Townsville",     href: "/listings/queensland-state/townsville-region/" },
  { text: "Wollongong",     href: "/listings/new-south-wales-state/illawarra-region/" },
  { text: "Ballarat",       href: "/listings/victoria-state/ballarat-region/" },
];

export const FOOTER_LISTING_HREFS = [
  ...BROWSE_MOTORHOMES,
  ...BROWSE_STATES,
  ...POPULAR_LOCATIONS,
  ...MORE_LOCATIONS,
].map((l) => l.href);
