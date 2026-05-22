import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  db
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

import jsPDF from "jspdf";

export default function ContractDetails() {

  const { id } = useParams();

  const [contract, setContract] = useState(null);

  const [loading, setLoading] = useState(true);

  const [accepting, setAccepting] = useState(false);

  async function loadContract() {

    try {

      const ref = doc(
        db,
        "contracts",
        id
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {

        setContract({
          id: snap.id,
          ...snap.data()
        });

      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadContract();

  }, []);

  async function aceitarContrato() {

    try {

      setAccepting(true);

      await updateDoc(
        doc(db, "contracts", id),
        {

          aceite: true,

          status: "assinado",

          assinadoEm: serverTimestamp()

        }
      );

      setContract({
        ...contract,
        aceite: true,
        status: "assinado"
      });

      alert("Contrato assinado com sucesso!");

    } catch (error) {

      console.error(error);

      alert("Erro ao assinar contrato");

    } finally {

      setAccepting(false);

    }

  }

  function gerarPDF() {

    const pdf = new jsPDF();

    pdf.setFontSize(22);

    pdf.text(
      "FÊNIX WARRIORS",
      20,
      25
    );

    pdf.setFontSize(16);

    pdf.text(
      "Contrato de Exclusividade",
      20,
      40
    );

    pdf.setFontSize(12);

    pdf.text(
      `Streamer: ${contract.streamerNome}`,
      20,
      60
    );

    pdf.text(
      `BIGO ID: ${contract.bigoId}`,
      20,
      70
    );

    pdf.text(
      `CPF: ${contract.cpf}`,
      20,
      80
    );

    const linhas =
      pdf.splitTextToSize(
        contract.contrato,
        170
      );

    pdf.text(
      linhas,
      20,
      100
    );

    if (contract.aceite) {

      pdf.setFontSize(14);

      pdf.text(
        "CONTRATO ASSINADO DIGITALMENTE",
        20,
        250
      );

    }

    pdf.save(
      `contrato-${contract.streamerNome}.pdf`
    );

  }

  if (loading) {

    return (

      <AdminLayout>

        <div className="text-2xl text-white">

          Carregando contrato...

        </div>

      </AdminLayout>

    );

  }

  if (!contract) {

    return (

      <AdminLayout>

        <div className="text-2xl text-red-500">

          Contrato não encontrado.

        </div>

      </AdminLayout>

    );

  }

  return (

    <AdminLayout>

      <div className="max-w-5xl mx-auto">

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10">

          <div className="flex items-center justify-between mb-10">

            <div>

              <h1 className="text-5xl font-black text-orange-500">

                Contrato Digital

              </h1>

              <p className="text-gray-400 mt-3">

                Fênix Warriors — Exclusividade BIGO

              </p>

            </div>

            <div
              className={`px-5 py-3 rounded-2xl font-black uppercase ${
                contract.status === "assinado"
                  ? "bg-green-600"
                  : "bg-yellow-500 text-black"
              }`}
            >

              {contract.status}

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">

            <div className="bg-gray-800 rounded-2xl p-5">

              <p className="text-gray-400 mb-2">

                Streamer

              </p>

              <h2 className="text-2xl font-black">

                {contract.streamerNome}

              </h2>

            </div>

            <div className="bg-gray-800 rounded-2xl p-5">

              <p className="text-gray-400 mb-2">

                BIGO ID

              </p>

              <h2 className="text-2xl font-black">

                {contract.bigoId}

              </h2>

            </div>

          </div>

          <div className="bg-gray-800 rounded-3xl p-8 mb-10 whitespace-pre-line text-gray-300 leading-8">

            {contract.contrato}

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {!contract.aceite ? (

              <button
                onClick={aceitarContrato}
                disabled={accepting}
                className="w-full bg-orange-600 hover:bg-orange-500 py-5 rounded-3xl text-2xl font-black transition-all"
              >

                {accepting
                  ? "Assinando..."
                  : "Aceito os Termos"}

              </button>

            ) : (

              <div className="bg-green-600 rounded-3xl p-6 text-center flex items-center justify-center">

                <div>

                  <h2 className="text-3xl font-black">

                    CONTRATO ASSINADO

                  </h2>

                  <p className="mt-3">

                    Aceite registrado com sucesso.

                  </p>

                </div>

              </div>

            )}

            <button
              onClick={gerarPDF}
              className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-3xl text-2xl font-black transition-all"
            >

              Baixar PDF

            </button>

          </div>

        </div>

      </div>

    </AdminLayout>

  );

}