"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: Replace with your real backend URL:
  const API_URL = "https://road-hazard-system.onrender.com/stats";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setHazards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading data...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Road Hazard Dashboard</h1>

      <div className="space-y-4">
        {hazards.map((h) => (
          <div key={h.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <p>
              <b>Hazard Type:</b> {h.hazard_type}
            </p>
            <p>
              <b>Reported At:</b> {new Date(h.reported_at).toLocaleString()}
            </p>
            <p>
              <b>Location:</b> {h.latitude}, {h.longitude}
            </p>
            <p>
              <b>Source:</b> {h.source}
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
