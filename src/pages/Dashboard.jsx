import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

export default function Dashboard() {
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const querySnapshot = await getDocs(collection(db, "streamers"));

      const lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setStreamers(lista);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados do Firebase");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "30px",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          marginBottom: "30px",
        }}
      >
        🐦‍🔥 Fênix Warriors Dashboard
      </h1>

      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          <div
            style={{
              marginBottom: "20px",
              fontSize: "20px",
            }}
          >
            Total de registros: {streamers.length}
          </div>

          <div
            style={{
              display: "grid",
              gap: "15px",
            }}
          >
            {streamers.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#1a1a1a",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #333",
                }}
              >
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                  }}
                >
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}