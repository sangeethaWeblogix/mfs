import About from "./about";
import "./about.css";

const BASE_URL = "https://www.motorhomesforsale.com.au";

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${BASE_URL}/about-us/#webpage`,
      "url": `${BASE_URL}/about-us/`,
      "name": "About Motorhome Marketplace - Your Trusted Motorhome Resource",
      "description":
        "Motorhome Marketplace is your go-to platform for finding the perfect motorhome from the right manufacturer or dealer at the right price.",
      "inLanguage": "en-AU",
    },
    {
      "@type": "Organization",
      "name": "Marketplace Network",
      "url": BASE_URL,
      "email": "enquiries@motorhomesforsale.com.au",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <About />
    </>
  );
}
