import React from "react";

// Official Adani Group Tri-Color Curved Bar / Emblem
export const AdaniLogo = ({ className = "", style = {} }) => (
  <svg
    viewBox="0 0 100 40"
    height="24"
    width="56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ objectFit: "contain", verticalAlign: "middle", ...style }}
    aria-label="Adani Logo"
  >
    <path d="M8 28C8 16 16 8 28 8h6c-10 0-16 8-16 20h-4z" fill="#0284c7" />
    <path d="M18 28C18 19 24 13 34 13h6c-8 0-14 6-14 15h-6z" fill="#0d9488" />
    <path d="M28 28C28 22 32 18 40 18h6c-6 0-10 4-10 10h-6z" fill="#f59e0b" />
    <circle cx="60" cy="20" r="12" fill="#0284c7" opacity="0.15" />
    <path d="M52 26l6-14h4l6 14h-3.8l-1.4-3.6h-7.6L54.4 26H52zm5-6.5h5.4L59.7 14h-.2l-2.5 5.5z" fill="#ffffff" />
    <path d="M72 12h3.5v14H72V12z" fill="#0d9488" />
  </svg>
);

// Official JSW Group Angled Polygon / Dynamic Shield
export const JSWLogo = ({ className = "", style = {} }) => (
  <svg
    viewBox="0 0 90 40"
    height="24"
    width="52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ objectFit: "contain", verticalAlign: "middle", ...style }}
    aria-label="JSW Logo"
  >
    {/* JSW Dynamic Red & Blue Prisms */}
    <path d="M6 10l12-4v28l-12-4V10z" fill="#dc2626" />
    <path d="M22 6l14 5v18l-14 5V6z" fill="#1d4ed8" />
    <path d="M40 11l10-3v24l-10-3V11z" fill="#dc2626" />
    <path d="M54 8l12 4v20l-12 4V8z" fill="#2563eb" />
    <text x="70" y="27" font-family="'DM Sans', sans-serif" font-weight="900" font-size="16" fill="#ffffff" letterSpacing="0.05em">
      JSW
    </text>
  </svg>
);

// Official Vedanta Leaf & Power Ring Emblem
export const VedantaLogo = ({ className = "", style = {} }) => (
  <svg
    viewBox="0 0 100 40"
    height="24"
    width="56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ objectFit: "contain", verticalAlign: "middle", ...style }}
    aria-label="Vedanta Logo"
  >
    <circle cx="20" cy="20" r="14" stroke="#10b981" strokeWidth="2.5" fill="none" />
    <path d="M20 9c0 6 5 11 11 11-6 0-11-5-11-11z" fill="#10b981" />
    <path d="M20 9c0 6-5 11-11 11 6 0 11-5 11-11z" fill="#d6a84f" />
    <circle cx="20" cy="20" r="4" fill="#ffffff" />
    <text x="40" y="26" font-family="'DM Sans', sans-serif" font-weight="700" font-size="16" fill="#ffffff" letterSpacing="0.02em">
      vedanta
    </text>
  </svg>
);

// Official AM/NS India (ArcelorMittal Nippon Steel) Infinity Ribbon
export const AMNSLogo = ({ className = "", style = {} }) => (
  <svg
    viewBox="0 0 110 40"
    height="24"
    width="64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ objectFit: "contain", verticalAlign: "middle", ...style }}
    aria-label="AM/NS India Logo"
  >
    {/* Orange & Blue ArcelorMittal Ribbon Loop */}
    <path d="M8 20c0-6 5-11 11-11s11 5 16 11c5 6 10 11 16 11s11-5 11-11-5-11-11-11c-6 0-11 5-16 11-5-6-10-11-16-11S8 14 8 20z" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M35 20c5 6 10 11 16 11s11-5 11-11" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <text x="68" y="25" font-family="'DM Sans', sans-serif" font-weight="800" font-size="13" fill="#ffffff" letterSpacing="0.04em">
      AM/NS
    </text>
  </svg>
);

// Official Maithan Alloys Industrial Shield & Monogram
export const MaithanLogo = ({ className = "", style = {} }) => (
  <svg
    viewBox="0 0 115 40"
    height="24"
    width="64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ objectFit: "contain", verticalAlign: "middle", ...style }}
    aria-label="Maithan Alloys Logo"
  >
    {/* Corporate M Shield */}
    <path d="M8 6h24v18c0 7-12 12-12 12S8 31 8 24V6z" fill="#092834" stroke="#d6a84f" strokeWidth="1.5" />
    <path d="M12 12l8 10 8-10v14h-3v-8.5l-5 6.5-5-6.5V26h-3V12z" fill="#ffffff" />
    <text x="38" y="24" font-family="'DM Sans', sans-serif" font-weight="700" font-size="13" fill="#ffffff">
      Maithan
    </text>
  </svg>
);
