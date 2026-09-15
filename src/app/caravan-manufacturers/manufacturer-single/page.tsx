// export const dynamic = "force-dynamic"
;

import Header from "./Header";
import Middle from "./Middle";
import Footer from "./Footer";
import "./comman.css";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = "Everest Caravans | Custom Built Full Off Road Motorhomes";
  const metaDescription =
    "Custom-built full off-road, extreme off road motorhomes @ Everest Caravans with a 10 year structural warranty. Explore rugged durability &amp; premium features.";

  const robots = "index, follow";

  return {
    title: metaTitle,
    description: metaDescription,
    robots: robots,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
    },
  };
}

export default function Home() {
  return (
    <div>
      <Header />
      <Middle />
      <Footer />
    </div>
  );
}
