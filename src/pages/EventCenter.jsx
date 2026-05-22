import { useState } from "react";

import { useDropzone } from "react-dropzone";

import * as XLSX from "xlsx";

import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

import {
  db
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

export default function EventCenter() {

  const [events, setEvents] = useState([]);

  const [preview, setPreview] = useState([]);

  const [sheetLink, setSheetLink] = useState("");

  const [loading, setLoading] = useState(false);

  const [logs, setLogs] = useState([]);

  async function carregarEventos(json) {

    setPreview(json.slice(0, 10));

    setEvents(json);

  }

  async function processarArquivo(file) {

    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const json =
      XLSX.utils.sheet_to_json(sheet);

    await carregarEventos(json);

  }

  const onDrop = async (acceptedFiles) => {

    if (!acceptedFiles[0]) return;

    await processarArquivo(
      acceptedFiles[0]
    );

  };

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

  async function importarEventos() {

    try {

      setLoading(true);

      const novosLogs = [];

      for (const item of events) {

        const nome =
          item["Evento"] ||
          item["Nome"] ||
          item["event"] ||
          "Evento BIGO";

        const inicio =
          item["Início"] ||
          item["Inicio"] ||
          item["Data"] ||
          "";

        const fim =
          item["Fim"] ||
          "";

        const categoria =
          item["Categoria"] ||
          "família";

        const meta =
          Number(
            item["Meta"] ||
            0
          );

        await addDoc(
          collection(db, "events"),
          {

            nome,

            inicio,

            fim,

            categoria,

            meta,

            origem:
              sheetLink
                ? "google_sheet"
                : "arquivo",

            criadoEm:
              new Date().toISOString()

          }
        );

        novosLogs.push(
          `✅ Evento importado: ${nome}`
        );

      }

      if (sheetLink) {

        await addDoc(
          collection(db, "event_imports"),
          {

            tipo: "google_sheet",

            origem: sheetLink,

            criadoEm:
              new Date().toISOString()

          }
        );

      }

      setLogs(novosLogs);

      alert(
        "Eventos importados!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao importar eventos"
      );

    } finally {

      setLoading(false);

    }

  }

  async function importarPorLink() {

    try {

      setLoading(true);

      if (!sheetLink) {

        alert(
          "Cole o link da planilha"
        );

        return;

      }

      const response =
        await fetch(sheetLink);

      const text =
        await response.text();

      console.log(text);

      alert(
        "Link registrado com sucesso!\n\nOBS: leitura automática do Google Sheets será implementada na próxima etapa."
      );

      await addDoc(
        collection(db, "event_imports"),
        {

          tipo: "link",

          origem: sheetLink,

          criadoEm:
            new Date().toISOString()

        }
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao registrar link"
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

              Central BIGO

            </h1>

            <p className="text-gray-400 mt-3 text-lg">

              Eventos • Família • Metas • Rankings

            </p>

          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-10">

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
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

                Importar Arquivo

              </h2>

              <p className="text-gray-400">

                Excel (.xlsx) ou CSV

              </p>

            </div>

            <div className="bg-gray-800 rounded-3xl p-8">

              <h2 className="text-3xl font-black mb-6">

                Google Sheets

              </h2>

              <input
                type="text"
                value={sheetLink}
                onChange={(e) =>
                  setSheetLink(
                    e.target.value
                  )
                }
                placeholder="Cole o link da planilha"
                className="w-full bg-black rounded-2xl p-5 mb-6"
              />

              <button
                onClick={importarPorLink}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl font-black text-xl"
              >

                Registrar Link

              </button>

            </div>

          </div>

          {preview.length > 0 && (

            <>

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
                onClick={importarEventos}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-3xl text-2xl font-black"
              >

                {loading
                  ? "Importando..."
                  : "Importar Eventos"}

              </button>

            </>

          )}

          <div className="mt-10 bg-black rounded-3xl p-6 border border-gray-800">

            <h2 className="text-2xl font-black mb-6">

              Logs da Central

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

              {logs.length === 0 && (

                <div className="text-gray-500">

                  Nenhuma atividade ainda.

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </AdminLayout>

  );

}