import { ports, vesselTypes } from "../data/ports.js";

export const analyzePorts = (vesselType) => {
  const vessel = vesselTypes.find(
    (v) => v.type.toLowerCase() === vesselType.toLowerCase()
  );

  if (!vessel) {
    throw new Error(`Unknown vessel type: ${vesselType}`);
  }

  const portResults = ports.map((port) => {
    const restrictions = [];

    // Special anchorage
    if (port.id === "sagar-sandheads") {
      return {
        ...port,
        status: "special",
        restrictions: [
          "Deep-water anchorage",
          "STS transfer rather than fixed-berth operation",
        ],
      };
    }

    if (
      port.maxDraft !== null &&
      vessel.maxDraft > port.maxDraft
    ) {
      restrictions.push(
        `Draft exceeds ${port.maxDraft}m limit`
      );
    }

    if (
      port.maxLOA !== null &&
      vessel.maxLOA > port.maxLOA
    ) {
      restrictions.push(
        `LOA exceeds ${port.maxLOA}m limit`
      );
    }

    if (
      port.maxBeam !== null &&
      vessel.maxBeam > port.maxBeam
    ) {
      restrictions.push(
        `Beam exceeds ${port.maxBeam}m limit`
      );
    }

    if (
      port.maxDWT !== null &&
      vessel.maxDWT > port.maxDWT
    ) {
      restrictions.push(
        `DWT exceeds ${port.maxDWT.toLocaleString()} tons`
      );
    }

    return {
      ...port,
      status:
        restrictions.length === 0
          ? "compatible"
          : "restricted",
      restrictions,
    };
  });

  return {
    vessel,
    portResults,
    compatiblePorts: portResults.filter(
      (p) => p.status === "compatible"
    ),
    restrictedPorts: portResults.filter(
      (p) => p.status === "restricted"
    ),
    specialPorts: portResults.filter(
      (p) => p.status === "special"
    ),
  };
};