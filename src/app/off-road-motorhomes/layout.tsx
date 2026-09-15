import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Off-Road Motorhomes For Sale – Australia’s Best Off-Road & 4WD Motorhomes",
  description: "Browse off-road motorhomes for sale across Australia. Compare prices on rugged 4WD, hybrid and semi off-road models built for adventure and remote touring.",
  robots: "noindex, nofollow",
  alternates: {
    canonical: "https://www.motorhomesforsale.com.au/off-road-motorhomes/",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
