// truck_server/data/ports.js

export const ports = [
  {
    id: "paradip",
    name: "Paradip Port",
    state: "Odisha",
    maxDraft: 16.5,
    maxLOA: 300,
    maxBeam: 46,
    maxDWT: 155000,
    berths: 21,
    cargoHandlingRate: null,
    maxVesselType: "Capesize",
    notes:
      "Deep-water port with single point moorings ~20km offshore; handles bulk cargo and crude oil.",
  },

  {
    id: "gangavaram",
    name: "Gangavaram Port",
    state: "Andhra Pradesh",
    maxDraft: 21,
    maxLOA: null,
    maxBeam: null,
    maxDWT: 200000,
    berths: 9,
    cargoHandlingRate: null,
    maxVesselType: "Super Capesize",
    notes:
      "Deepest port on India's East Coast; handles fully laden Super Capesize vessels.",
  },

  {
    id: "gopalpur",
    name: "Gopalpur Port",
    state: "Odisha",
    maxDraft: 13.5,
    maxLOA: 240,
    maxBeam: 36,
    maxDWT: null,
    berths: 3,
    cargoHandlingRate: 59150,
    maxVesselType: "Panamax",
    notes:
      "Smaller port between Paradip and Vizag; strong iron ore handling record.",
  },

  {
    id: "dhamra",
    name: "Dhamra Port",
    state: "Odisha",
    maxDraft: 18,
    maxLOA: 290,
    maxBeam: 47,
    maxDWT: 180000,
    berths: 13,
    cargoHandlingRate: null,
    maxVesselType: "Capesize",
    notes:
      "Handles coal and iron ore; can accommodate vessels larger than standard Capesize.",
  },

  {
    id: "haldia",
    name: "Haldia Dock Complex",
    state: "West Bengal",
    maxDraft: 9.1,
    maxLOA: 230,
    maxBeam: 32.26,
    maxDWT: null,
    berths: 12,
    cargoHandlingRate: null,
    maxVesselType: "Panamax",
    notes:
      "Shallow draft; larger vessels may require partial loading and offshore transfer operations.",
  },

  {
    id: "vizag",
    name: "Visakhapatnam Port",
    state: "Andhra Pradesh",
    maxDraft: 17,
    maxLOA: 280,
    maxBeam: 43,
    maxDWT: null,
    berths: null,
    cargoHandlingRate: null,
    maxVesselType: "Panamax",
    notes:
      "Major East Coast port; infrastructure values are approximate.",
  },

  {
    id: "sagar-sandheads",
    name: "Sagar-Sandheads",
    state: "West Bengal",
    maxDraft: null,
    maxLOA: null,
    maxBeam: null,
    maxDWT: null,
    berths: null,
    cargoHandlingRate: null,
    maxVesselType: "STS Transfer",
    notes:
      "Deep-water anchorage used for ship-to-ship cargo transfer rather than conventional berthing.",
  },
];

export const vesselTypes = [
  {
    type: "Handysize",
    maxDWT: 40000,
    maxLOA: 190,
    maxBeam: 32,
    maxDraft: 12,
  },
  {
    type: "Supramax",
    maxDWT: 60000,
    maxLOA: 200,
    maxBeam: 32,
    maxDraft: 13,
  },
  {
    type: "Panamax",
    maxDWT: 80000,
    maxLOA: 230,
    maxBeam: 32.3,
    maxDraft: 14,
  },
  {
    type: "Capesize",
    maxDWT: 180000,
    maxLOA: 300,
    maxBeam: 48,
    maxDraft: 18,
  },
];