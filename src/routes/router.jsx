import { createBrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../services/firebase";

function Home() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const snapshot = await getDocs(
          collection(db, "streamers")
        );

        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(lista);

        setDados(lista);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#fff",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "38px",
          marginBottom: "10px",
        }}
      >
        🐦‍🔥 Fênix Warriors
      </h1>

      <p
        style={{
          opacity: 0.7,
          marginBottom: "30px",
        }}
      >
        Dashboard BIGO conectado ao Firebase
      </p>

      {loading ? (
        <h2>Carregando dados...</h2>
      ) : (
        <>
          <div
            style={{
              marginBottom: "20px",
              fontSize: "20px",
            }}
          >
            Total de registros: {dados.length}
          </div>

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            {dados.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#1a1a1a",
                  padding: "20px",
                  borderRadius: "14px",
                  border: "1px solid #333",
                }}
              >
                {Object.entries(item).map(([chave, valor]) => (
                  <div
                    key={chave}
                    style={{
                      marginBottom: "10px",
                      borderBottom: "1px solid #222",
                      paddingBottom: "6px",
                    }}
                  >
                    <strong
                      style={{
                        color: "#ff7b00",
                      }}
                    >
                      {chave}:
                    </strong>{" "}
                    {String(valor)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

export default router;