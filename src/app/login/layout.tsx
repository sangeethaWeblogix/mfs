  import { Metadata } from "next";
import { ReactNode } from "react";




 export const metadata: Metadata = {
   title: "Login | Motorhomes For Sale – Dealer & Private Seller Access",
  description:
     "Access your MotorhomesForSale.com.au account. Private sellers and dealers can log in to manage listings, post motorhomes for sale, and connect with thousands of buyers across Australia.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   alternates: {
    canonical: "https://www.motorhomesforsale.com.au/login/",
   },
   
 
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
