"use client";

import { useState } from "react";
import { FAQ_CATEGORIES, HOME_FAQ, type FaqCategoryKey } from "./homeFaqData";
import "./homeFaq.css";

export default function HomeFaq() {
  const [activeCategory, setActiveCategory] = useState<FaqCategoryKey>(FAQ_CATEGORIES[0].key);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const activeLabel = FAQ_CATEGORIES.find((c) => c.key === activeCategory)?.label ?? "";
  const items = HOME_FAQ[activeCategory];

  const selectCategory = (key: FaqCategoryKey) => {
    setActiveCategory(key);
    setOpenIndex(0);
  };

  return (
    <section className="hfaq-section">
      <div className="container">
        <h2 className="hfaq-title">Frequently Asked Questions</h2>

        <div className="hfaq-tabs" role="tablist" aria-label="FAQ categories">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.key}
              className={`hfaq-tab${activeCategory === cat.key ? " hfaq-tab--active" : ""}`}
              onClick={() => selectCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="hfaq-panel">
          <div className="hfaq-panel-head">
            <h3 className="hfaq-panel-title">{activeLabel}</h3>
            <span className="hfaq-panel-count">{items.length} questions</span>
          </div>

          <div className="hfaq-list">
            {items.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={item.question} className={`hfaq-item${isOpen ? " hfaq-item--open" : ""}`}>
                  <button
                    type="button"
                    className="hfaq-question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span>{item.question}</span>
                    <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <div
                      className="hfaq-answer"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
