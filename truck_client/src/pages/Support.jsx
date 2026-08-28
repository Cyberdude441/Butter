import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Support() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How do I generate an accurate freight forecast?",
      a: "Navigate to the Decision Cockpit (/forecast_query). Select your origin loading port (e.g. Australia Newcastle), Indian destination discharge port (e.g. Paradip or Gangavaram), cargo parcel size in Metric Tonnes, vessel class, and horizon (30-day spot or 90-day mid-term). The system will automatically run our Multi-Horizon XGBoost + SARIMA ML model with calibrated bunker fuel indices.",
    },
    {
      q: "How does the AI Vessel Optimization work?",
      a: "When you select a baseline vessel class (such as Panamax), the system simultaneously models all other feasible dry bulk vessel classes (Handysize, Supramax, Capesize). It evaluates port draft/LOA limits, calculates deadweight parcel utilization, estimates queue delays, and calculates exact waiting time days saved and idle reduction percentage.",
    },
    {
      q: "How does Port Infrastructure analysis reduce demurrage?",
      a: "The platform integrates real-time Sagar Unnati berth telemetry and congestion indices across 7 East Coast Indian ports. If your chosen discharge port is experiencing heavy wait queues, the Port Optimizer evaluates nearby alternative terminals and quantifies the operational score advantage.",
    },
    {
      q: "How do I interact with the AI Co-Pilot?",
      a: "On the forecast dashboard, click the '✦ Ask AI' button in the sidebar or bottom-right floating trigger. The AI Co-Pilot is fully grounded in your active route, live ML rate predictions, port congestion indices, and vessel optimization recommendations.",
    },
    {
      q: "What data sources calibrate the freight forecasting engine?",
      a: "Our model synthesizes historical fixtures, Baltic Dry Index (BDI) sub-indices (Capesize BCI, Panamax BPI, Supramax BSI), VLSFO bunker fuel prices at Singapore/Fujairah, voyage distances, monsoon seasonality, and live vessel tracking.",
    },
  ];

  return (
    <div style={{ backgroundColor: "#070d18", minHeight: "100vh", color: "#f8fafc" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="py-5" style={{ backgroundColor: "#07141f", borderBottom: "1px solid #132d3e" }}>
        <div className="container py-4 text-center">
          <span className="badge rounded-pill px-3 py-2 mb-3 text-uppercase fw-bold" style={{ backgroundColor: "rgba(214, 168, 79, 0.15)", color: "#d6a84f", border: "1px solid rgba(214, 168, 79, 0.35)", fontSize: "0.75rem" }}>
            SUPPORT & KNOWLEDGEBASE
          </span>
          <h1 className="display-5 fw-bold text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>
            How Can We Assist Your Chartering Team?
          </h1>
          <p className="mx-auto lead" style={{ maxWidth: "650px", color: "#94a3b8", fontSize: "1.05rem" }}>
            Guides, operational documentation, and assistance for bulk cargo procurement teams and chartering managers.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-primary px-4 py-2 fw-semibold rounded-3" onClick={() => navigate("/forecast_query")} style={{ backgroundColor: "#1e88e5" }}>
              Open Decision Cockpit →
            </button>
            <a href="#contact-support" className="btn btn-outline-light px-4 py-2 fw-semibold rounded-3" style={{ borderColor: "#285943", color: "#e2e8f0" }}>
              Contact Operations Desk
            </a>
          </div>
        </div>
      </section>

      {/* Guide Pillars */}
      <section className="py-5">
        <div className="container py-3">
          <div className="row g-4">
            {[
              {
                icon: "📈",
                title: "Forecasting Pipeline",
                desc: "Learn how multi-horizon ensemble modeling projects spot and period rates 30 to 90 days ahead with empirical confidence intervals.",
              },
              {
                icon: "🚢",
                title: "Vessel Optimization",
                desc: "Discover how our optimization engine compares Handysize, Supramax, Panamax, and Capesize to minimize waiting time and deadheading.",
              },
              {
                icon: "⚓",
                title: "Port Readiness & Draft",
                desc: "Understand draft, LOA, beam restrictions and live congestion scoring across 7 East Coast Indian bulk terminals.",
              },
            ].map((pillar, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card h-100 p-4 rounded-4" style={{ backgroundColor: "#0b1926", border: "1px solid #162f45" }}>
                  <div className="fs-1 mb-3">{pillar.icon}</div>
                  <h5 className="fw-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>{pillar.title}</h5>
                  <p className="small mb-0" style={{ color: "#94a3b8", lineHeight: "1.6" }}>{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-5" style={{ backgroundColor: "#06121c" }}>
        <div className="container py-3" style={{ maxWidth: "800px" }}>
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Frequently Asked Questions</h2>
            <p style={{ color: "#94a3b8" }}>Answers to common questions about our freight forecasting and charter intelligence platform.</p>
          </div>

          <div className="d-flex flex-column gap-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-3 p-3"
                style={{
                  backgroundColor: "#091c2b",
                  border: openFaq === index ? "1px solid #d6a84f" : "1px solid #162f45",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0 text-white" style={{ fontSize: "1rem" }}>{faq.q}</h6>
                  <span style={{ color: "#d6a84f", fontSize: "1.2rem", fontWeight: "bold" }}>
                    {openFaq === index ? "−" : "+"}
                  </span>
                </div>
                {openFaq === index && (
                  <p className="mt-3 mb-0 small" style={{ color: "#cbd5e1", lineHeight: "1.7", borderTop: "1px solid #132d3e", paddingTop: "12px" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section id="contact-support" className="py-5">
        <div className="container py-4 text-center">
          <div className="p-5 rounded-4 mx-auto" style={{ maxWidth: "700px", backgroundColor: "#091e23", border: "1px solid rgba(214, 168, 79, 0.35)" }}>
            <h3 className="fw-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>Need Direct Operational Assistance?</h3>
            <p style={{ color: "#94a3b8" }}>Our freight desk is available for enterprise data integrations and custom route modeling.</p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <a href="mailto:support@butterfreight.com" className="btn btn-warning fw-bold px-4 py-2 rounded-3" style={{ backgroundColor: "#d6a84f", color: "#071b1e" }}>
                Email Support Desk
              </a>
              <Link to="/#contact" className="btn btn-outline-light px-4 py-2 rounded-3">
                Send Inquiry Form
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
