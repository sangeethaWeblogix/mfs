import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sell My Motorhome Online Australia | List Until Sold for $49",
  description:
    "Sell your motorhome online across Australia for just $49. List until sold, edit anytime, pay no commission and connect directly with genuine motorhome buyers.",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.motorhomesforsale.com.au/sell-my-motorhome/",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
