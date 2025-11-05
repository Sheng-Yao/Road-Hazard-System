"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Pick marker color based on hazard type
function getRiskLevel(type) {
  switch (type?.toLowerCase()) {
    case "pothole":
      return "medium";
    case "flood":
      return "high";
    case "accident":
      return "high";
    case "roadkill":
      return "low";
    default:
      return "low";
  }
}

// Function to choose marker color based on hazard_type
const getColorIcon = (risk) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${
      risk === "high" ? "red" : risk === "medium" ? "orange" : "green"
    }.png`,
    shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

export default function HazardMap({ hazards }) {
  const defaultPosition = [2.945747, 101.87509]; // Singapore center (change if needed)

  return (
    <MapContainer
      center={defaultPosition}
      zoom={11}
      style={{ height: "500px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {hazards.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={getColorIcon(getRiskLevel(h.hazard_type))} // default to low if missing
        >
          <Popup>
            <div className="text-sm">
              <p>
                <b>{h.hazard_type}</b>
              </p>
              <p>
                {h.latitude}, {h.longitude}
              </p>
              <p>Reported: {new Date(h.reported_at).toLocaleString()}</p>
              {h.image_url && (
                <img src={h.image_url} className="mt-2 w-full rounded" />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
