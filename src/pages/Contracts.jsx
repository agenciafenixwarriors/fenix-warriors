import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  db
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

export default function Contracts() {

  const [hosts, setHosts] = useState([]);

  const [selectedHost, setSelectedHost] = useState("");

  const [loading, setLoading] = useState(false);

  const [contrato, setContrato] = useState(`

CONTRATO DE EXCLUSIVIDADE — FÊNIX WARRIORS

A streamer cadastrada concorda em:

1. Respeitar as diretrizes da BIGO LIVE.
2. Não participar de outras agências sem autorização.
3. Cumprir metas mínimas da agência.
4. Manter comportamento adequado.
5. Evitar violações e banimentos.

O não cumprimento poderá gerar:
- advertências
- desligamento
- perda de benefícios

Ao aceitar, a streamer declara estar ciente de todas as regras da agência e da plataforma.

`);

  async function loadHosts() {

    try {

      const snap = await getDocs(
        collection(db, "hosts")
      );

      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setHosts(list);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    loadHosts();

  }, []);

  async function gerarContrato() {

    try {

      if (!selectedHost) {

        alert("Selecione uma streamer");

        return;

      }

      setLoading(true);

      const streamer = hosts.find(
        (host) => host.id === selectedHost
      );

      await addDoc(
        collection(db, "contracts"),
        {

          streamerId: streamer.id,

          streamerNome: streamer.nome || "",

          email: streamer.email || "",

          cpf: streamer.cpf || "",

          bigoId: streamer.bigoId || "",

          contrato,

          status: "pendente",

          aceite: false,

          criadoEm: serverTimestamp()

        }
      );

      alert("Contrato criado com sucesso!");

    } catch (error) {

      console.error(error);

      alert("Erro ao gerar contrato");

    } finally {

      setLoading(false);

    }

  }

  return (

    <AdminLayout>

      <div className="mb-10">

        <h1 className="text-5xl font-black text-orange-500">

          Contratos

        </h1>

        <p className="text-gray-400 mt-3 text-lg">

          Gestão contratual da agência

        </p>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-2xl font-black mb-6">

            Streamer

          </h2>

          <select
            value={selectedHost}
            onChange={(e) =>
              setSelectedHost(e.target.value)
            }
            className="w-full bg-gray-800 rounded-2xl p-4"
          >

            <option value="">

              Selecione uma streamer

            </option>

            {hosts.map((host) => (

              <option
                key={host.id}
                value={host.id}
              >

                {host.nome}

              </option>

            ))}

          </select>

          <button
            onClick={gerarContrato}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 mt-6 py-4 rounded-2xl font-black text-lg transition-all"
          >

            {loading
              ? "Gerando..."
              : "Gerar Contrato"}

          </button>

        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-2xl font-black mb-6">

            Modelo Contratual

          </h2>

          <textarea
            value={contrato}
            onChange={(e) =>
              setContrato(e.target.value)
            }
            rows={24}
            className="w-full bg-gray-800 rounded-2xl p-6 text-gray-300"
          />

        </div>

      </div>

    </AdminLayout>

  );

}