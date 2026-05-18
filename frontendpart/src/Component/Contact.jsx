import React, { useState } from "react";
import Footer from "./Footer";
import { NavLink } from "react-router-dom";
import { API_URL } from "../config/api";

function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    message: ""
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus("✅ Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        message: ""
      });
    } catch (err) {
      setStatus("❌ Failed to send message");
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="wrapper bg-soft-primary">
        <div className="container pt-10 pb-19 text-center">
          <h1 className="display-1 mb-3">Get in Touch</h1>
          <nav>
            <NavLink to="/">Home</NavLink>
          </nav>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="wrapper bg-light">
        <div className="container py-14">
          <h2 className="display-4 mb-3 text-center">Drop Us a Line</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="row gx-4">

              <div className="col-md-6">
                <input
                  type="text"
                  name="firstName"
                  className="form-control mb-3"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <input
                  type="text"
                  name="lastName"
                  className="form-control mb-3"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <input
                  type="email"
                  name="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <select
                  className="form-select mb-3"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div className="col-12">
                <textarea
                  name="message"
                  className="form-control mb-3"
                  placeholder="Your Message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="col-12 text-center">
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-5"
                >
                  Send Message
                </button>

                {status && <p className="mt-3">{status}</p>}
              </div>

            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;
