 import "./contact.css";
import { Metadata } from "next";
import { ReactNode } from "react";



 export const metadata: Metadata = {
   title: {
     default: "Contact Motorhomes For Sale | Australia’s Motorhome Marketplace",
     template: "%s ",
   },
   description:
     "Have a question about motorhomes in Australia? Contact Motorhomes For Sale for support, inquiries, or help finding your next motorhome today.",
   icons: { icon: "/favicon.ico" },
   robots: "index, follow",
   alternates: {
    canonical: "https://www.motorhomesforsale.com.au/contact/",
   },
   
 
 };
 
   export default function Layout({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
  }
