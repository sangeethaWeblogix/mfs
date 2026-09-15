import { Metadata } from "next";

 const BASE_URL = "https://www.motorhomesforsale.com.au";

export interface StateData {
  slug: string;
  label: string;
  capital: string;
  abbr: string;
  mapImg: string;
}

export const STATES_DATA: Record<string, StateData> = {
  victoria: {
    slug: "victoria",
    label: "Victoria",
    capital: "Melbourne",
    abbr: "VIC",
    mapImg: "/images/vic_map.svg",
  },
  "new-south-wales": {
    slug: "new-south-wales",
    label: "New South Wales",
    capital: "Sydney",
    abbr: "NSW",
    mapImg: "/images/nsw_map.svg",
  },
  queensland: {
    slug: "queensland",
    label: "Queensland",
    capital: "Brisbane",
    abbr: "QLD",
    mapImg: "/images/qld_map.svg",
  },
  "south-australia": {
    slug: "south-australia",
    label: "South Australia",
    capital: "Adelaide",
    abbr: "SA",
    mapImg: "/images/sa_map.svg",
  },
  tasmania: {
    slug: "tasmania",
    label: "Tasmania",
    capital: "Hobart",
    abbr: "TAS",
    mapImg: "/images/tas_map.svg",
  },
  "western-australia": {
    slug: "western-australia",
    label: "Western Australia",
    capital: "Perth",
    abbr: "WA",
    mapImg: "/images/wa_map.svg",
  },
};

export const ALL_STATE_SLUGS = Object.keys(STATES_DATA);

export function getStateBySlug(slug: string): StateData | undefined {
  return STATES_DATA[slug];
}

export function buildStateMetadata(state: StateData): Metadata {
  return {
    title: `Sell My Motorhome in ${state.label} | List Until Sold for $49`,
    description: `Sell your motorhome in ${state.label} for just $49. List until sold, pay no commission and connect directly with motorhome buyers across ${state.capital} and regional ${state.label}.`,
    robots: "index, follow",
    alternates: {
      canonical: `${BASE_URL}/sell-my-motorhome/${state.slug}/`,
    },
  };
}

export function buildStateJsonLd(state: StateData) {
  const pageUrl = `${BASE_URL}/sell-my-motorhome/${state.slug}/`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `Sell My Motorhome in ${state.label} | List Until Sold for $49`,
        description: `Sell your motorhome in ${state.label} with MotorhomesForSale.com.au. List for a one-time $49 fee, keep 100% of the sale price, and stay live until sold.`,
        inLanguage: "en-AU",
        isPartOf: { "@id": `${BASE_URL}/#website` },
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: "Private Motorhome Listing Service",
        url: pageUrl,
        description:
          "List your motorhome for sale on MotorhomesForSale.com.au for a one-time $49 fee. No commissions, no subscriptions, live until sold.",
        provider: {
          "@type": "Organization",
          name: "Motorhomes For Sale",
          url: BASE_URL,
        },
        areaServed: {
          "@type": "State",
          name: state.label,
        },
        offers: {
          "@type": "Offer",
          price: "49",
          priceCurrency: "AUD",
          description: "One-time listing fee, live until sold, no commissions",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faqpage`,
        mainEntity: [
          {
            "@type": "Question",
            name: `How do I sell my motorhome in ${state.label}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `You can sell your motorhome in ${state.label} by creating a private seller listing on MotorhomesForSale.com.au. Add your motorhome details, upload clear photos, set your asking price and publish your ad so buyers across ${state.capital} and regional ${state.label} can contact you directly.`,
            },
          },
          {
            "@type": "Question",
            name: `How much does it cost to sell my motorhome in ${state.label}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "It costs $49 inc. GST to list your motorhome on MotorhomesForSale.com.au. This is a one-time listing fee with no monthly subscription, no hidden charges and no commission when your motorhome sells.",
            },
          },
          {
            "@type": "Question",
            name: "How long does my motorhome listing stay live?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Your motorhome listing stays live until sold. You do not need to keep paying monthly fees to keep your ad active. Once your motorhome is sold, you can remove the listing from the website.",
            },
          },
          {
            "@type": "Question",
            name: "Can I edit my motorhome listing after publishing?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. After your listing is published, you can update your motorhome details, change the asking price, add or replace photos and improve your description if needed.",
            },
          },
          {
            "@type": "Question",
            name: "How do buyers contact me?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Interested buyers can contact you directly through your motorhome listing. This allows you to answer questions, arrange inspections, negotiate the price and manage the sale privately.",
            },
          },
          {
            "@type": "Question",
            name: "What photos should I upload when selling my motorhome?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Upload clear photos of the outside, inside, kitchen, beds, seating area, bathroom, tyres, drawbar and any included accessories. Good photos help buyers understand the condition of your motorhome and can increase enquiries.",
            },
          },
          {
            "@type": "Question",
            name: `How should I price my motorhome in ${state.label}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Check similar motorhomes for sale in ${state.label} before setting your price. Compare by make, model, year, condition, length,GVM, tare weight, sleeping capacity, features and location. A realistic asking price can help attract more genuine buyers.`,
            },
          },
          {
            "@type": "Question",
            name: "Is it safe to sell my motorhome privately online?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes, but you should take normal precautions. Speak with buyers directly, meet in a safe location, confirm payment has cleared before handover and complete any required transfer paperwork for ${state.label}.`,
            },
          },
          {
            "@type": "Question",
            name: "Do I pay commission when my motorhome sells?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. MotorhomesForSale.com.au does not charge commission when your motorhome sells. You pay the one-time listing fee and keep 100% of the agreed sale price.",
            },
          },
          {
            "@type": "Question",
            name: "Can I remove my listing after my motorhome is sold?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Once your motorhome has sold, you can remove your listing so buyers know it is no longer available.",
            },
          },
        ],
      },
    ],
  };
}
