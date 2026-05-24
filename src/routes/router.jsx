import { createBrowserRouter } from "react-router-dom";
import { useState } from "react";
import * as XLSX from "xlsx";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function Home() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  async function handleUpload(event) {
    const files = Array.from(event.target.files);

    if (!files.length) return;

    setLoading(true);

    const newLogs = [];

    for (const file of files) {
      try {
        newLogs.push(`📥 Importando ${file.name}...`);

        const data = await file.arrayBuffer();

        const workbook = XLSX.read(data);

        const sheetName = workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(sheet);

        for (const item of json) {
          await addDoc(collection(db, "streamers"), {
            ...item,
            importedFile: file.name,
            importedAt: new Date().toISOString(),
          });
        }

        newLogs.push(`✅ ${file.name}: ${json.length} registros importados.`);
      } catch (error) {
        console.error(error);

        newLogs.push(`❌ Erro ao importar ${file.name}`);
      }

      setLogs([...newLogs]);
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          marginBottom: "20px",
        }}
      >
        🐦‍🔥 Fênix Warriors Dashboard
      </h1>

      <p>Importe múltiplas planilhas BIGO:</p>

      <input
        type="file"
        multiple
        accept=".xlsx,.xls"
        onChange={handleUpload}
        style={{
          marginTop: "20px",
          background: "#fff",
          color: "#000",
          padding: "10px",
          borderRadius: "8px",
        }}
      />

      {loading && (
        <p style={{ marginTop: "20px" }}>
          ⏳ Processando arquivos...
        </p>
      )}

      <div style={{ marginTop: "30px" }}>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
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