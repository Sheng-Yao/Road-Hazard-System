"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HazardMap = dynamic(() => import("./components/HazardMap"), {
  ssr: false,
});
// import HazardMap from "./components/HazardMap";

export default function Home() {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://road-hazard-system.onrender.com/stats";

  // Fetch hazards once when page loads
  const fetchHazards = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setHazards(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHazards();

    // Listen to SSE notifications
    const events = new EventSource(
      "https://road-hazard-system.onrender.com/stream"
    );

    events.onmessage = () => {
      fetchHazards(); // Re-fetch ONLY when backend says there’s new data
    };

    return () => events.close();
  }, []);

  if (loading) return <div className="p-6">Loading data...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Road Hazard Dashboard</h1>

      {/* ✅ The Map */}
      <HazardMap hazards={hazards} />

      {/* ✅ The List Below */}
      <div className="space-y-4">
        {hazards.map((h) => (
          <div key={h.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <p>
              <b>Hazard Type:</b> {h.hazard_type}
            </p>
            <p>
              <b>Location:</b> {h.latitude}, {h.longitude}
            </p>
            <p>
              <b>Device ID:</b> {h.device_ID}
            </p>
            {h.image_url && (
              <img
                src={h.image_url}
                alt="Hazard"
                className="mt-3 rounded-lg max-h-64 object-cover border"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
