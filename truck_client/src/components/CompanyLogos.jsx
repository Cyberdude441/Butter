import React from "react";
import adaniImg from "../assets/logos/adani.png";
import jswImg from "../assets/logos/jsw.png";
import vedantaImg from "../assets/logos/vedanta.png";
import amnsImg from "../assets/logos/amns.png";
import maithanImg from "../assets/logos/maithan.png";

export const AdaniLogo = ({ className = "", style = {} }) => (
  <img
    src={adaniImg}
    alt="Adani Logo"
    className={`official-company-logo ${className}`}
    style={{
      height: "28px",
      width: "auto",
      maxWidth: "105px",
      objectFit: "contain",
      verticalAlign: "middle",
      filter: "brightness(1.15) contrast(1.1)",
      ...style,
    }}
  />
);

export const JSWLogo = ({ className = "", style = {} }) => (
  <img
    src={jswImg}
    alt="JSW Logo"
    className={`official-company-logo ${className}`}
    style={{
      height: "28px",
      width: "auto",
      maxWidth: "95px",
      objectFit: "contain",
      verticalAlign: "middle",
      filter: "brightness(1.1) contrast(1.1)",
      ...style,
    }}
  />
);

export const VedantaLogo = ({ className = "", style = {} }) => (
  <div className="d-inline-flex align-items-center gap-2" style={{ verticalAlign: "middle" }}>
    <img
      src={vedantaImg}
      alt="Vedanta Logo"
      className={`official-company-logo ${className}`}
      style={{
        height: "30px",
        width: "30px",
        objectFit: "contain",
        filter: "brightness(1.15)",
        ...style,
      }}
    />
    <strong
      className="trusted-client"
      style={{
        color: "#f8fafc",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "1.18rem",
        fontWeight: "700",
        letterSpacing: "0.01em",
      }}
    >
      vedanta
    </strong>
  </div>
);

export const AMNSLogo = ({ className = "", style = {} }) => (
  <img
    src={amnsImg}
    alt="AM/NS INDIA Logo"
    className={`official-company-logo ${className}`}
    style={{
      height: "30px",
      width: "auto",
      maxWidth: "110px",
      objectFit: "contain",
      verticalAlign: "middle",
      filter: "brightness(1.1) contrast(1.1)",
      ...style,
    }}
  />
);

export const MaithanLogo = ({ className = "", style = {} }) => (
  <img
    src={maithanImg}
    alt="Maithan Alloys Logo"
    className={`official-company-logo ${className}`}
    style={{
      height: "30px",
      width: "auto",
      maxWidth: "140px",
      objectFit: "contain",
      verticalAlign: "middle",
      filter: "brightness(1.25) contrast(1.1)",
      ...style,
    }}
  />
);
