import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

import {
  db
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

export default function Warnings() {

  const [warnings, setWarnings] = useState([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({

    streamer: "",

    motivo: "",

    gravidade: "media"

  });

  async function loadWarnings() {

    const q = query(
      collection(db, "warnings"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setWarnings(lista);

  }

  useEffect(() => {

    loadWarnings();

  }, []);

  function handleChange(e) {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  }

  async function handleSubmit(e) {

    e.preventDefault();

    try {

      setLoading(true);

      await addDoc(
        collection(db, "warnings"),
        {

          streamer: form.streamer,

          motivo: form.motivo,

          gravidade: form.gravidade,

          createdAt: serverTimestamp()

        }
      );

      alert("Advertência registrada!");

      setForm({
        streamer: "",
        motivo: "",
        gravidade: "media"
      });

      loadWarnings();

    } catch (error) {

      console.error(error);

      alert("Erro ao registrar advertência");

    } finally {

      setLoading(false);

    }

  }

  return (

    <AdminLayout>

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-black text-orange-500">

            Advertências

          </h1>

          <p className="text-gray-400 mt-3 text-lg">

            Sistema interno de compliance e prevenção de banimentos

          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="bg-gray-900 rounded-3xl p-6 lg:col-span-1">

          <h2 className="text-2xl font-black mb-6">

            Nova Advertência

          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="text"
              name="streamer"
              placeholder="Nome da streamer"
              value={form.streamer}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white"
            />

            <textarea
              name="motivo"
              placeholder="Motivo da advertência"
              value={form.motivo}
              onChange={handleChange}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white"
            />

            <select
              name="gravidade"
              value={form.gravidade}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 text-white"
            >

              <option value="baixa">

                Baixa

              </option>

              <option value="media">

                Média

              </option>

              <option value="alta">

                Alta

              </option>

            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 rounded-2xl py-4 font-black transition-all"
            >

              {loading
                ? "Salvando..."
                : "Registrar Advertência"}

            </button>

          </form>

        </div>

        <div className="lg:col-span-2 space-y-5">

          {warnings.map((warning) => (

            <div
              key={warning.id}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6"
            >

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-2xl font-black">

                  {warning.streamer}

                </h2>

                <div
                  className={`px-4 py-2 rounded-xl font-bold uppercase ${
                    warning.gravidade === "alta"
                      ? "bg-red-600"
                      : warning.gravidade === "media"
                      ? "bg-yellow-600"
                      : "bg-green-600"
                  }`}
                >

                  {warning.gravidade}

                </div>

              </div>

              <p className="text-gray-300 leading-relaxed">

                {warning.motivo}

              </p>

            </div>

          ))}

          {warnings.length === 0 && (

            <div className="bg-gray-900 rounded-3xl p-10 text-center text-gray-400">

              Nenhuma advertência registrada.

            </div>

          )}

        </div>

      </div>

    </AdminLayout>

  );

}