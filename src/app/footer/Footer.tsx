"use client";

import { useState } from "react";
import Image from "next/image";
import "./footer.css?=20";

// This site has no "-category" filter support — buildSlugFromFilters()
// never re-emits a category segment, so any "*-category" URL always 410s
// by design (not a data fluke). Browse by condition instead.
const BROWSE_MOTORHOMES = [
  { text: "All Motorhomes for Sale", href: "/listings/" },
  { text: "New Motorhomes", href: "/listings/new-condition/" },
  { text: "Used Motorhomes", href: "/listings/used-condition/" },
];

const BROWSE_STATES = [
  { text: "Victoria", href: "/listings/victoria-state/" },
  { text: "New South Wales", href: "/listings/new-south-wales-state/" },
  { text: "Queensland", href: "/listings/queensland-state/" },
  { text: "Western Australia", href: "/listings/western-australia-state/" },
  { text: "South Australia", href: "/listings/south-australia-state/" },
  { text: "Tasmania", href: "/listings/tasmania-state/" },
];

const POPULAR_LOCATIONS = [
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
const MORE_LOCATIONS = [
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

const SELLER_LOGIN_URL = "https://seller.marketplacenetwork.com.au/seller-login/";
const DEALER_SIGNUP_URL = "https://seller.marketplacenetwork.com.au/motorhome-dealer-subscription/";

const NETWORK_SITES = [
  { name: "caravansforsale.com.au",      href: "https://www.caravansforsale.com.au/",        logo: "/images/our_sites/cfs-logo-black.svg" },
  { name: "motorhomesforsale.com.au",    href: "/",                                            logo: "/images/our_sites/mfs-logo.svg", current: true },
  { name: "campervansforsale.au",        href: "https://www.campervansforsale.au/",          logo: "/images/our_sites/camper_logo.svg" },
  { name: "campingtrailersforsale.com.au", href: "https://www.campingtrailersforsale.com.au/", logo: "/images/our_sites/cts-logo.svg" },
];

const SELL_BY_LOCATION = [
  {
    state: "Victoria",
    stateSlug: "victoria",
    regions: [
      { label: "Melbourne", pageSlug: "melbourne" },
      { label: "Geelong", pageSlug: "geelong" },
      { label: "Ballarat", pageSlug: "ballarat" },
      { label: "Latrobe Gippsland", pageSlug: "latrobe-gippsland" },
      { label: "Mornington Peninsula", pageSlug: "mornington-peninsula" },
      { label: "Shepparton", pageSlug: "shepparton" },
      { label: "Hume", pageSlug: "hume" },
      { label: "Bendigo", pageSlug: "bendigo" },
      { label: "North West", pageSlug: "north-west" },
      { label: "Warrnambool And South West", pageSlug: "warrnambool-and-south-west" },
    ],
  },
  {
    state: "New South Wales",
    stateSlug: "new-south-wales",
    regions: [
      { label: "Sydney", pageSlug: "sydney" },
      { label: "Hunter", pageSlug: "hunter" },
      { label: "Newcastle", pageSlug: "newcastle" },
      { label: "Central Coast", pageSlug: "central-coast" },
      { label: "Coffs Harbour", pageSlug: "coffs-harbour" },
      { label: "Southern Highlands", pageSlug: "southern-highlands" },
      { label: "Richmond Tweed", pageSlug: "richmond-tweed" },
      { label: "Central West", pageSlug: "central-west" },
      { label: "Mid North Coast", pageSlug: "mid-north-coast" },
      { label: "Murray", pageSlug: "murray" },
      { label: "New England", pageSlug: "new-england" },
      { label: "Riverina", pageSlug: "riverina" },
      { label: "Capital", pageSlug: "capital" },
      { label: "Orana", pageSlug: "orana" },
      { label: "Illawarra", pageSlug: "illawarra" },
      { label: "Canberra", pageSlug: "canberra" },
    ],
  },
  {
    state: "Queensland",
    stateSlug: "queensland",
    regions: [
      { label: "Brisbane", pageSlug: "brisbane" },
      { label: "Gold Coast", pageSlug: "gold-coast" },
      { label: "Sunshine Coast", pageSlug: "sunshine-coast" },
      { label: "Moreton Bay North", pageSlug: "moreton-bay-north" },
      { label: "Moreton Bay South", pageSlug: "moreton-bay-south" },
      { label: "Logan Beaudesert", pageSlug: "logan-beaudesert" },
      { label: "Ipswich", pageSlug: "ipswich" },
      { label: "Toowoomba", pageSlug: "toowoomba" },
      { label: "Townsville", pageSlug: "townsville" },
      { label: "Cairns", pageSlug: "cairns" },
      { label: "Wide Bay", pageSlug: "wide-bay" },
      { label: "Mackay Isaac Whitsunday", pageSlug: "mackay-isaac-whitsunday" },
    ],
  },
  {
    state: "South Australia",
    stateSlug: "south-australia",
    regions: [
      { label: "Adelaide", pageSlug: "adelaide" },
      { label: "South East", pageSlug: "south-east" },
    ],
  },
  {
    state: "Western Australia",
    stateSlug: "western-australia",
    regions: [
      { label: "Perth", pageSlug: "perth" },
      { label: "Mandurah", pageSlug: "mandurah" },
      { label: "Bunbury", pageSlug: "bunbury" },
      { label: "Outback South", pageSlug: "outback-south" },
    ],
  },
  {
    state: "Tasmania",
    stateSlug: "tasmania",
    regions: [
      { label: "Hobart", pageSlug: "hobart" },
      { label: "Launceston", pageSlug: "launceston" },
      { label: "North West", pageSlug: "north-west" },
    ],
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [sellByLocationOpen, setSellByLocationOpen] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);

  return (
    <footer className="ftr">
        <div className="container">

          {/* ── Link columns ── */}
          <div className="ftr-cols">
            <div className="ftr-col">
              <h4 className="ftr-col__title">Browse Motorhomes</h4>
              <ul className="ftr-col__list">
                {BROWSE_MOTORHOMES.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
              </ul>
            </div>

            <div className="ftr-col">
              <h4 className="ftr-col__title">Browse by State</h4>
              <ul className="ftr-col__list">
                {BROWSE_STATES.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
              </ul>
            </div>

            <div className="ftr-col">
              <h4 className="ftr-col__title">Popular Locations</h4>
              <ul className="ftr-col__list">
                {POPULAR_LOCATIONS.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
                {showAllLocations && MORE_LOCATIONS.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
                {!showAllLocations && (
                  <li>
                    <button
                      type="button"
                      className="ftr-col__viewall ftr-col__viewall--btn"
                      onClick={() => setShowAllLocations(true)}
                    >
                      View All Locations
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <div className="ftr-col">
              <h4 className="ftr-col__title">Private Sellers</h4>
              <ul className="ftr-col__list">
                <li><a href="/sell-my-motorhome/">Sell My Motorhome</a></li>
                <li>
                  <a
                    href="#sell-by-location"
                    onClick={(e) => {
                      e.preventDefault();
                      setSellByLocationOpen(true);
                      document.getElementById("sell-by-location")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    Sell by Location
                  </a>
                </li>
                <li><a href={SELLER_LOGIN_URL}>Seller Login</a></li>
              </ul>
              <h4 className="ftr-col__title ftr-col__title--spaced">For Dealers</h4>
              <ul className="ftr-col__list">
                <li><a href={SELLER_LOGIN_URL}>Dealer Login</a></li>
                <li><a href="/dealer-advertising/">Dealer Advertising</a></li>
                <li><a href={DEALER_SIGNUP_URL}>Dealer Sign Up</a></li>
              </ul>
            </div>

            <div className="ftr-col">
              <h4 className="ftr-col__title">Guides &amp; Support</h4>
              <ul className="ftr-col__list">
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/buyer-safety-guide/">Buyer Safety Guide</a></li>
                <li><a href="/about-us/">About Us</a></li>
                <li><a href="/contact/">Contact Us</a></li>
              </ul>
            </div>
          </div>

          {/* ── Our Marketplace Network ── */}
          <div className="ftr-network">
            <h4 className="ftr-network__title">Our Marketplace Network</h4>
            <div className="ftr-network__grid">
              {NETWORK_SITES.map((s) =>
                s.current ? (
                  <div key={s.name} className="ftr-network__card ftr-network__card--current">
                    <Image src={s.logo} alt={s.name} width={140} height={32} unoptimized />
                  </div>
                ) : (
                  <a
                    key={s.name}
                    href={s.href}
                    className="ftr-network__card"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image src={s.logo} alt={s.name} width={140} height={32} unoptimized />
                  </a>
                )
              )}
            </div>
          </div>

          {/* ── Sell by Location accordion ── */}
          <div className="ftr-accordion" id="sell-by-location">
            <button
              type="button"
              className="ftr-accordion__bar"
              onClick={() => setSellByLocationOpen((v) => !v)}
              aria-expanded={sellByLocationOpen}
              aria-controls="sell-by-location-panel"
            >
              <span>
                <span className="ftr-accordion__title">Sell My Motorhome by Location</span>
                <span className="ftr-accordion__sub">Browse selling pages by state, city and region</span>
              </span>
              <svg
                className={`ftr-accordion__icon${sellByLocationOpen ? " ftr-accordion__icon--open" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {sellByLocationOpen && (
              <div className="ftr-accordion__panel" id="sell-by-location-panel">
                {SELL_BY_LOCATION.map((s) => (
                  <div key={s.stateSlug} className="ftr-accordion__col">
                    <a href={`/sell-my-motorhome/${s.stateSlug}/`} className="ftr-accordion__state-title">
                      Sell My Motorhome in {s.state}
                    </a>
                    <ul>
                      {s.regions.map((r) => (
                        <li key={r.pageSlug}>
                          <a href={`/sell-my-motorhome/${s.stateSlug}/${r.pageSlug}/`}>
                            Sell My Motorhome in {r.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom bar ── */}
          <div className="ftr-bottom">
            <ul className="ftr-bottom__links">
              <li><a href="/terms-conditions/" rel="nofollow">Terms &amp; Conditions</a></li>
              <li><a href="/privacy-policy/" rel="nofollow">Privacy Policy</a></li>
              <li><a href="/privacy-collection-statement/" rel="nofollow">Privacy Collection Statement</a></li>
              <li><a href="/cookie-policy/" rel="nofollow">Cookie Policy</a></li>
            </ul>
            <p className="ftr-bottom__copy">
              © {currentYear ?? "----"} Marketplace Network Pty Ltd · ABN 70 694 987 052
            </p>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
