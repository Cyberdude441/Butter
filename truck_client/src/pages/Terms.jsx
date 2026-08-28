import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    <div style={{ backgroundColor: "#070d18", minHeight: "100vh", color: "#f8fafc" }}>
      <Navbar />

      <section className="py-5" style={{ backgroundColor: "#07141f", borderBottom: "1px solid #132d3e" }}>
        <div className="container py-4 text-center">
          <span className="badge rounded-pill px-3 py-2 mb-3 text-uppercase fw-bold" style={{ backgroundColor: "rgba(214, 168, 79, 0.15)", color: "#d6a84f", fontSize: "0.75rem" }}>
            TERMS OF SERVICE
          </span>
          <h1 className="display-5 fw-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Terms of Use
          </h1>
          <p style={{ color: "#94a3b8" }}>Effective Date: August 2026</p>
        </div>
      </section>

      <section className="py-5">
        <div className="container py-3" style={{ maxWidth: "850px" }}>
          <div className="p-4 p-md-5 rounded-4" style={{ backgroundColor: "#091a27", border: "1px solid #162f45", lineHeight: "1.8", color: "#cbd5e1" }}>
            <h4 className="fw-bold text-white mb-3" style={{ color: "#d6a84f" }}>1. Acceptance of Terms</h4>
            <p>
              By accessing or using the Butter Freight platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please refrain from using our decision-support services.
            </p>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>2. Nature of the Service</h4>
            <p>
              Butter Freight provides predictive freight analytics, vessel recommendation algorithms, and port queue estimations based on statistical machine learning models (XGBoost, SARIMA) and public maritime indices. These projections serve as operational decision support and do not constitute guaranteed commercial fixture agreements or financial warranties.
            </p>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>3. User Responsibilities</h4>
            <p>
              Users are responsible for ensuring that cargo parameters, port constraints, and vessel specifications submitted to the system conform to their actual operational mandates. Final chartering contracts, laytime terms, and bills of lading remain under the discretion of the charterer and shipowner.
            </p>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>4. Intellectual Property</h4>
            <p>
              All proprietary forecasting algorithms, vessel optimization scoring models, user interface designs, and AI Co-Pilot logic are the exclusive intellectual property of Butter Freight.
            </p>

            <h4 className="fw-bold text-white mt-4 mb-3" style={{ color: "#d6a84f" }}>5. Inquiries & Support</h4>
            <p>
              For legal questions regarding these terms, please contact <a href="mailto:legal@butterfreight.com" style={{ color: "#d6a84f" }}>legal@butterfreight.com</a>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
