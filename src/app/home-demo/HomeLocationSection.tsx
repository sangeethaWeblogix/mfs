 "use client";

import Image from "next/image";

const MAJOR_CITIES = [
  { name: "Adelaide",   href: "/listings/south-australia-state/adelaide-region/",    imgSrc: "/images/Adelaide.png"   },
  { name: "Brisbane",   href: "/listings/queensland-state/brisbane-region/",         imgSrc: "/images/Brisbane.png"   },
  { name: "Gold Coast", href: "/listings/queensland-state/gold-coast-region/",       imgSrc: "/images/Gold-Coast.png" },
  { name: "Melbourne",  href: "/listings/victoria-state/melbourne-region/",          imgSrc: "/images/Melbourne.png"  },
  { name: "Perth",      href: "/listings/western-australia-state/perth-region/",     imgSrc: "/images/Perth.png"      },
  { name: "Sydney",     href: "/listings/new-south-wales-state/sydney-region/",      imgSrc: "/images/Sydney.png"     },
];

const MINOR_CITIES = [
  { name: "Cairns",         href: "/listings/queensland-state/cairns-region/" },
  { name: "Canberra",       href: "/listings/australian-capital-territory-state/australian-capital-territory-region/" },
  { name: "Darwin",         href: "/listings/northern-territory-state/darwin-region/" },
  { name: "Geelong",        href: "/listings/victoria-state/geelong-region/" },
  { name: "Hobart",         href: "/listings/tasmania-state/hobart-region/" },
  { name: "Newcastle",      href: "/listings/new-south-wales-state/newcastle-region/" },
  { name: "Sunshine Coast", href: "/listings/queensland-state/sunshine-coast-region/" },
  { name: "Townsville",     href: "/listings/queensland-state/townsville-region/" },
  { name: "Wollongong",     href: "/listings/new-south-wales-state/illawarra-region/" },
  { name: "Ballarat",       href: "/listings/victoria-state/ballarat-region/" },
];

const FILTERS = [
  {
    icon: <Image src="/images/Budget.png" alt="Budget" width={24} height={24} unoptimized />,
    label: "By Price",
    items: [
      { text: "Under $100,000",       href: "/listings/under-100000/" },
      { text: "$100,000 – $150,000",  href: "/listings/between-100000-150000/" },
      { text: "$150,000 – $200,000",  href: "/listings/between-150000-200000/" },
      { text: "$200,000 – $300,000",  href: "/listings/between-200000-300000/" },
      { text: "Over $300,000",        href: "/listings/over-300000/" },
    ],
  },
  {
    icon: <Image src="/images/ATM.png" alt="Weight GVM" width={24} height={24} unoptimized />,
    label: " By Weight (GVM)",
    items: [
      { text: "Under 3,500kg",         href: "/listings/under-3500-kg-gvm/" },
      { text: "3,500kg – 4,500kg",     href: "/listings/between-3500-kg-4500-kg-gvm/" },
      { text: "4,500kg – 6,000kg",     href: "/listings/between-4500-kg-6000-kg-gvm/" },
      { text: "6,000kg – 8,000kg",     href: "/listings/between-6000-kg-8000-kg-gvm/" },
      { text: "Over 8,000kg",          href: "/listings/over-8000-kg-gvm/" },
    ],
  },
  {
    icon: <Image src="/images/Length.png" alt="Length" width={24} height={24} unoptimized />,
    label: "By Size (Length)",
    items: [
      { text: "Under 20ft",     href: "/listings/under-20-length-in-feet/" },
      { text: "20ft – 23ft",    href: "/listings/between-20-23-length-in-feet/" },
      { text: "23ft – 26ft",    href: "/listings/between-23-26-length-in-feet/" },
      { text: "26ft – 30ft",    href: "/listings/between-26-30-length-in-feet/" },
      { text: "Over 30ft",      href: "/listings/over-30-length-in-feet/" },
    ],
  },
  {
    icon: <Image src="/images/Sleeping.png" alt="Sleeping" width={24} height={24} unoptimized />,
    label: "By Sleeping Capacity",
    items: [
      { text: "2 Berth",     href: "/listings/2-people-sleeping-capacity/" },
      { text: "3 Berth",     href: "/listings/3-people-sleeping-capacity/" },
      { text: "4 Berth",     href: "/listings/4-people-sleeping-capacity/" },
      { text: "5 Berth",     href: "/listings/5-people-sleeping-capacity/" },
      { text: "6+ Berth",     href: "/listings/over-5-people-sleeping-capacity/" },
      
      
    ],
  },
];


export default function HomeLocationSection() {
  return (
    <section className="hloc-section">
      <div className="container">

        <div className="hloc-header">
          <h2 className="hloc-title">
            Find Motorhomes for Sale by <span className="hloc-title-accent">Popular Location</span>
          </h2>
          <p className="hloc-subtitle">Browse motorhomes for sale near you by major Australian cities.</p>
          
        </div>

        <div className="hloc-major-grid">
          {MAJOR_CITIES.map((city) => (
            <a key={city.name} href={city.href} className="hloc-city-card">
              <div className="hloc-city-img-wrap">
                <div className="hloc-city-circle" />
                <Image
                  src={city.imgSrc}
                  alt={city.name}
                  width={110}
                  height={80}
                  className="hloc-city-img"
                  unoptimized
                />
              </div>
              <h3 className="hloc-city-name">
                {city.name} <span className="hloc-city-arrow"></span>
              </h3>
            </a>
          ))}
        </div>

        <div className="hloc-minor-wrap">
          {MINOR_CITIES.map((city, idx) => (
            <a
              key={city.name}
              href={city.href}
              className={`hloc-minor-pill${idx === 0 ? " hloc-minor-pill--active" : ""}`}
            >
              <h3>{city.name}</h3>
            </a>
          ))}
        </div>
<div className="hloc-header">
  <h2 className="hloc-title">
           Search Motorhomes for Sale <span className="hloc-title-accent">Your Way</span>
          </h2>
   
        </div>
        <div className="hloc-filters">
          
          {FILTERS.map((f) => (
            <div key={f.label} className="hloc-filter-row">
              <div className="hloc-filter-label">
                <span className="hloc-filter-icon-box">{f.icon}</span>
                <span className="hloc-filter-text">{f.label}</span>
              </div>
              <div className="hloc-filter-chips">
                <h3>
                {f.items.map((item,) => (

                  <a key={item.text} href={item.href} className="hloc-chip">
                   {item.text}</a>
                ))}
                </h3>
              </div>
            </div>
          ))}
        </div>
 
        

      </div>
    </section>
  );
}
