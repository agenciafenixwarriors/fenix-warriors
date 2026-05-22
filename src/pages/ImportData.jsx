import { useState, useCallback } from "react";

import { useDropzone } from "react-dropzone";

import * as XLSX from "xlsx";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from "firebase/firestore";

import {
  db
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

export default function ImportData() {

  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState([]);

  const [logs, setLogs] = useState([]);

  const [fileData, setFileData] = useState([]);

  const [resumo, setResumo] = useState({
    encontrados: 0,
    naoEncontrados: 0
  });

  const processarArquivo = async (file) => {

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const json =
      XLSX.utils.sheet_to_json(sheet);

    setFileData(json);

    setPreview(json.slice(0, 10));

  };

  const onDrop = useCallback(async (acceptedFiles) => {

    if (!acceptedFiles[0]) return;

    await processarArquivo(
      acceptedFiles[0]
    );

  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
      "text/csv": []
    }
  });

  async function importarDados() {

    try {

      setLoading(true);

      const hostsSnap = await getDocs(
        collection(db, "hosts")
      );

      const hosts = hostsSnap.docs.map(
        (docItem) => ({
          id: docItem.id,
          ...docItem.data()
        })
      );

      const novosLogs = [];

      let encontrados = 0;

      let naoEncontrados = 0;

      for (const item of fileData) {

        const bigoId =
          item["BIGO ID"] ||
          item["bigoId"] ||
          item["ID"];

        if (!bigoId) continue;

        const host = hosts.find(
          (h) =>
            h.bigoId?.toString()
              .trim()
              .toLowerCase() ===
            bigoId.toString()
              .trim()
              .toLowerCase()
        );

        if (!host) {

          naoEncontrados++;

          novosLogs.push(
            `❌ Host não encontrado: ${bigoId}`
          );

          continue;

        }

        encontrados++;

        const beans =
          Number(
            item["Beans"] ||
            item["beans"] ||
            0
          );

        const horas =
          Number(
            item["Horas"] ||
            item["hours"] ||
            0
          );

        const dias =
          Number(
            item["Dias"] ||
            item["days"] ||
            0
          );

        await updateDoc(
          doc(db, "hosts", host.id),
          {

            beans,

            horas: `${horas}h`,

            horasNumero: horas,

            dias,

            atualizadoEm:
              new Date().toISOString()

          }
        );

        await addDoc(
          collection(db, "host_history"),
          {

            bigoId,

            nome: host.nome,

            beans,

            horas: `${horas}h`,

            dias,

            dataImportacao:
              new Date().toLocaleString("pt-BR")

          }
        );

        novosLogs.push(
          `✅ ${host.nome} atualizado`
        );

      }

      setResumo({
        encontrados,
        naoEncontrados
      });

      setLogs(novosLogs);

      alert(
        "Importação concluída!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao importar"
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <AdminLayout>

      <div className="max-w-7xl mx-auto">

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10">

          <div className="mb-10">

            <h1 className="text-5xl font-black text-orange-500">

              Importação Inteligente BIGO

            </h1>

            <p className="text-gray-400 mt-3 text-lg">

              Preview + validação automática

            </p>

          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-orange-500 bg-orange-500/10"
                : "border-gray-700 bg-gray-800"
            }`}
          >

            <input {...getInputProps()} />

            <div className="text-7xl mb-5">

              📂

            </div>

            <h2 className="text-3xl font-black mb-3">

              Arraste o relatório BIGO

            </h2>

            <p className="text-gray-400 text-lg">

              Excel (.xlsx) ou CSV

            </p>

          </div>

          {preview.length > 0 && (

            <>

              <div className="grid md:grid-cols-2 gap-6 my-10">

                <div className="bg-gray-800 rounded-3xl p-6">

                  <h2 className="text-gray-400">

                    Linhas detectadas

                  </h2>

                  <p className="text-5xl font-black text-orange-500 mt-4">

                    {fileData.length}

                  </p>

                </div>

                <div className="bg-gray-800 rounded-3xl p-6">

                  <h2 className="text-gray-400">

                    Preview carregado

                  </h2>

                  <p className="text-5xl font-black text-green-400 mt-4">

                    OK

                  </p>

                </div>

              </div>

              <div className="bg-black rounded-3xl overflow-auto border border-gray-800 mb-10">

                <table className="w-full">

                  <thead className="bg-gray-800">

                    <tr>

                      {Object.keys(preview[0]).map((key) => (

                        <th
                          key={key}
                          className="text-left p-4"
                        >

                          {key}

                        </th>

                      ))}

                    </tr>

                  </thead>

                  <tbody>

                    {preview.map((row, index) => (

                      <tr
                        key={index}
                        className="border-t border-gray-800"
                      >

                        {Object.values(row).map(
                          (value, i) => (

                            <td
                              key={i}
                              className="p-4 text-gray-300"
                            >

                              {String(value)}

                            </td>

                          )
                        )}

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              <button
                onClick={importarDados}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-3xl text-2xl font-black"
              >

                {loading
                  ? "Importando..."
                  : "Confirmar Importação"}

              </button>

            </>

          )}

          {(logs.length > 0 ||
            resumo.encontrados > 0) && (

            <div className="mt-10">

              <div className="grid md:grid-cols-2 gap-6 mb-8">

                <div className="bg-green-900 rounded-3xl p-6">

                  <h2 className="text-gray-300">

                    Hosts Atualizados

                  </h2>

                  <p className="text-5xl font-black mt-3">

                    {resumo.encontrados}

                  </p>

                </div>

                <div className="bg-red-900 rounded-3xl p-6">

                  <h2 className="text-gray-300">

                    Não Encontrados

                  </h2>

                  <p className="text-5xl font-black mt-3">

                    {resumo.naoEncontrados}

                  </p>

                </div>

              </div>

              <div className="bg-black rounded-3xl p-6 border border-gray-800">

                <h2 className="text-2xl font-black mb-6">

                  Logs

                </h2>

                <div className="space-y-3 max-h-[400px] overflow-auto">

                  {logs.map((log, index) => (

                    <div
                      key={index}
                      className="bg-gray-900 rounded-xl p-4 text-sm"
                    >

                      {log}

                    </div>

                  ))}

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </AdminLayout>

  );

}