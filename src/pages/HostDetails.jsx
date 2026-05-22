import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

import { calculateRisk } from "../services/riskService";

export default function HostDetails() {

  const { id } = useParams();

  const [host, setHost] = useState(null);

  const [history, setHistory] = useState([]);

  const [warnings, setWarnings] = useState([]);

  const [risk, setRisk] = useState({
    nivel: "baixo",
    cor: "green"
  });

  const [editando, setEditando] = useState(false);

  const [uploading, setUploading] = useState(false);

  async function loadHost() {

    try {

      // HOST
      const refDoc = doc(db, "hosts", id);

      const snap = await getDoc(refDoc);

      if (snap.exists()) {

        setHost({
          id: snap.id,
          ...snap.data()
        });

      }

      // HISTÓRICO
      const historyQuery = query(
        collection(db, "host_history"),
        where("bigoId", "==", id)
      );

      const historySnap = await getDocs(historyQuery);

      const historyList = historySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistory(historyList);

      // WARNINGS
      const warningsQuery = query(
        collection(db, "warnings"),
        where("streamer", "==", snap.data()?.nome || "")
      );

      const warningsSnap = await getDocs(warningsQuery);

      const warningsList = warningsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setWarnings(warningsList);

      // RISCO
      const riscoCalculado =
        calculateRisk(warningsList);

      setRisk(riscoCalculado);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    loadHost();

  }, []);

  async function salvarAlteracoes() {

    try {

      await updateDoc(
        doc(db, "hosts", id),
        {

          nome: host.nome || "",

          telefone: host.telefone || "",

          email: host.email || "",

          cpf: host.cpf || "",

          observacoes: host.observacoes || "",

          atualizadoEm: new Date().toISOString()

        }
      );

      alert("Host atualizado com sucesso!");

      setEditando(false);

    } catch (error) {

      console.error(error);

      alert("Erro ao salvar");

    }

  }

  async function uploadFoto(event) {

    try {

      const file = event.target.files[0];

      if (!file) return;

      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "upload_preset",
        "fenix_hosts"
      );

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dqhzyhynf/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!data.secure_url) {

        throw new Error("Erro upload");

      }

      await updateDoc(
        doc(db, "hosts", id),
        {
          foto: data.secure_url
        }
      );

      setHost({
        ...host,
        foto: data.secure_url
      });

      alert("Foto enviada com sucesso!");

    } catch (error) {

      console.error(error);

      alert("Erro ao enviar foto");

    } finally {

      setUploading(false);

    }

  }

  if (!host) {

    return (

      <AdminLayout>

        <div className="text-white text-2xl">

          Carregando...

        </div>

      </AdminLayout>

    );

  }

  return (

    <AdminLayout>

      <div className="flex items-center justify-between mb-10">

        <div className="flex items-center gap-6">

          <div className="relative">

            {host.foto ? (

              <img
                src={host.foto}
                alt="Host"
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
              />

            ) : (

              <div className="w-32 h-32 rounded-full bg-orange-500 flex items-center justify-center text-5xl font-black">

                {host.nome?.charAt(0)}

              </div>

            )}

            <label className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-lg">

              📷

              <input
                type="file"
                accept="image/*"
                onChange={uploadFoto}
                className="hidden"
              />

            </label>

          </div>

          <div>

            <h1 className="text-5xl font-black text-orange-500">

              {host.nome || "Sem Nome"}

            </h1>

            <p className="text-gray-400 mt-2">

              BIGO ID: {host.bigoId}

            </p>

            {uploading && (

              <p className="text-orange-400 mt-2">

                Enviando foto...

              </p>

            )}

          </div>

        </div>

        <button
          onClick={() => {

            if (editando) {

              salvarAlteracoes();

            } else {

              setEditando(true);

            }

          }}
          className="bg-orange-600 hover:bg-orange-500 px-6 py-3 rounded-2xl font-bold"
        >

          {editando ? "Salvar" : "Editar"}

        </button>

      </div>

      <div className="grid md:grid-cols-5 gap-6 mb-10">

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Beans

          </h2>

          <p className="text-4xl font-black text-green-400 mt-3">

            {(host.beans || 0).toLocaleString("pt-BR")}

          </p>

        </div>

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Horas

          </h2>

          <p className="text-4xl font-black text-blue-400 mt-3">

            {host.horas || "0h"}

          </p>

        </div>

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Dias

          </h2>

          <p className="text-4xl font-black text-pink-400 mt-3">

            {host.dias || 0}

          </p>

        </div>

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Status

          </h2>

          <p className="text-3xl font-black text-orange-400 mt-3">

            {host.ativo !== false ? "ATIVO" : "INATIVO"}

          </p>

        </div>

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Risco

          </h2>

          <p
            className={`text-3xl font-black mt-3 ${
              risk.cor === "green"
                ? "text-green-400"
                : risk.cor === "yellow"
                ? "text-yellow-400"
                : risk.cor === "orange"
                ? "text-orange-400"
                : "text-red-500"
            }`}
          >

            {risk.nivel.toUpperCase()}

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div className="bg-gray-900 rounded-3xl p-6">

          <h2 className="text-2xl font-black mb-6">

            Dados da Streamer

          </h2>

          <div className="space-y-4">

            <input
              type="text"
              disabled={!editando}
              value={host.nome || ""}
              onChange={(e) =>
                setHost({
                  ...host,
                  nome: e.target.value
                })
              }
              placeholder="Nome"
              className="w-full bg-gray-800 rounded-xl p-4"
            />

            <input
              type="text"
              disabled={!editando}
              value={host.telefone || ""}
              onChange={(e) =>
                setHost({
                  ...host,
                  telefone: e.target.value
                })
              }
              placeholder="Telefone"
              className="w-full bg-gray-800 rounded-xl p-4"
            />

            <input
              type="email"
              disabled={!editando}
              value={host.email || ""}
              onChange={(e) =>
                setHost({
                  ...host,
                  email: e.target.value
                })
              }
              placeholder="Email"
              className="w-full bg-gray-800 rounded-xl p-4"
            />

            <input
              type="text"
              disabled={!editando}
              value={host.cpf || ""}
              onChange={(e) =>
                setHost({
                  ...host,
                  cpf: e.target.value
                })
              }
              placeholder="CPF"
              className="w-full bg-gray-800 rounded-xl p-4"
            />

          </div>

        </div>

        <div className="bg-gray-900 rounded-3xl p-6">

          <h2 className="text-2xl font-black mb-6">

            Gestão Interna

          </h2>

          <div className="space-y-4">

            <textarea
              disabled={!editando}
              value={host.observacoes || ""}
              onChange={(e) =>
                setHost({
                  ...host,
                  observacoes: e.target.value
                })
              }
              placeholder="Observações internas"
              rows={10}
              className="w-full bg-gray-800 rounded-xl p-4"
            />

          </div>

        </div>

      </div>

      <div className="bg-gray-900 rounded-3xl p-6 mb-10">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-3xl font-black">

            Advertências

          </h2>

          <div className="bg-red-600 px-4 py-2 rounded-xl font-bold">

            {warnings.length} registro(s)

          </div>

        </div>

        <div className="space-y-4">

          {warnings.map((warning) => (

            <div
              key={warning.id}
              className="bg-gray-800 rounded-2xl p-5"
            >

              <div className="flex items-center justify-between mb-3">

                <h3 className="font-black text-xl">

                  {warning.gravidade.toUpperCase()}

                </h3>

              </div>

              <p className="text-gray-300">

                {warning.motivo}

              </p>

            </div>

          ))}

          {warnings.length === 0 && (

            <div className="text-gray-400">

              Nenhuma advertência registrada.

            </div>

          )}

        </div>

      </div>

      <div className="bg-gray-900 rounded-3xl p-6">

        <h2 className="text-3xl font-black mb-6">

          Histórico

        </h2>

        <div className="space-y-4">

          {history.map((item) => (

            <div
              key={item.id}
              className="bg-gray-800 rounded-2xl p-4 flex items-center justify-between"
            >

              <div>

                <p className="font-bold">

                  {item.nome}

                </p>

                <p className="text-gray-400 text-sm">

                  {item.dataImportacao}

                </p>

              </div>

              <div className="text-right">

                <p className="text-green-400 font-bold">

                  {(item.beans || 0).toLocaleString("pt-BR")} beans

                </p>

                <p className="text-blue-400">

                  {item.horas}

                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </AdminLayout>

  );

}