
import Home from "./home-demo/home";
import "./globals.css?=1";
import { Metadata } from "next";
 
import { fetchStateBasedCaravans } from "@/api/homeApi/state/api";
import { fetchRequirements } from "@/api/postRquirements/api";
import { fetchHomePage } from "@/api/home/api";
import { fetchTypeCounts } from "@/api/homeApi/typeCounts/api";
import { fetchFeaturedListings } from "@/api/homeApi/featured/api";
import { fetchBlogs } from "@/api/blog/api";

const SEED_MAX = 15;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Motorhomes For Sale – New & Used Motorhome Marketplace in Australia",
    template: "%s ",
  },
  description:
    "Browse new and used motorhomes for sale across Australia. Compare prices, layouts and key specifications from trusted dealers and private sellers.",
  icons: { icon: "/favicon.ico" },
  robots: "index, follow",
  alternates: {
    canonical: "https://www.motorhomesforsale.com.au",
  },
  openGraph: {
    title: "Motorhomes For Sale – New & Used Motorhome Marketplace in Australia",
    description: "Browse new and used motorhomes for sale across Australia. Compare prices, layouts and key specifications from trusted dealers and private sellers.",
    url: "https://www.motorhomesforsale.com.au",
    siteName: "Motorhomes for Sale",
    images: [
      {
        url: "https://www.motorhomesforsale.com.au/images/mfs-logo.png",
        width: 800,
        height: 600,
        alt: "Motorhomes for Sale Australia",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motorhomes For Sale – New & Used Motorhome Marketplace in Australia",
    description: "Browse new and used motorhomes for sale across Australia. Compare prices, layouts and key specifications from trusted dealers and private sellers.",
  },
};

 const BASE_URL = "https://www.motorhomesforsale.com.au";

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "url": BASE_URL,
      "name": "Motorhomes For Sale",
      "description": "Australia's Marketplace for New & Used Motorhomes",
      "inLanguage": "en-AU",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/listings/{search_term_string}-search/`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "Motorhomes For Sale",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/images/mfs-logo-black.png`,
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "areaServed": "AU",
        "availableLanguage": "English",
      },
    },
  ],
};

export default async function Page() {
  // Fresh random seed (1-15) per request — drives the backend's randomized
  // featured pick so the same visitor sees a different set each visit.
  // force-dynamic above means this re-runs server-side on every request.
  const seed = Math.floor(Math.random() * SEED_MAX) + 1;

  const [
    stateBands,
    requirements,
    homeblog,
    typeCounts,
    featured,
    blog,
  ] = await Promise.all([
    fetchStateBasedCaravans(),
    fetchRequirements(),
    fetchHomePage(),
    fetchTypeCounts(),
    fetchFeaturedListings(seed),
    fetchBlogs(1),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Home
        stateBands={stateBands}
        requirements={requirements}
        homeblog={homeblog?.latest_posts ?? []}
        typeCounts={typeCounts}
        featured={featured}
        blogPosts={blog.items}
      />
    </>
  );
}
