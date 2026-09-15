 import { Metadata } from "next";
import { ReactNode } from "react";



 export const metadata: Metadata = {
   title: {
     default: "Motorhome Dealer Advertising | Unlimited Listings $299/Month | MotorhomesForSale",
     template: "%s ",
   },
   description:
     "Advertise your motorhome dealership on MotorhomesForSale.com.au. Unlimited listings, zero lead fees, and reach high-intent motorhome buyers across Australia.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   alternates: {
    canonical: "https://www.motorhomesforsale.com.au/dealer-advertising/",
   },
   
 
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
