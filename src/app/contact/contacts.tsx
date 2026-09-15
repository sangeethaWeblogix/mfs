"use client";

import React, { useState } from "react";

type FormState = {
  "your-name": string;
  "your-email": string;
  "your-phone": string;
  "you-postcode": string; // keep as-is since your CF7 works with this key
  "your-message": string;
};

type MessageType = "success" | "warning" | "error" | "";

export default function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");
  const [formData, setFormData] = useState<FormState>({
    "your-name": "",
    "your-email": "",
    "your-phone": "",
    "you-postcode": "",
    "your-message": "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // clear field error on change
    if (errors[e.target.name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!formData["your-name"].trim()) next["your-name"] = "Name is required.";
    if (!formData["your-email"].trim()) {
      next["your-email"] = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData["your-email"])) {
      next["your-email"] = "Enter a valid email.";
    }
    if (!formData["your-phone"].trim()) {
      next["your-phone"] = "Phone is required.";
    } else if (!/^[0-9\s+\-()]{7,20}$/.test(formData["your-phone"])) {
      next["your-phone"] = "Enter a valid phone number.";
    }
    if (!formData["you-postcode"].trim()) {
      next["you-postcode"] = "Postcode is required.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (loading) return; // guard
    if (!validate()) {
      setMessage("All fields are required. Description is optional.");
      setMessageType("warning");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("_wpcf7", "72");
      form.append("_wpcf7_version", "5.9.3");
      form.append("_wpcf7_locale", "en_US");
      form.append("_wpcf7_unit_tag", "wpcf7-f72-p45-o1");
      form.append("_wpcf7_container_post", "45");

      Object.entries(formData).forEach(([key, value]) =>
        form.append(key, value)
      );

      const res = await fetch(
        "https://admin.motorhomesforsale.com.au/wp-json/contact-form-7/v1/contact-forms/72/feedback",
        { method: "POST", body: form }
      );

      const data = await res.json();

      if (data.status === "mail_sent") {
        setMessage("Message sent successfully!");
        setMessageType("success");
        // clear form + errors
        setFormData({
          "your-name": "",
          "your-email": "",
          "your-phone": "",
          "you-postcode": "",
          "your-message": "",
        });
        setErrors({});
      } else {
        setMessage(data.message || "Failed to send message.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="community contact_top section-padding style-5">
        <div className="container">
          <div className="section-head text-center style-4">
            <h2 className="text-center mb-20">Get in Touch</h2>
          </div>
        </div>
      </section>

      <section className="contact section-padding pt-0 style-6">
        <div className="container">
          <div className="content">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 max-w-md mx-auto p-4"
                  noValidate
                >
                  {/* Top alert only when errors exist */}

                  {/* Show server message */}
                  {message && (
                    <div
                      className={`contact-alert contact-alert--${messageType}`}
                      role="status"
                      aria-live="polite"
                    >
                      <span className="contact-alert__icon" aria-hidden="true">
                        {messageType === "success" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                        {messageType === "warning" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></svg>
                        )}
                        {messageType === "error" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        )}
                      </span>
                      <span>{message}</span>
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-group mb-20">
                        <input
                          type="text"
                          name="your-name"
                          className="form-control"
                          placeholder="Name*"
                          value={formData["your-name"]}
                          onChange={handleChange}
                          required
                        />
                        {errors["your-name"] && (
                          <small className="text-danger">
                            {errors["your-name"]}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="form-group mb-20">
                        <input
                          type="email"
                          name="your-email"
                          className="form-control"
                          placeholder="Email*"
                          value={formData["your-email"]}
                          onChange={handleChange}
                          required
                        />
                        {errors["your-email"] && (
                          <small className="text-danger">
                            {errors["your-email"]}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="form-group mb-20">
                        <input
                          type="tel"
                          name="your-phone"
                          className="form-control"
                          placeholder="Phone*"
                          value={formData["your-phone"]}
                          onChange={handleChange}
                          required
                        />
                        {errors["your-phone"] && (
                          <small className="text-danger">
                            {errors["your-phone"]}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="form-group mb-20">
                        <input
                          type="text"
                          name="you-postcode"
                          className="form-control"
                          placeholder="Postcode*"
                          value={formData["you-postcode"]}
                          onChange={handleChange}
                          required
                        />
                        {errors["you-postcode"] && (
                          <small className="text-danger">
                            {errors["you-postcode"]}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="form-group mb-20">
                        <textarea
                          className="form-control"
                          name="your-message"
                          value={formData["your-message"]}
                          onChange={handleChange}
                          placeholder="How can we help you?*"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="col-lg-12 text-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-blue4 fw-bold text-white text-light fs-12px"
                      >
                        {loading ? "SUBMITTING..." : "SUBMIT"}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Optional: small hint below the form */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
