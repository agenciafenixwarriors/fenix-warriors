import { useState } from "react";
import { importExcel } from "../services/importService";
import toast, { Toaster } from "react-hot-toast";

export default function ImportData() {
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setLoading(true);

      const total = await importExcel(file);

      toast.success(`${total} registros importados`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao importar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 40,
      }}
    >
      <Toaster />

      <h1
        style={{
          fontSize: 32,
          marginBottom: 30,
          fontWeight: "bold",
        }}
      >
        🐦‍🔥 Importador BIGO
      </h1>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
      />

      {loading && (
        <p style={{ marginTop: 20 }}>
          Importando...
        </p>
      )}
    </div>
  );
}