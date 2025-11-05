import { useEffect, useState } from "react";

function App() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch("https://your-backend.onrender.com/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {stats.map((s, i) => (
          <li key={i}>
            {s.name}: {s.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;
