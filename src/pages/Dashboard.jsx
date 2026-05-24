import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../services/firebase";

export default function Dashboard() {
  const [data, setData] =
    useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(
          db,
          "dashboard",
          "stats"
        );

        const docSnap =
          await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (error) {
        console.log(error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        🐦‍🔥 Dashboard Fênix
      </h1>

      {!data ? (
        <p className="text-xl">
          Carregando dados...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              👥 Membros
            </h2>

            <p className="text-5xl font-bold text-orange-400">
              {data.members}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              💰 Receita
            </h2>

            <p className="text-5xl font-bold text-green-400">
              R$ {data.revenue}
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-3">
              🏆 Ranking
            </h2>

            <p className="text-5xl font-bold text-yellow-400">
              {data.ranking}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}