import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc
} from "firebase/firestore";

import * as XLSX from "xlsx";

import { db } from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

export default function Hosts() {

  const [hosts, setHosts] = useState([]);

  async function loadHosts() {

    const querySnapshot = await getDocs(collection(db, "hosts"));

    const lista = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    lista.sort((a, b) => (b.beans || 0) - (a.beans || 0));

    setHosts(lista);

  }

  useEffect(() => {

    loadHosts();

  }, []);

  async function importarXLSX(event) {

    const file = event.target.files[0];

    if (!file) return;

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const jsonData = XLSX.utils.sheet_to_json(sheet);

    for (const item of jsonData) {

      const bigoId = String(
        item["Bigo ID"] ||
        item["UID"] ||
        item["ID"] ||
        ""
      ).trim();

      if (!bigoId) continue;

      const hostData = {

        nome:
          item["Nome"] ||
          item["Nickname"] ||
          item["Host"] ||
          "Sem nome",

        bigoId,

        beans: Number(
          item["Beans"] ||
          item["Diamantes"] ||
          0
        ),

        horas:
          item["Horas"] ||
          "0h 0m 0s",

        horasNumero: parseFloat(
          item["Horas Num"] ||
          0
        ),

        dias: Number(
          item["Dias"] ||
          0
        ),

        ativo: true,

        atualizadoEm: new Date().toISOString()

      };

      // SALVA HOST PRINCIPAL
      await setDoc(
        doc(db, "hosts", bigoId),
        hostData,
        { merge: true }
      );

      // SALVA HISTÓRICO
      await addDoc(
        collection(db, "host_history"),
        {

          ...hostData,

          dataImportacao: new Date().toLocaleString("pt-BR")

        }
      );

    }

    await loadHosts();

    alert("Importação concluída com sucesso!");

  }

  return (

    <AdminLayout>

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-black text-orange-500">

            Hosts

          </h1>

          <p className="text-gray-400 mt-2">

            Gestão inteligente da Agência Fênix

          </p>

        </div>

        <label className="bg-orange-600 hover:bg-orange-500 px-6 py-4 rounded-2xl cursor-pointer font-bold transition">

          Importar XLSX

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={importarXLSX}
            className="hidden"
          />

        </label>

      </div>

      <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead className="bg-gray-950">

              <tr>

                <th className="text-left p-5 text-gray-300">
                  Nome
                </th>

                <th className="text-left p-5 text-gray-300 min-w-[220px]">
                  BIGO ID
                </th>

                <th className="text-left p-5 text-gray-300">
                  Beans
                </th>

                <th className="text-left p-5 text-gray-300">
                  Horas
                </th>

                <th className="text-left p-5 text-gray-300">
                  Dias
                </th>

                <th className="text-left p-5 text-gray-300">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {hosts.map((host) => (

                <tr
                  key={host.id}
                  onClick={() => window.location.href = `/hosts/${host.id}`}
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                >

                  <td className="p-5 font-semibold whitespace-nowrap">

                    {host.nome || "-"}

                  </td>

                  <td className="p-5">

                    <div className="text-orange-400 font-bold break-all">

                      {host.bigoId}

                    </div>

                  </td>

                  <td className="p-5 text-green-400 font-bold whitespace-nowrap">

                    {(host.beans || 0).toLocaleString("pt-BR")}

                  </td>

                  <td className="p-5 text-blue-400 whitespace-nowrap">

                    {host.horas}

                  </td>

                  <td className="p-5 whitespace-nowrap">

                    {host.dias}

                  </td>

                  <td className="p-5">

                    <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold">

                      {host.ativo ? "Ativo" : "Inativo"}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </AdminLayout>

  );

}