import React, { useState } from "react";
import Footer from "./Footer";
import { PAYMENT_URL, RAZORPAY_KEY } from "../config/api";

function Pricing() {
  // ✅ REQUIRED STATES
  const [isYearly, setIsYearly] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  // ✅ FAQ toggle
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // ✅ Razorpay script loader
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ PAYMENT HANDLER (FIXED)
  const handlePayment = async (plan) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK load failed");
      return;
    }

    // ✅ Convert to paise
    const amount = (isYearly ? plan.yearly : plan.monthly) * 100;

    const order = await fetch(`${PAYMENT_URL}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }).then((res) => res.json());

    if (!order || !order.id) {
      alert("Order creation failed");
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "GST INVOICE GENERATOR",
      description: plan.title + " Purchase",
      order_id: order.id,

      handler: async function (response) {
        const verify = await fetch(`${PAYMENT_URL}/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: order.id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        }).then((res) => res.json());

        if (verify.success) {
          alert("Payment Successful! ✔");
        } else {
          alert("Payment Failed ❌");
        }
      },
    };

    const payment = new window.Razorpay(options);
    payment.open();
  };

  // ✅ PLANS DATA
  const plans = [
    {
      title: "Basic Plan",
      monthly: 9,
      yearly: 99,
      items: [
        "1 Project",
        "100K API Access",
        "100MB Storage",
        "Weekly Reports (X)",
        "7/24 Support (X)",
      ],
    },
    {
      title: "Premium Plan",
      monthly: 19,
      yearly: 199,
      items: [
        "5 Projects",
        "100K API Access",
        "200MB Storage",
        "Weekly Reports",
        "7/24 Support (X)",
      ],
    },
    {
      title: "Corporate Plan",
      monthly: 49,
      yearly: 499,
      items: [
        "20 Projects",
        "300K API Access",
        "500MB Storage",
        "Weekly Reports",
        "7/24 Support",
      ],
    },
  ];

  // ✅ FAQ DATA
  const faqData = [
    "Can I cancel my subscription?",
    "Which payment methods do you accept?",
    "How can I manage my Account?",
    "Is my credit card information secure?",
    "How do I get my subscription receipt?",
    "Are there any discounts for people in need?",
    "Do you offer a free trial edit?",
    "How do I reset my Account password?",
  ];

  return (
    <>
      {/* HERO */}
      <section className="wrapper bg-soft-primary">
        <div className="container pt-10 pb-20 text-center">
          <h1 className="display-1 mb-3">Our Pricing</h1>
          <p className="lead mb-0 px-xl-10">
            We offer great prices, premium products and quality service for your business.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section className="wrapper">
        <div className="container pb-16">

          {/* SWITCH */}
          <div className="pricing-switcher-wrapper switcher text-center mb-10 mt-8">
            <span className="pe-3">Monthly</span>

            <div
              className="pricing-switchers"
              style={{ cursor: "pointer" }}
              onClick={() => setIsYearly(!isYearly)}
            >
              <div className={`pricing-switcher ${!isYearly ? "pricing-switcher-active" : ""}`}></div>
              <div className={`pricing-switcher ${isYearly ? "pricing-switcher-active" : ""}`}></div>
              <div
                className="switcher-button bg-primary"
                style={{
                  transform: isYearly ? "translateX(10%)" : "translateX(0)",
                  transition: "0.5s",
                }}
              ></div>
            </div>

            <span className="ps-3">Yearly</span>
          </div>

          {/* CARDS */}
          <div className="row gy-6 mt-5">
            {plans.map((plan, index) => (
              <div className="col-md-6 col-lg-4" key={index}>
                <div className="pricing card text-center">
                  <div className="card-body">
                    <h4 className="card-title">{plan.title}</h4>

                    <div className="prices text-dark mb-4">
                      <span className="price-currency">₹</span>
                      <span className="price-value">
                        {isYearly ? plan.yearly : plan.monthly}
                      </span>
                      <span className="price-duration">{isYearly ? "/yr" : "/mo"}</span>
                    </div>

                    <ul className="icon-list bullet-bg bullet-soft-primary mt-7 mb-8 text-start">
                      {plan.items.map((item, i) => (
                        <li key={i}>
                          {item.includes("(X)") ? (
                            <i className="uil uil-times bullet-soft-red"></i>
                          ) : (
                            <i className="uil uil-check"></i>
                          )}
                          <span>{item.replace("(X)", "")}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePayment(plan)}
                      className="btn btn-primary rounded-pill"
                    >
                      Choose Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <h2 className="display-4 mb-3 text-center mt-10">Pricing FAQ</h2>
          <div className="row">
            {faqData.map((q, i) => (
              <div className="col-lg-6 mb-4" key={i}>
                <div className="card">
                  <div className="card-header" onClick={() => toggleFAQ(i)}>
                    <h5>{q}</h5>
                  </div>
                  {openFAQ === i && (
                    <div className="card-body">
                      <p>Answer goes here.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}

export default Pricing;
