import { useState, useEffect } from "react";

export default function RepairModal({ hazard, onClose }) {
  const [workers, setWorkers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("reported");
  const [upload, setUpload] = useState(null);

  const API_BASE = "https://road-hazard-api.road-hazard-system.workers.dev";

  // Fetch workers from DB
  useEffect(() => {
    async function loadWorkers() {
      const res = await fetch(`${API_BASE}/workers`);
      const data = await res.json();
      setWorkers(data);
    }
    loadWorkers();
  }, []);

  // Auto-select worker based on backend data
  useEffect(() => {
    if (hazard && hazard.worker) {
      setAssignedTo(hazard.worker);
    } else {
      setAssignedTo("");
    }
  }, [hazard]);

  function handleFileChange(e) {
    setUpload(e.target.files[0]);
  }

  async function handleSubmit() {
    if (!status) {
      alert("Please select a repair status.");
      return;
    }

    const payload = {
      status, // <-- REQUIRED for backend
      worker: assignedTo || null,
      photo_url: null, // (You will handle real uploads later)
    };

    const res = await fetch(`${API_BASE}/update-repair/${hazard.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error || "Failed to update progress.");
      return;
    }

    alert("Repair progress updated!");
    setUpload(null);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"></div>

      <div
        className="
          fixed top-15 left-1/2 -translate-x-1/2 
          w-[90%] max-w-[600px] bg-white text-black
          rounded-lg shadow-xl p-6 z-50 overflow-y-auto no-scrollbar max-h-[90vh]
      "
      >
        <h2 className="text-2xl font-bold mb-4">
          Repair Tracking — {hazard.hazard_type}
        </h2>

        {/* PROGRESS TRACKER */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Progress Timeline</h3>

          <ul className="border-l-2 border-gray-400 pl-4 space-y-3 text-sm">
            <li className="text-green-700">
              🟢 Reported: {hazard.reported_at || "—"}
            </li>
            <li
              className={
                hazard.team_assigned_at ? "text-green-700" : "text-gray-500"
              }
            >
              {hazard.team_assigned_at ? "🟢" : "⚪"} Team Assigned:{" "}
              {hazard.team_assigned_at || "—"}
            </li>
            <li
              className={
                hazard.on_the_way_at ? "text-green-700" : "text-gray-500"
              }
            >
              {hazard.on_the_way_at ? "🟢" : "⚪"} On the Way:{" "}
              {hazard.on_the_way_at || "—"}
            </li>
            <li
              className={
                hazard.in_progress_at ? "text-green-700" : "text-gray-500"
              }
            >
              {hazard.in_progress_at ? "🟢" : "⚪"} In Progress:{" "}
              {hazard.in_progress_at || "—"}
            </li>
            <li
              className={
                hazard.completed_at ? "text-green-700" : "text-gray-500"
              }
            >
              {hazard.completed_at ? "🟢" : "⚪"} Completed:{" "}
              {hazard.completed_at || "—"}
            </li>
          </ul>
        </div>

        {/* ASSIGN WORKER */}
        <label className="font-semibold">Assign to:</label>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">Select Personnel</option>

          {workers.map((w) => (
            <option key={w.id} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>

        {/* STATUS UPDATE */}
        <label className="font-semibold">Update Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="reported">Reported</option>
          <option value="assigned">Team Assigned</option>
          <option value="on_the_way">On the Way</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* UPLOAD PHOTO */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Upload Repair Photo:
          </label>

          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm
               file:mr-4 file:py-2 file:px-4
               file:rounded file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100
               cursor-pointer"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Save Progress
          </button>
        </div>
      </div>
    </>
  );
}
