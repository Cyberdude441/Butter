import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div style={{ backgroundColor: "#070d18", minHeight: "100vh", color: "#f8fafc" }}>
      <Navbar />

      <section className="py-5" style={{ backgroundColor: "#07141f", borderBottom: "1px solid #132d3e" }}>
        <div className="container py-4 text-center">
          <span className="badge rounded-pill px-3 py-2 mb-3 text-uppercase fw-bold" style={{ backgroundColor: "rgba(214, 168, 79, 0.15)", color: "#d6a84f", fontSize: "0.75rem" }}>
            LEGAL DOCUMENTATION
          </span>
          <h1 className="display-5 fw-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "#94a3b8" }}>Last Updated: August 2026</p>
        </div>
      </section>

      <section className="py-5">
        <div className="container py-3" style={{ maxWidth: "850px" }}>
          <div className="p-4 p-md-5 rounded-4" style={{ backgroundColor: "#091a27", border: "1px solid #162f45", lineHeight: "1.8", color: "#cbd5e1" }}>
            <h4 className="fw-bold text-white mb-3" style={{ color: "#d6a84f" }}>1. Introduction</h4>
            <p>
              Butter Freight ("we", "our", or "us") provides maritime dry bulk freight forecasting, vessel optimization, and port decision intelligence. We are dedicated to protecting your organizational data and proprietary chartering inquiries.
            </p>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>2. Information We Process</h4>
            <p>
              We process information necessary to generate freight intelligence and support your procurement decisions:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, professional email address, organization name, and authentication credentials.</li>
              <li><strong>Charter Query Parameters:</strong> Origin loading ports, destination discharge ports, cargo commodity types, parcel volumes in Metric Tonnes, and contract duration windows.</li>
              <li><strong>Technical Telemetry:</strong> Anonymized interaction metrics, API performance logs, and AI Co-Pilot conversational context.</li>
            </ul>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>3. How Information is Used</h4>
            <p>
              Your query inputs are strictly used to compute ML model projections, evaluate vessel suitability, assess port congestion delays, and deliver operational insights. We do not sell your commercial trade inquiries to third parties or commodity trading desks.
            </p>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>4. Data Security & Storage</h4>
            <p>
              All communications between your client browser and our forecasting servers are secured via industry-standard TLS encryption. Stored tokens and credentials utilize cryptographic hashing.
            </p>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>5. Contact Us</h4>
            <p>
              If you have any questions or data privacy inquiries, contact our data protection team at <a href="mailto:privacy@butterfreight.com" style={{ color: "#d6a84f" }}>privacy@butterfreight.com</a>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
