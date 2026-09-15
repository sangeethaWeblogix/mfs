// export const dynamic = "force-dynamic"
;

import Header from "./Header";
import CaravanList from "./CaravanList";
import "./comman.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full List of Top Quality Motorhome Manufacturers in Australia",
  description:
    "Discover a diverse range of top-tier motorhome manufacturers specializing in off-road, compact poptops, touring models, luxury editions & innovative hybrids.",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.motorhomesforsale.com.au/caravan-manufacturers/all/",
  },
  openGraph: {
    title: "Full List of Top Quality Motorhome Manufacturers in Australia",
    description:
      "Discover a diverse range of top-tier motorhome manufacturers specializing in off-road, compact poptops, touring models, luxury editions & innovative hybrids.",
    url: "https://www.motorhomesforsale.com.au/caravan-manufacturers/all/",
    images: [
      {
        url: "https://www.motorhomesforsale.com.au/images/mfs-logo.png",
        width: 800,
        height: 600,
        alt: "Motorhome Manufacturers Australia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Full List of Top Quality Motorhome Manufacturers in Australia",
    description:
      "Discover a diverse range of top-tier motorhome manufacturers specializing in off-road, compact poptops, touring models, luxury editions & innovative hybrids.",
  },
};

export default function Home() {
  return (
    <div>
      <Header />
      {/* <CaravanList /> */}
    </div>
  );
}
