 import { Metadata } from "next";
import { ReactNode } from "react";



 export const metadata: Metadata = {
   title: {
     default: "Motorhome Enquiry Form | Exclusive Motorhome Deals & Offers",
     template: "%s ",
   },
   description:
     "Fill out our motorhome enquiry form to receive exclusive offers from select quality motorhome manufacturers. Get the best motorhome deals sent directly to you.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   alternates: {
    canonical: "https://www.motorhomesforsale.com.au/motorhome-enquiry-form/",
   },
   
 
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
