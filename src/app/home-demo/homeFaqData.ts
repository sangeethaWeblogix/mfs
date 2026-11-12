export type FaqCategoryKey =
  | "general"
  | "buying"
  | "brands"
  | "prices"
  | "locations"
  | "selling"
  | "features";

export const FAQ_CATEGORIES: { key: FaqCategoryKey; label: string }[] = [
  { key: "buying", label: "Buying & Used" },
  { key: "brands", label: "Brands" },
  { key: "prices", label: "Prices & Finance" },
  { key: "locations", label: "Locations" },
  { key: "selling", label: "Selling" },
  { key: "features", label: "Features & Travel" },
  { key: "general", label: "General & Types" },
];

export interface FaqItem {
  question: string;
  /** HTML string — may contain inline <a> tags to real /listings/ filter pages. */
  answer: string;
}

const L = {
  listings: "/listings/",
  newCondition: "/listings/new-condition/",
  usedCondition: "/listings/used-condition/",
  under50k: "/listings/under-50000/",
  over300k: "/listings/over-300000/",
  under20ft: "/listings/under-20-length-in-feet/",
  sleeps2: "/listings/2-people-sleeping-capacity/",
  sleeps4: "/listings/4-people-sleeping-capacity/",
  offRoad: "/off-road-motorhomes/",
  sell: "/sell-my-motorhome/",
  dealerAdvertising: "/dealer-advertising/",
  jayco: "/listings/jayco/",
  avida: "/listings/avida/",
  winnebago: "/listings/winnebago/",
  sunliner: "/listings/sunliner/",
  avan: "/listings/avan/",
  mercedesBenz: "/listings/mercedes-benz-vehicle-make/",
  sydney: "/listings/new-south-wales-state/sydney-region/",
  melbourne: "/listings/victoria-state/melbourne-region/",
  brisbane: "/listings/queensland-state/brisbane-region/",
  adelaide: "/listings/south-australia-state/adelaide-region/",
  perth: "/listings/western-australia-state/perth-region/",
  tasmania: "/listings/tasmania-state/",
  queensland: "/listings/queensland-state/",
  westernAustralia: "/listings/western-australia-state/",
  newSouthWales: "/listings/new-south-wales-state/",
  campervans: "https://www.campervansforsale.au/",
};

const a = (href: string, text: string, external = false) =>
  external
    ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    : `<a href="${href}">${text}</a>`;

export const HOME_FAQ: Record<FaqCategoryKey, FaqItem[]> = {
  general: [
    {
      question: "What is a motorhome?",
      answer:
        "A motorhome is a recreational vehicle combining transport and living accommodation, usually with sleeping areas, a kitchen and storage. Larger models may also include a shower and toilet.",
    },
    {
      question: "What are the different types of motorhomes?",
      answer: `Motorhomes include compact van-based models, cab-over motorhomes, coachbuilt vehicles, luxury motorhomes and 4WD models. Compare different sizes and layouts on ${a(L.listings, "MotorhomesForSale.com.au")}.`,
    },
    {
      question: "What is the difference between a motorhome and a campervan?",
      answer: `Motorhomes generally provide more living space and facilities, while ${a(L.campervans, "campervans", true)} are typically smaller and easier to manoeuvre. However, some compact motorhomes and larger campervans have similar features.`,
    },
    {
      question: "What are the most popular motorhome brands in Australia?",
      answer: `Well-known Australian motorhome brands include Jayco, Avida, Winnebago, Sunliner, Avan and Suncamper. Browse motorhomes by make on MotorhomesForSale.com.au to compare available models.`,
    },
    {
      question: "Which motorhome is best for travelling around Australia?",
      answer: "A motorhome with a reliable mechanical base, sufficient payload, comfortable sleeping arrangements and adequate water and power capacity is ideal. The best choice depends on your travel plans and budget.",
    },
    {
      question: "What is the average price of a motorhome in Australia?",
      answer: `Motorhome prices vary widely, from older used vehicles under $50,000 to luxury models exceeding $300,000. Browse motorhomes for sale to compare current asking prices.`,
    },
    {
      question: "Are motorhomes worth buying in Australia?",
      answer: "Motorhomes can be worthwhile for regular road trips and extended holidays. They combine transport and accommodation, although buyers should consider fuel, insurance, servicing, storage and depreciation.",
    },
    {
      question: "What should I look for when buying a motorhome?",
      answer: "Check the motorhome's layout, mechanical condition, service history, water damage, GVM, payload and available features. For used vehicles, arrange an independent inspection and PPSR check.",
    },
    {
      question: "How do I choose the right motorhome?",
      answer: `Consider your budget, number of travellers, driving preferences and intended destinations. Compare motorhomes by price, make, sleeping capacity, length and GVM to narrow your options.`,
    },
    {
      question: "Where can I find motorhomes for sale in Australia?",
      answer: `Browse new and used motorhomes for sale in Australia on MotorhomesForSale.com.au. Compare listings from dealerships and private sellers across Australia.`,
    },
    {
      question: "What are the different classes of motorhomes?",
      answer: "Motorhomes are often classified internationally as Class A, B or C. These generally refer to coach-style, van-based and cab-chassis motorhomes respectively, rather than Australian driver licence categories.",
    },
    {
      question: "What is a Class A motorhome?",
      answer: "A Class A motorhome is a large coach-style vehicle offering spacious living areas and premium facilities. These models may require a heavy vehicle licence depending on their GVM.",
    },
    {
      question: "What is a Class B motorhome?",
      answer: "A Class B motorhome is a compact, van-based recreational vehicle. Often described as a campervan in Australia, it suits travellers looking for a smaller, more manoeuvrable vehicle.",
    },
    {
      question: "What is a Class C motorhome?",
      answer: "A Class C motorhome is built on a cab-chassis with a separate living body, sometimes including an over-cab bed. These motorhomes are popular with couples and families.",
    },
    {
      question: "What is the best small motorhome for couples?",
      answer: `A compact 2-berth motorhome with a comfortable bed, practical kitchen and adequate storage can suit couples. ${a(L.sleeps2, "Browse 2-berth motorhomes for sale")}.`,
    },
    {
      question: "Where can I find compact motorhomes for sale?",
      answer: `${a(L.under20ft, "Browse motorhomes under 20 feet")} on MotorhomesForSale.com.au to compare smaller vehicles suited to couples, solo travellers and shorter trips.`,
    },
    {
      question: "Are 4WD motorhomes suitable for off-road travel?",
      answer: `Purpose-built ${a(L.offRoad, "4WD motorhomes")} can handle selected off-road conditions. Check ground clearance, tyres, suspension, weight and manufacturer restrictions before travelling on challenging terrain.`,
    },
    {
      question: "What are the benefits of a luxury motorhome?",
      answer: `Luxury motorhomes offer additional living space, premium finishes and advanced features, sometimes including slide-outs and larger ensuites. ${a(L.over300k, "Browse motorhomes over $300,000")} to explore premium options.`,
    },
    {
      question: "What is the difference between a motorhome and an RV?",
      answer: "An RV, or recreational vehicle, is a broad term covering motorhomes, campervans, caravans and similar vehicles. A motorhome is a motorised type of RV.",
    },
    {
      question: "What size motorhome is best for a family?",
      answer: `Families often choose ${a(L.sleeps4, "4-berth or larger motorhomes")} with flexible sleeping arrangements. Confirm the number of approved passenger seats.`,
    },
  ],

  buying: [
    {
      question: "Where can I buy a motorhome in Australia?",
      answer: `MotorhomesForSale.com.au features motorhomes for sale across Australia from dealers and private sellers. Browse available vehicles and contact advertisers directly.`,
    },
    {
      question: "How do I buy a motorhome privately?",
      answer: "Find a suitable private listing, inspect the vehicle, verify the seller's details and conduct a PPSR check. Agree on payment and complete the necessary ownership-transfer paperwork.",
    },
    {
      question: "Is it better to buy a new or used motorhome?",
      answer: `${a(L.newCondition, "New motorhomes")} offer current features and applicable warranty coverage, while ${a(L.usedCondition, "used motorhomes")} generally cost less. Your budget and intended use should guide your choice.`,
    },
    {
      question: "What is the cheapest motorhome available in Australia?",
      answer: `The cheapest available motorhome changes as listings are added or sold. ${a(L.under50k, "Browse motorhomes under $50,000")} to compare lower-priced options.`,
    },
    {
      question: "How much deposit do I need to buy a motorhome?",
      answer: "Deposit requirements depend on the seller, dealership or finance provider. Some purchases may not require a deposit, while financed purchases depend on lender conditions.",
    },
    {
      question: "Can I buy a motorhome with finance?",
      answer: "Yes. Banks and specialist lenders may offer motorhome finance, subject to eligibility. MotorhomesForSale.com.au lets you compare vehicle listings, but finance arrangements must be confirmed with the relevant provider.",
    },
    {
      question: "What documents should I check before buying a motorhome?",
      answer: "Check the registration details, VIN, service history, ownership information and PPSR status. Also review any available warranty, roadworthy, gas or electrical compliance documents.",
    },
    {
      question: "How do I compare motorhomes for sale?",
      answer: `Compare prices, makes, models, year, kilometres, sleeping capacity, GVM, layout and features. Use the search filters on MotorhomesForSale.com.au to narrow your options.`,
    },
    {
      question: "Where can I find affordable motorhomes for sale?",
      answer: `Browse used motorhomes and apply your preferred price range. Compare vehicle condition and expected maintenance costs before choosing the cheapest listing.`,
    },
    {
      question: "Can I buy a motorhome from a private seller?",
      answer: `Yes. MotorhomesForSale.com.au includes private seller listings. Contact the advertiser directly, arrange an inspection and complete the necessary checks before purchasing.`,
    },
    {
      question: "Where can I find used motorhomes for sale in Australia?",
      answer: `Browse used motorhomes for sale on MotorhomesForSale.com.au. Compare second-hand vehicles from dealerships and private sellers across Australia.`,
    },
    {
      question: "Are second-hand motorhomes worth buying?",
      answer: "Used motorhomes can offer good value, especially when well-maintained. Always check their mechanical condition, service records and signs of water damage.",
    },
    {
      question: "How much does a used motorhome cost?",
      answer: `Older used motorhomes can cost under $50,000, while newer models may exceed $150,000. Compare used motorhome listings for current asking prices.`,
    },
    {
      question: "What should I check before buying a used motorhome?",
      answer: "Inspect the engine, transmission, tyres, roof seals, flooring and living-area equipment. Review the service history and PPSR status, and consider an independent inspection.",
    },
    {
      question: "Where can I find cheap second-hand motorhomes?",
      answer: `Browse motorhomes under $50,000 on MotorhomesForSale.com.au. Check vehicle condition carefully, particularly for older models.`,
    },
    {
      question: "Are ex-rental motorhomes worth buying?",
      answer: "Ex-rental motorhomes may offer practical layouts and documented maintenance. However, check kilometres, wear, service history and mechanical condition before purchasing.",
    },
    {
      question: "How do I check the history of a used motorhome?",
      answer: "Conduct a PPSR search using the VIN to check registered security interests and available stolen or written-off records. Also review service and registration records.",
    },
    {
      question: "What is the average lifespan of a motorhome?",
      answer: "A well-maintained motorhome can remain usable for decades. Its lifespan depends on mechanical servicing, construction quality, water damage and overall condition.",
    },
    {
      question: "Where can I find repossessed motorhomes for sale?",
      answer: "Repossessed motorhomes may occasionally appear through auction houses and finance-related sales. Check auction conditions and arrange an inspection before bidding.",
    },
    {
      question: "How do I find pre-owned motorhomes from dealers?",
      answer: `Browse used motorhome listings on MotorhomesForSale.com.au and look for vehicles marked as dealer advertisements.`,
    },
  ],

  brands: [
    {
      question: "What are the best motorhome brands in Australia?",
      answer: "Jayco, Avida, Winnebago, Sunliner, Avan and Suncamper are among Australia's established motorhome brands. The best choice depends on your preferred layout, budget and servicing needs.",
    },
    {
      question: "Where can I find Avida motorhomes for sale?",
      answer: `Browse ${a(L.avida, "Avida motorhomes for sale")} on MotorhomesForSale.com.au. Compare available Birdsville, Beechworth, Esperance and other Avida models.`,
    },
    {
      question: "Are Jayco motorhomes good?",
      answer: `Jayco offers motorhomes in different sizes and layouts for Australian travellers. Compare features, prices and individual vehicle condition when browsing ${a(L.jayco, "Jayco motorhomes for sale")}.`,
    },
    {
      question: "Where can I buy Winnebago motorhomes?",
      answer: `Find ${a(L.winnebago, "Winnebago motorhomes for sale")} on MotorhomesForSale.com.au, with available new and used listings from Australian dealerships and private sellers.`,
    },
    {
      question: "What makes Sunliner motorhomes popular?",
      answer: `Sunliner is known for touring-focused motorhomes with a range of layouts and living features. Browse ${a(L.sunliner, "Sunliner motorhomes for sale")} to compare available models.`,
    },
    {
      question: "Are Apollo motorhomes worth buying?",
      answer: "Motorhomes sold through Apollo's RV sales operations, including ex-rentals, may offer value. Check the underlying vehicle make, servicing records, kilometres and condition before buying.",
    },
    {
      question: "Where can I find Avan motorhomes for sale?",
      answer: `Browse ${a(L.avan, "Avan motorhomes for sale")} on MotorhomesForSale.com.au, including available Ovation and Applause models.`,
    },
    {
      question: "Are Mercedes-Benz motorhomes reliable?",
      answer: `Mercedes-Benz Sprinter-based motorhomes can be a good option when properly maintained. Check the mechanical history and living-area construction. Browse ${a(L.mercedesBenz, "Mercedes-Benz-based motorhomes")}.`,
    },
    {
      question: "Which motorhome manufacturers are popular in Australia?",
      answer: "Well-known Australian motorhome manufacturers and brands include Jayco, Avida, Sunliner, Avan, Suncamper, Horizon and Trakka. Compare their available models and specifications before buying.",
    },
  ],

  prices: [
    {
      question: "How much does a new motorhome cost in Australia?",
      answer: `Many new motorhomes are advertised from approximately $125,000 to over $250,000, with luxury models costing more. Browse new motorhomes for sale for current prices.`,
    },
    {
      question: "How much does a second-hand motorhome cost?",
      answer: `Second-hand motorhomes can range from under $50,000 to more than $200,000, depending on age, brand and condition. Compare used motorhomes to find suitable options.`,
    },
    {
      question: "What is the cheapest motorhome in Australia?",
      answer: `The cheapest motorhome depends on current listings and vehicle condition. Browse motorhomes under $50,000 to explore budget options.`,
    },
    {
      question: "How much does a luxury motorhome cost?",
      answer: `Luxury motorhomes can cost $300,000 to $500,000 or more. Browse motorhomes over $300,000 to compare premium models.`,
    },
    {
      question: "What are the ongoing costs of owning a motorhome?",
      answer: "Ongoing expenses include registration, insurance, fuel, servicing, tyres, repairs and storage. Travel costs such as caravan parks and camping fees should also be considered.",
    },
    {
      question: "Can I get motorhome finance in Australia?",
      answer: "Yes. Motorhome finance may be available through banks and specialist lenders, subject to approval. Compare interest rates, fees and repayment terms before borrowing.",
    },
    {
      question: "What affects the resale value of a motorhome?",
      answer: `Resale value depends on brand, age, kilometres, condition, service history and features. Compare similar motorhomes listed on MotorhomesForSale.com.au to assess asking prices.`,
    },
    {
      question: "Are motorhomes expensive to maintain?",
      answer: "Maintenance costs depend on the motorhome's age, size and mechanical condition. Owners should budget for servicing, tyres, batteries, appliances and water-tightness checks.",
    },
    {
      question: "How much does motorhome insurance cost?",
      answer: "Insurance premiums vary according to vehicle value, location, driving history and coverage. Compare quotes from insurers offering motorhome policies to estimate your costs.",
    },
    {
      question: "Is motorhome financing available for used motorhomes?",
      answer: "Yes. Some lenders finance used motorhomes, although eligibility depends on the vehicle's age, value, condition and the lender's requirements.",
    },
  ],

  locations: [
    {
      question: "Where can I find motorhomes for sale in Sydney?",
      answer: `Browse ${a(L.sydney, "motorhomes for sale in Sydney")} on MotorhomesForSale.com.au. Compare new and used listings from dealers and private sellers.`,
    },
    {
      question: "Where can I find motorhomes for sale in Melbourne?",
      answer: `Explore ${a(L.melbourne, "motorhomes for sale in Melbourne")} on MotorhomesForSale.com.au. Filter available listings by price, make, condition and specifications.`,
    },
    {
      question: "Where can I find motorhomes for sale in Brisbane?",
      answer: `Browse ${a(L.brisbane, "motorhomes for sale in Brisbane")} and compare vehicles advertised by dealerships and private sellers across the region.`,
    },
    {
      question: "Where can I find motorhomes for sale in Adelaide?",
      answer: `Find ${a(L.adelaide, "motorhomes for sale in Adelaide")} on MotorhomesForSale.com.au, including available new and used models.`,
    },
    {
      question: "Where can I find motorhomes for sale in Perth?",
      answer: `Browse ${a(L.perth, "motorhomes for sale in Perth")} and compare prices, brands and features from available listings.`,
    },
    {
      question: "Where can I find motorhomes for sale in Tasmania?",
      answer: `Explore ${a(L.tasmania, "motorhomes for sale in Tasmania")} from dealerships and private sellers throughout the state.`,
    },
    {
      question: "Where can I find motorhomes for sale in Queensland?",
      answer: `Browse ${a(L.queensland, "motorhomes for sale in Queensland")}, including listings in Brisbane, the Gold Coast and regional areas.`,
    },
    {
      question: "Where can I find motorhomes for sale in Western Australia?",
      answer: `Browse ${a(L.westernAustralia, "motorhomes for sale in Western Australia")}, including available listings in Perth and regional WA.`,
    },
    {
      question: "Where can I find motorhomes for sale in New South Wales?",
      answer: `Explore ${a(L.newSouthWales, "motorhomes for sale in NSW")}, including Sydney, Newcastle and regional locations.`,
    },
    {
      question: "Where can I find motorhomes for sale near me?",
      answer: `Use the location filters on MotorhomesForSale.com.au to find available motorhomes in your state, city or region.`,
    },
  ],

  selling: [
    {
      question: "How can I sell my motorhome in Australia?",
      answer: `You can ${a(L.sell, "sell your motorhome")} online on MotorhomesForSale.com.au for $49 including GST. Your advertisement stays live until sold, with no sales commission.`,
    },
    {
      question: "Where can I advertise my motorhome for sale?",
      answer: `Advertise on MotorhomesForSale.com.au for a one-time fee of $49 including GST. Connect directly with interested motorhome buyers across Australia.`,
    },
    {
      question: "How much is my motorhome worth?",
      answer: "Your motorhome's value depends on its make, model, year, condition, kilometres and features. Compare similar advertised motorhomes to estimate a competitive asking price.",
    },
    {
      question: "How do I determine the resale value of my motorhome?",
      answer: "Compare motorhomes of similar age, brand, condition and specifications. Allow for differences in kilometres travelled, accessories and maintenance history.",
    },
    {
      question: "Is it better to sell a motorhome privately or through a dealer?",
      answer: `Selling privately gives you control over pricing and negotiations. ${a(L.dealerAdvertising, "Dealers")} may offer convenience through trade-ins or consignment, although fees or lower offers may apply.`,
    },
    {
      question: "What documents do I need to sell my motorhome?",
      answer: "Prepare registration details, proof of your right to sell, service records and applicable transfer documents. Roadworthy or safety certificate requirements vary by state.",
    },
    {
      question: "How can I sell my used motorhome quickly?",
      answer: `Set a competitive price, upload quality photos and provide accurate vehicle specifications. A detailed listing on MotorhomesForSale.com.au can help buyers assess your motorhome.`,
    },
    {
      question: "Where can I list my motorhome for sale online?",
      answer: `List your motorhome on MotorhomesForSale.com.au for $49 including GST. Your advertisement stays online until sold, with no monthly listing fees.`,
    },
    {
      question: "How do I prepare my motorhome for sale?",
      answer: "Clean the vehicle, address minor issues and gather maintenance records. Photograph the exterior, interior, kitchen, sleeping areas and important features.",
    },
    {
      question: "Can I sell my motorhome without a dealership?",
      answer: `Yes. MotorhomesForSale.com.au allows private sellers to advertise directly to buyers for a one-time $49 fee, without a dealership or sales commission.`,
    },
  ],

  features: [
    {
      question: "What motorhome layouts are available?",
      answer: `Motorhomes offer layouts with island beds, twin beds, bunk beds, rear lounges and convertible sleeping areas. Compare listings to find a layout suited to your needs.`,
    },
    {
      question: "How many people can sleep in a motorhome?",
      answer: "Motorhomes commonly accommodate two to six people, depending on their layout. Use the sleeping-capacity filters on MotorhomesForSale.com.au to find suitable models.",
    },
    {
      question: "What is the difference between 2-berth and 4-berth motorhomes?",
      answer: `A 2-berth motorhome sleeps two people, while a 4-berth sleeps four. Check the number of approved passenger seats separately.`,
    },
    {
      question: "What is GVM in a motorhome?",
      answer: "Gross Vehicle Mass (GVM) is the maximum permitted loaded weight of a motorhome, including passengers, luggage and equipment. It also affects driver licence requirements.",
    },
    {
      question: "What is payload capacity in a motorhome?",
      answer: "Payload is the weight available for passengers, luggage, water and accessories within the motorhome's GVM limit. Check actual vehicle weights before loading.",
    },
    {
      question: "Are diesel motorhomes better than petrol motorhomes?",
      answer: "Diesel motorhomes are common in Australia and can suit long-distance touring. Compare fuel consumption, servicing costs and mechanical condition before choosing.",
    },
    {
      question: "Are automatic motorhomes easier to drive?",
      answer: "Automatic motorhomes can be easier to manage in traffic and on long journeys. However, the vehicle's size, weight and visibility also affect driving comfort.",
    },
    {
      question: "What motorhomes have solar panels?",
      answer: "Many Australian motorhomes include factory-fitted or aftermarket solar systems. Check individual listings for solar panels, lithium batteries and other off-grid features.",
    },
    {
      question: "What motorhomes come with an ensuite?",
      answer: "Many medium and large motorhomes feature a shower and toilet, while some compact models include a combined wet-bath ensuite. Check individual listing specifications.",
    },
    {
      question: "What features should I look for in a motorhome?",
      answer: "Consider sleeping comfort, storage, kitchen facilities, an ensuite, solar power, water capacity and air conditioning. Also check GVM, payload and mechanical condition.",
    },
    {
      question: "Is it legal to live permanently in a motorhome in Australia?",
      answer: "Living permanently in a motorhome may be permitted in some locations, subject to local council rules, land-use restrictions and caravan park conditions.",
    },
    {
      question: "What licence do I need to drive a motorhome in Australia?",
      answer: "A standard car licence generally covers motorhomes up to 4.5 tonnes GVM. Heavier motorhomes require an appropriate heavy vehicle licence.",
    },
    {
      question: "Do motorhomes need special registration?",
      answer: "Motorhomes must be registered under the rules of the relevant state or territory. Requirements can vary by weight, vehicle classification and modifications.",
    },
    {
      question: "How much does it cost to travel Australia in a motorhome?",
      answer: "Travel costs depend on fuel consumption, distance, accommodation, food and servicing. Your route and travel duration will determine the overall budget.",
    },
    {
      question: "Where can I park a motorhome overnight in Australia?",
      answer: "Motorhomes can stay overnight at caravan parks, designated camping areas and other permitted locations. Always check local parking and camping restrictions.",
    },
    {
      question: "What insurance do I need for a motorhome?",
      answer: "Motorhomes require the compulsory personal-injury cover associated with registration. Comprehensive motorhome insurance can provide additional protection against damage, theft and other insured risks.",
    },
    {
      question: "How often should a motorhome be serviced?",
      answer: "Follow the vehicle manufacturer's service schedule and regularly inspect tyres, roof seals, batteries, plumbing and living-area equipment.",
    },
    {
      question: "Are motorhomes suitable for long-distance travel?",
      answer: "Yes. Motorhomes are well suited to extended road trips, offering transport and accommodation together. Choose a vehicle with adequate storage, payload and mechanical reliability.",
    },
    {
      question: "What are the best motorhomes for travelling around Australia?",
      answer: "The best motorhome depends on your budget, travel style and destinations. Prioritise reliability, comfortable sleeping arrangements, adequate payload and suitable water and power systems.",
    },
    {
      question: "Can I take a motorhome off-road?",
      answer: `Some purpose-built 4WD motorhomes are designed for off-road conditions. Check the manufacturer's limits, ground clearance, tyres and road suitability before travelling.`,
    },
  ],
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

/** FAQPage JSON-LD for the home page's FAQ section — flattens every
 * category's questions into one mainEntity list, with the HTML-formatted
 * answers (inline <a> tags) reduced to the plain text schema.org expects. */
export function buildHomeFaqJsonLd() {
  const allItems = Object.values(HOME_FAQ).flat();
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(item.answer),
      },
    })),
  };
}
