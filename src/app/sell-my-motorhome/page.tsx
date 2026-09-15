import SellerDemo from "./seller-demo";
import "./seller-demo.css";

 const BASE_URL = "https://www.motorhomesforsale.com.au";

const sellPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/sell-my-motorhome/#webpage`,
      "url": `${BASE_URL}/sell-my-motorhome/`,
      "name": "Sell My Motorhome Online Australia | List Until Sold for $49",
      "description":
        "Sell your motorhome online across Australia for just $49. List until sold, edit anytime, pay no commission and connect directly with genuine motorhome buyers.",
      "inLanguage": "en-AU",
      "isPartOf": { "@id": `${BASE_URL}/#website` },
    },
    {
      "@type": "Service",
      "@id": `${BASE_URL}/sell-my-motorhome/#service`,
      "name": "Private Motorhome Listing Service",
      "url": `${BASE_URL}/sell-my-motorhome/`,
      "description":
        "List your motorhome for sale on MotorhomesForSale.com.au for a one-time $49 fee. No commissions, no subscriptions, live until sold.",
      "provider": {
        "@type": "Organization",
        "name": "Motorhomes For Sale",
        "url": BASE_URL,
      },
      "areaServed": {
        "@type": "Country",
        "name": "Australia",
      },
      "offers": {
        "@type": "Offer",
        "price": "49",
        "priceCurrency": "AUD",
        "description": "One-time listing fee, live until sold, no commissions",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/sell-my-motorhome/#faqpage`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I sell my motorhome online in Australia?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can sell your motorhome online by creating a private seller listing on MotorhomesForSale.com.au. Add your motorhome details, upload clear photos, set your asking price and publish your ad so buyers across Australia can contact you directly.",
          },
        },
        {
          "@type": "Question",
          "name": "How much does it cost to list my motorhome?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It costs $49 inc. GST to list your motorhome on MotorhomesForSale.com.au. This is a one-time listing fee with no monthly subscription, no hidden charges and no commission when your motorhome sells.",
          },
        },
        {
          "@type": "Question",
          "name": "How long does my motorhome listing stay live?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Your motorhome listing stays live until sold. You do not need to keep paying monthly fees to keep your ad active. Once your motorhome is sold, you can remove the listing from the website.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I edit my motorhome listing after publishing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. After your listing is published, you can update your motorhome details, change the asking price, add or replace photos and improve your description if needed.",
          },
        },
        {
          "@type": "Question",
          "name": "How do buyers contact me?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Interested buyers can contact you directly through your motorhome listing. This allows you to answer questions, arrange inspections, negotiate the price and manage the sale privately.",
          },
        },
        {
          "@type": "Question",
          "name": "What photos should I upload when selling my motorhome?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Upload clear photos of the outside, inside, kitchen, beds, seating area, bathroom, tyres, drawbar and any included accessories. Good photos help buyers understand the condition of your motorhome and can increase enquiries.",
          },
        },
        {
          "@type": "Question",
          "name": "How should I price my motorhome?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Check similar motorhomes for sale before setting your price. Compare by make, model, year, condition, length,GVM, tare weight, sleeping capacity, features and location. A realistic asking price can help attract more genuine buyers.",
          },
        },
        {
          "@type": "Question",
          "name": "Is it safe to sell my motorhome privately online?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, but you should take normal precautions. Speak with buyers directly, meet in a safe location, confirm payment has cleared before handover and complete any required transfer paperwork for your state or territory.",
          },
        },
        {
          "@type": "Question",
          "name": "Do I pay commission when my motorhome sells?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. MotorhomesForSale.com.au does not charge commission when your motorhome sells. You pay the one-time listing fee and keep 100% of the agreed sale price.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I remove my listing after my motorhome is sold?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Once your motorhome has sold, you can remove your listing so buyers know it is no longer available.",
          },
        },
      ],
    },
  ],
};

export default function SellMyCaravan() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sellPageJsonLd) }}
      />
      <SellerDemo />
    </>
  );
}
