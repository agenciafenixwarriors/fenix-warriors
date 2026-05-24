import { useEffect, useState } from "react";
import { getStreamers } from "../services/firestore";

export default function Dashboard() {
  const [streamers, setStreamers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getStreamers();
    setStreamers(data);
  }

  return (
    <div
      style={{
        padding: 30,
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1>🐦‍🔥 Fênix Warriors Dashboard</h1>

      <p>Total de streamers: {streamers.length}</p>

      <div style={{ marginTop: 20 }}>
        {streamers.map((streamer) => (
          <div
            key={streamer.id}
            style={{
              background: "#222",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <h3>{streamer.nickname || "Sem nome"}</h3>

            <p>UID: {streamer.uid || "-"}</p>

            <p>Família: {streamer.family || "-"}</p>

            <p>Agência: {streamer.agency || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}