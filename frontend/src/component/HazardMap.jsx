import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";

const alertIcon = new L.Icon({
  iconUrl: "/markers/alert.png",
  iconSize: [64, 64],
  iconAnchor: [32, 64],
  popupAnchor: [0, -64],
});

function MapHighlighter({ highlightHazard, markerRefs, onShowDetailsFromMap }) {
  const map = useMap();
  // setTimeout(() => {
  //   const marker = markerRefs.current?.[highlightHazard.id];
  //   if (marker) marker.openPopup();
  // }, 800); // increased delay

  useEffect(() => {
    if (!highlightHazard) return;

    const latlng = [highlightHazard.latitude, highlightHazard.longitude];
    // Detect if zoom will change
    const willZoom = map.getZoom() !== 16;
    // Step 1: Move to location
    map.setView(latlng, 16, { animate: true });
    // Realign popup after zoom/move + after popup finishes rendering
    const realign = () => {
      const marker = markerRefs.current?.[highlightHazard.id];
      if (!marker) return;

      // Open popup
      marker.openPopup();

      // Allow popup DOM to be created
      setTimeout(() => {
        const popup = marker.getPopup();
        if (!popup) return;

        popup.update(); // force recalculation

        const popupEl = popup.getElement();
        if (!popupEl) return;

        const popupHeight = popupEl.offsetHeight;

        // Pan map upward according to TRUE popup height
        const offset = popupHeight / 2 + 40;

        map.panBy([0, -offset], { animate: true });
      }, 50);
    };

    const handleZoomEnd = () => {
      realign();
      map.off("zoomend", handleZoomEnd);
      map.off("moveend", handleMoveEnd);
    };

    const handleMoveEnd = () => {
      realign();
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleZoomEnd);
    };

    // If zoom changes → wait for zoomend
    if (willZoom) map.on("zoomend", handleZoomEnd);
    else map.on("moveend", handleMoveEnd);

    return () => {
      map.off("zoomend", handleZoomEnd);
      map.off("moveend", handleMoveEnd);
    };
  }, [highlightHazard]);

  return null;
}

export default function HazardMap({
  highlightHazard,
  onHighlight,
  onShowDetailsFromMap,
}) {
  const defaultPosition = [2.945747, 101.87509]; // Singapore center (change if needed)
  const [hazards, setHazards] = useState([]);
  const markerRefs = useRef({});

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          "https://road-hazard-api.road-hazard-system.workers.dev/hazard-map"
        ); // <- update URL if deployed
        const data = await res.json();
        setHazards(data);
      } catch (err) {
        console.error("Failed to fetch hazard data", err);
      }
    }

    loadData();
  }, []);

  return (
    <MapContainer
      center={defaultPosition}
      zoom={11}
      scrollWheelZoom={true}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
    >
      {/* 🔥 Add this so map reacts to modal click */}
      <MapHighlighter
        highlightHazard={highlightHazard}
        markerRefs={markerRefs}
      />

      <TileLayer url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png" />

      {hazards.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={alertIcon}
          ref={(marker) => {
            if (marker && !markerRefs.current[h.id]) {
              markerRefs.current[h.id] = marker;
            }
          }}
          eventHandlers={{
            click: () => onHighlight(h), // 🔥 highlight instantly on click
          }}
        >
          <Popup
            maxWidth={250}
            className="popup-custom"
            autoPan={false}
            keepInView={true}
          >
            <div className="text-sm leading-snug w-full space-y-1">
              <h3 className="text-lg font-bold">{h.hazard_type}</h3>
              {/* Bold Labels + Normal Text */}
              <p>
                <span className="font-semibold">Risk:</span> {h.risk_level}
                <br />
                <span className="font-semibold">Repair Material:</span>{" "}
                {h.repair_material}
                <br />
                <span className="font-semibold">Volume:</span>{" "}
                {h.volume_material_required}
                <br />
                <span className="font-semibold">Manpower:</span>{" "}
                {h.manpower_required}
              </p>
              {/* Image */}
              {h.image_url && (
                <img
                  src={h.image_url}
                  alt={h.hazard_type}
                  className="mt-1 max-w-[250px] h-auto rounded shadow-lg"
                />
              )}

              <button
                className="w-full mt-3 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-center cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShowDetailsFromMap(h); // ↩ Call function from App.jsx
                }}
              >
                View Full Details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
