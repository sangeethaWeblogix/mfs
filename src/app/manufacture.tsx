"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import Link from "next/link";
import '../app/home/main.css'


const data = [
  {
    img: "/images/australian-offroad.png",
    alt: "Australian Off Road Logo",
    title: "Australian Off Road",
    desc: "Explore AOR motorhomes in Australia with our detailed review, covering top models, features and pricing to help you plan your next rugged adventure.",
    type: "Off Road, Hybrid, Campers",
    brand: "AOA",
    link: "/aor-caravans-australia-reviews-prices-models/",
  },
  {
    img: "/images/vibe_caravans.png",
    alt: "Vibe Motorhomes Logo",
    title: "Vibe Motorhomes",
    desc: "Read our VIBE Motorhomes Australia review covering top models, off-grid features and pricing from $92,990 for adventure seekers and travellers.",
    type: "Off Road, Hybrid, Semi Off Road",
    brand: "Vibe",
    link: "/vibe-caravans-australia-review-prices-models/",
  },
  {
    img: "/images/Ezytrail.png",
    alt: "Ezytrail Logo",
    title: "Ezytrail Motorhomes",
    desc: "Read our Ezytrail Motorhomes review from Aussie owners. Discover towing performance, comfort and durability to decide if an Ezytrail suits you.",
    type: "Off Road, Hybrid, On Road",
    brand: "Ezytrail",
    link: "/ezytrail-caravans-reviews-2025/",
  },
  {
    img: "/images/Avan.png",
    alt: "Avan Logo",
    title: "Avan Motorhomes",
    desc: "Explore our Avan Motorhomes review with 2025 models, key features and prices to help you choose the right motorhome for your travels in Australia.",
    type: "Campers, Pop Tops, Hard Tops",
    brand: "Avan",
    link: "/avan-caravans-review-features-prices/",
  },
  {
    img: "/images/blue_sky.png",
    alt: "Blue Sky Logo",
    title: "Blue Sky Motorhomes",
    desc: "Discover our Blue Sky Motorhomes review, comparing models, standout features and off-road ability to help Aussie travellers pick the right fit.",
    type: "Off-Road, Touring, Family, Luxury",
    brand: "Blue Sky",
    link: "/blue-sky-caravans-review-australia/",
  },
  {
    img: "/images/Crusader-Caravans.png",
    alt: "Crusader Motorhomes Logo",
    title: "Crusader Motorhomes",
    desc: "Read our Crusader Motorhomes review covering key features, model options and pricing to help you choose the perfect motorhome for your adventures.",
    type: "Off-Road, Touring, Family, Luxury",
    brand: "Crusader",
    link: "/crusader-caravans-review-features-compare-prices/",
  },
  {
    img: "/images/JB-caravans.png",
    alt: "JB Motorhomes Logo",
    title: "JB Motorhomes",
    desc: "Explore our JB Motorhomes review with 2025 models, prices and features. From off-road touring to luxury travel, find the perfect motorhome for you.",
    type: "Off-Road, Hybrid, On-Road",
    brand: "JB",
    link: "/jb-caravans-australia-models-reviews-prices/",
  },
  {
    img: "/images/MDC.png",
    alt: "MDC Motorhomes Logo",
    title: "MDC Motorhomes",
    desc: "Discover our MDC Motorhomes review, exploring features and comparing off-road models to help you choose the ideal adventure-ready motorhome today.",
    type: "Off-Road, Hybrid, On-Road",
    brand: "MDC",
    link: "/mdc-caravans-australia-reviews-features/",
  },
  {
    img: "/images/Ausflex-caravans.png",
    alt: "Ausflex Motorhomes Logo",
    title: "Ausflex Motorhomes",
    desc: "Read our Ausflex Motorhomes review of Australian-made models since 1972. Explore pricing, build quality and off-road capability for travellers.",
    type: "Off-Road, Family, On-Site",
    brand: "Ausflex",
    link: "/ausflex-caravans-australia-review-price/",
  },
  {
    img: "/images/Latitude.png",
    alt: "Latitude RV Motorhomes Logo",
    title: "Latitude RV Motorhomes",
    desc: "Explore our Latitude RV motorhomes review, featuring rugged builds, luxury touches, pricing and comparisons to help every Australian adventurer.",
    type: "Off-Road, Hybrid, On-Road",
    brand: "Latitude",
    link: "/latitude-rv-caravans-models-reviews-prices-features/",
  },
  {
    img: "/images/Adria.png",
    alt: "Adria Motorhomes Logo",
    title: "Adria Motorhomes",
    desc: "Read our Adria Motorhomes review comparing models, features and pricing to show why Adria remains a trusted choice for Australian travellers.",
    type: "Compact, Touring, Family, Luxury",
    brand: "Adria",
    link: "/adria-caravans-review-australia/",
  },
  {
    img: "/images/Fantasy-Caravans.png",
    alt: "Fantasy Motorhomes Logo",
    title: "Fantasy Motorhomes",
    desc: "Explore our Fantasy Motorhomes review covering Australian-made family models, build quality, off-road features and holiday-ready durability.",
    type: "Semi Off-Road, Hybrid, Off-Road",
    brand: "Fantasy",
    link: "/fantasy-caravans-review-models-prices/",
  },
  {
    img: "/images/Red-Centre-Caravans.png",
    alt: "Red Centre Motorhomes Logo",
    title: "Red Centre Motorhomes",
    desc: "Read our Red Centre Motorhomes review, exploring models, features and Australian-built quality to help you choose your next adventure van.",
    type: "Off-Road, Semi Off-Road, Touring, Hybrid",
    brand: "Red Centre",
    link: "/red-centre-caravans-review-australia/",
  },
  {
    img: "/images/Jayco.png",
    alt: "Jayco Motorhomes Logo",
    title: "Jayco Motorhomes",
    desc: "Read our Red Centre Motorhomes review, exploring models, features and Australian-built quality to help you choose your next adventure van.",
    type: "Pop Top, Camper Trailers, Off-Grid",
    brand: "Jayco",
    link: "/jayco-journey-outback-review/",
  },
  {
    img: "/images/urban-caravans.png",
    alt: "Urban Motorhomes Logo",
    title: "Urban Motorhomes",
    desc: "Discover our Urban Motorhomes review with model comparisons, features and pricing to help you choose a durable off-road-ready motorhome.",
    type: "Off-Road, Off-Grid, Hybrid, On-Road",
    brand: "AOA",
    link: "/Urban-caravans-australia-review-prices-models/",
  },
  {
    img: "/images/Vision_Logo.png",
    alt: "Vision RV Motorhomes Logo",
    title: "Vision RV Motorhomes",
    desc: "Explore our Vision RV Motorhomes review, comparing models, key features and off-road performance to help you choose the ideal tough motorhome.",
    type: "Off-Road, Family, Luxury",
    brand: "Vision RV",
    link: "/vision-rv-caravans-review-australia/",
  },
  {
    img: "/images/Trakmaster.png",
    alt: "Trakmaster Logo",
    title: "Trakmaster",
    desc: "Read our Trakmaster Pilbara Extreme review, exploring off-road strength, features and why this motorhome is built for serious adventure.",
    type: "Off-Road, Camper",
    brand: "Trakmaster",
    link: "/trakmaster-pilbara-extreme-review/",
  },
  {
    img: "/images/Austrack-Campers.png",
    alt: "Austrack Campers Logo",
    title: "Austrack Campers",
    desc: "Explore our Austrack Gibb 14 review, covering key features, performance and build quality to help you decide if it suits your travel needs.",
    type: "Off-Road, Hybrid",
    brand: "Austrack",
    link: "/austrack-campers-gibb-14-in-depth-review/",
  },
  {
    img: "/images/newgen-logo.png",
    alt: "Newgen Motorhomes Logo",
    title: "Newgen Motorhomes",
    desc: "Read our Newgen NG15 review exploring layout, premium features and off-road capability, helping you pick this standout hybrid motorhome.",
    type: "Off-Road, Hybrid",
    brand: "Newgen",
    link: "/newgen-caravans-ng15-comprehensive-review/",
  },
];

const Manufacture = () => {
  return (
    <div className="container">
      <div className="section-head mb-40">
        <h2>Top Motorhome Brands Reviewed – Real Insights, Real Value</h2>
        <p>Discover in-depth reviews of Australia’s most trusted motorhome manufacturers — with honest insights into build quality, off-road performance, layouts, comfort, and long-term reliability. Explore each brand to see how they truly stack up before you buy.</p>
      </div>

      <div className="range-home position-relative">

        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            nextEl: ".manu-next",
            prevEl: ".manu-prev",
          }}
          autoplay={{ delay: 3000 }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {data.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="post_item">
                <div className="post_image">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    width={300}
                    height={200}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <div className="post_info">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>

                  <ul className="mb-3">
                    <li>
                      <i className="bi bi-info-circle" />
                      <span>{item.type}</span>
                    </li>
                  </ul>

                  <Link href={item.link} target="_blank">
                    Read {item.brand} Review <i className="bi bi-chevron-right" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Arrows */}
        <div className="swiper-button-next manu-next" />
        <div className="swiper-button-prev manu-prev" />
      </div>
    </div>
  );
};

export default Manufacture;
