 import { Metadata } from "next";
import { ReactNode } from "react";



 export const metadata: Metadata = {
   title: {
     default: "About Motorhome Marketplace - Your Trusted Motorhome Resource",
     template: "%s ",
   },
   description:
     "Motorhome Marketplace is your go-to platform for finding the perfect motorhome from the right manufacturer or dealer at the right price.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   alternates: {
    canonical: "https://www.motorhomesforsale.com.au/about-us/",
   },
   
 
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
