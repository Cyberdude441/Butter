import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createMarker = (color) => L.divIcon({
  className: "route-marker",
  html: `<span style="background:${color}"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const FitRoute = ({ points }) => {
  const map = useMap();
  map.fitBounds(points, { padding: [28, 28] });
  return null;
};

const RouteMap = ({ origin, destination, originLabel, originCoordinates, destinationCoordinates }) => {
  if (!originCoordinates || !destinationCoordinates) {
    return <div className="route-map-empty">Route map unavailable for this lane.</div>;
  }

  const points = [
    [originCoordinates.lat, originCoordinates.lng],
    [destinationCoordinates.lat, destinationCoordinates.lng],
  ];

  return (
    <MapContainer className="route-map" center={points[0]} zoom={3} scrollWheelZoom={false} zoomControl={false}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRoute points={points} />
      <Polyline positions={points} pathOptions={{ color: "#416b52", weight: 3, lineCap: "round", lineJoin: "round" }} />
      <Marker position={points[0]} icon={createMarker("#a8c99d")}>
        <Tooltip permanent direction="right" offset={[10, 0]}>{originLabel || origin}</Tooltip>
      </Marker>
      <Marker position={points[1]} icon={createMarker("#d88978")}>
        <Tooltip permanent direction="left" offset={[-10, 0]}>{destination}</Tooltip>
      </Marker>
    </MapContainer>
  );
};

export default RouteMap;
