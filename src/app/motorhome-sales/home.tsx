"use client";

import dynamic from "next/dynamic";
import HomeFeatured from "./HomeFeatured";
import HomeTypeSection from "./HomeTypeSection";
import HomeStateSection from "./HomeStateSection";
import HomeLocationSection from "./HomeLocationSection";
import HomeBuyerGuide from "./HomeBuyerGuide";
import "./main.css";

const BlogSection = dynamic(() => import("../blogSection"), { ssr: false });


interface Item {
  label: string;
  capacity: number;
  slug: string;
  permalink: string;
  caravan_count: string;
  starting_price: number;
  display_text: string;
  state: string;
  short_label: string;
  short_count: string;
  region: string;
}

interface Props {
  stateBands: Item[];
  requirements: any;
  homeblog: any[];
}

const CITY_LINKS = [
  { text: "Adelaide",       href: "/listings/south-australia-state/adelaide-region/" },
  { text: "Brisbane",       href: "/listings/queensland-state/brisbane-region/" },
  { text: "Gold Coast",     href: "/listings/queensland-state/gold-coast-region/" },
  { text: "Melbourne",      href: "/listings/victoria-state/melbourne-region/" },
  { text: "Perth",          href: "/listings/western-australia-state/perth-region/" },
  { text: "Sydney",         href: "/listings/new-south-wales-state/sydney-region/" },
  { text: "Cairns",         href: "/listings/queensland-state/cairns-region/" },
  { text: "Canberra",       href: "/listings/australian-capital-territory-state/" },
  { text: "Darwin",         href: "/listings/northern-territory-state/" },
  { text: "Geelong",        href: "/listings/victoria-state/geelong-region/" },
  { text: "Hobart",         href: "/listings/tasmania-state/hobart-region/" },
  { text: "Newcastle",      href: "/listings/new-south-wales-state/newcastle-region/" },
  { text: "Sunshine Coast", href: "/listings/queensland-state/sunshine-coast-region/" },
  { text: "Townsville",     href: "/listings/queensland-state/townsville-region/" },
  { text: "Wollongong",     href: "/listings/new-south-wales-state/illawarra-region/" },
  { text: "Ballarat",       href: "/listings/victoria-state/ballarat-region/" },
];

const SEARCH_FILTERS = [
  {
    label: "By Budget",
    icon: "$",
    links: [
      { text: "Under $50,000",         href: "/listings/?max_price=50000" },
      { text: "Under $80,000",         href: "/listings/?max_price=80000" },
      { text: "Under $100,000",        href: "/listings/?max_price=100000" },
      { text: "Over $100,000",         href: "/listings/?min_price=100000" },
      { text: "Second Hand Off Road",  href: "/listings/?condition=used" },
      { text: "New Off Road Motorhomes", href: "/listings/?condition=new" },
    ],
  },
  {
    label: " By Weight (GVM)",
    icon: "⚖",
    links: [
      { text: "Under 1500kg", href: "/listings/?max_gvm=1500" },
      { text: "Under 2000kg", href: "/listings/?max_gvm=2000" },
      { text: "Under 2500kg", href: "/listings/?max_gvm=2500" },
      { text: "Under 3000kg", href: "/listings/?max_gvm=3000" },
      { text: "Over 3000kg",  href: "/listings/?min_gvm=3000" },
    ],
  },
  {
    label: "By Size (Length)",
    icon: "↔",
    links: [
      { text: "14ft",        href: "/listings/?length=14" },
      { text: "16ft",        href: "/listings/?length=16" },
      { text: "18ft 6",      href: "/listings/?length=18" },
      { text: "19ft",        href: "/listings/?length=19" },
      { text: "Single Axle", href: "/listings/?axle=single" },
    ],
  },
  {
    label: "By Features",
    icon: "✦",
    links: [
      { text: "Pop Top",     href: "/listings/pop-top-caravans/" },
      { text: "Lightweight", href: "/listings/lightweight-caravans/" },
      { text: "Off Grid",    href: "/listings/?feature=off-grid" },
      { text: "With Ensuite",href: "/listings/?feature=ensuite" },
      { text: "Aluminium",   href: "/listings/?feature=aluminium" },
    ],
  },
];

export default function OffRoadCaravansPage({ stateBands }: Props) {
  return (
    <div style={{ overflowX: "hidden" }}>

      {/* ── Hero Banner ── */}
      <section className="cs-banner">
        <div className="cs-banner__inner">
          <div className="cs-banner__img">
            <img src="/images/caravn-sales-banner.jpg" alt="Motorhome Sales Australia" />
          </div>
          <div className="cs-banner__content">
            <h1 className="cs-banner__title">
              <span className="cs-banner__title-orange">Motorhome Sales</span>
              <span className="cs-banner__title-dark">Australia</span>
            </h1>
            <p className="cs-banner__desc">
              Find the best motorhome sales across Australia and connect with trusted dealers and private sellers. Browse thousands of new and used listings—including off-road, family, touring, luxury, and pop-top motorhomes—and easily filter by location, price, size and towing weight to find the perfect van for your next adventure.
            </p>
            <div className="cs-banner__btns">
              <a href="/listings/" className="cs-banner__btn cs-banner__btn--primary">Browse All Motorhomes for Sale</a>
              <a href="/sell-my-motorhome/" className="cs-banner__btn cs-banner__btn--outline">Sell Your Motorhome</a>
            </div>
          </div>
        </div>
        <div className="cs-banner__stats">
          <div className="cs-banner__stat">
            <img src="/images/category.svg" alt="" className="cs-banner__stat-icon" />
            <div className="cs-banner__stat-text">
              <strong>7,000+</strong>
              <span>Active Motorhome Sales<br></br>Australia Wide</span>
            </div>
          </div>
          <div className="cs-banner__stat">
            <img src="/images/australia.png" alt="" className="cs-banner__stat-icon" />
            <div className="cs-banner__stat-text">
              <strong>All States & Territories</strong>
              <span>Browse Listings<br></br>Across Australia</span>
            </div>
          </div>
          <div className="cs-banner__stat">
            <img src="/images/seller.svg" alt="" className="cs-banner__stat-icon" />
            <div className="cs-banner__stat-text">
              <strong>Dealers & Private Sellers</strong>
              <span>Compare New &<br></br>Used Motorhomes</span>
            </div>
          </div>
          <div className="cs-banner__stat">
            <img src="/images/dollar.png" alt="" className="cs-banner__stat-icon" />
            <div className="cs-banner__stat-text">
              <strong>Safe & Secure</strong>
              <span>Buy with<br></br> Confidence</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <HomeFeatured />

      {/* ── Sell CTA Banner ── */}
      <section className="caravans_by_state related-products services">
        <div className="container">
          <div className="sell-banner">
            <div className="sell-content">
              <h3>Motorhome Sales Made Hassle-Free & Straightforward</h3>
              <p className="desc">List your van on Australia’s leading motorhome sales marketplace and easily connect with thousands of serious buyers</p>
              <div className="btns_two">
                <a href="/dealer-advertising/" className="btn primary-btn">Dealer Sign Up</a>
                <a href="/sell-my-motorhome/" className="btn secondary-btn">Private Seller - Click Here</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by State ── */}
      <HomeStateSection stateBands={stateBands} title="Browse Motorhomes Listings in Australia by State" />

      {/* ── Location + Search Your Way ── */}
      <HomeLocationSection />

      {/* ── Browse by Type — Hidden for now (site has no category filter) ──
      <HomeTypeSection />
      */}

      {/* ── Buyer Guide + Why Australians ── */}
      <HomeBuyerGuide />

      {/* ── Latest Blogs ── */}
      <BlogSection posts={[]} />


    </div>
  );
}
