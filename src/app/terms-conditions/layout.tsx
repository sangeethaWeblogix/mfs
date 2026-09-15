 import { Metadata } from "next";
import { ReactNode } from "react";



 export const metadata: Metadata = {
   title: {
     default: "Terms of Use – MotorhomesForSale.com.au | Marketplace Network",
     template: "%s ",
   },
   description:
     "Read the Terms of Use for MotorhomesForSale.com.au, a marketplace platform operated by Marketplace Network Pty Ltd (ABN 70 694 987 052). Learn about listings, user responsibilities, and platform policies.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   alternates: {
    canonical: "https://www.motorhomesforsale.com.au/terms-conditions/",

   },
   
   openGraph: {
      url: "https://www.motorhomesforsale.com.au/terms-conditions/",
     title: "Terms of Use – MotorhomesForSale.com.au | Marketplace Network",
       description:
     "Read the Terms of Use for MotorhomesForSale.com.au, a marketplace platform operated by Marketplace Network Pty Ltd (ABN 70 694 987 052). Learn about listings, user responsibilities, and platform policies.",
     
   },
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
