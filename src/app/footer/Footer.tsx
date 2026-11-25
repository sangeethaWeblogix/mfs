"use client";

import { useState } from "react";
import Image from "next/image";
import "./footer.css?=20";
import { BROWSE_MOTORHOMES, BROWSE_STATES, POPULAR_LOCATIONS, MORE_LOCATIONS } from "./footerLinks";

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

interface Props {
  /** Server-checked listings hrefs (fetched in layout.tsx) —
   * links missing from it would 410 or show 0 results. Omitted = show all. */
  linkableHrefs?: string[];
}

const Footer = ({ linkableHrefs }: Props) => {
  const currentYear = new Date().getFullYear();
  const linkable = (l: { href: string }) => !linkableHrefs || linkableHrefs.includes(l.href);
  const browseMotorhomes = BROWSE_MOTORHOMES.filter(linkable);
  const browseStates = BROWSE_STATES.filter(linkable);
  const popularLocations = POPULAR_LOCATIONS.filter(linkable);
  const moreLocations = MORE_LOCATIONS.filter(linkable);
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
                {browseMotorhomes.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
              </ul>
            </div>

            <div className="ftr-col">
              <h4 className="ftr-col__title">Browse by State</h4>
              <ul className="ftr-col__list">
                {browseStates.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
              </ul>
            </div>

            <div className="ftr-col">
              <h4 className="ftr-col__title">Popular Locations</h4>
              <ul className="ftr-col__list">
                {popularLocations.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
                {showAllLocations && moreLocations.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.text}</a></li>
                ))}
                {!showAllLocations && moreLocations.length > 0 && (
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
              <li><a href="/site-map/">Site Map</a></li>
            </ul>
            <div className="ftr-bottom__right">
              <p className="ftr-bottom__copy">
                © {currentYear ?? "----"} Marketplace Network Pty Ltd · ABN 70 694 987 052
              </p>
              <div className="ftr-bottom__social">
                <a
                  href="https://www.facebook.com/motorhomesforsaleaustralia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="ftr-bottom__social-icon ftr-bottom__social-icon--fb"
                >
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/motorhomesforsale.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="ftr-bottom__social-icon ftr-bottom__social-icon--ig"
                >
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
