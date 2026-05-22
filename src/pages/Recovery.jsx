import { useState } from "react";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import {
  sendPasswordResetEmail
} from "firebase/auth";

import {
  db,
  auth
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

export default function Recovery() {

  const [cpf, setCpf] = useState("");

  const [host, setHost] = useState(null);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  async function buscarConta() {

    try {

      setLoading(true);

      setSuccess(false);

      const q = query(
        collection(db, "hosts"),
        where("cpf", "==", cpf)
      );

      const snap = await getDocs(q);

      if (snap.empty) {

        alert("Nenhuma conta encontrada");

        setHost(null);

        return;

      }

      const data = snap.docs[0];

      setHost({
        id: data.id,
        ...data.data()
      });

    } catch (error) {

      console.error(error);

      alert("Erro ao buscar conta");

    } finally {

      setLoading(false);

    }

  }

  async function redefinirSenha() {

    try {

      if (!host?.email) {

        alert("Conta sem email");

        return;

      }

      await sendPasswordResetEmail(
        auth,
        host.email
      );

      setSuccess(true);

      alert(
        "Email de redefinição enviado!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao enviar email de recuperação"
      );

    }

  }

  return (

    <AdminLayout>

      <div className="max-w-3xl mx-auto">

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10">

          <div className="mb-10">

            <h1 className="text-5xl font-black text-orange-500">

              Recuperação de Conta

            </h1>

            <p className="text-gray-400 mt-3 text-lg">

              Recuperação segura via CPF + Firebase Auth

            </p>

          </div>

          <div className="bg-gray-800 rounded-3xl p-6 mb-8">

            <label className="block mb-3 text-gray-400 font-bold">

              CPF da streamer

            </label>

            <input
              type="text"
              value={cpf}
              onChange={(e) =>
                setCpf(e.target.value)
              }
              placeholder="Digite o CPF"
              className="w-full bg-gray-900 rounded-2xl p-5 text-white"
            />

            <button
              onClick={buscarConta}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 mt-6 py-4 rounded-2xl text-xl font-black"
            >

              {loading
                ? "Buscando..."
                : "Buscar Conta"}

            </button>

          </div>

          {host && (

            <div className="bg-gray-800 rounded-3xl p-6">

              <div className="grid md:grid-cols-2 gap-6 mb-8">

                <div>

                  <p className="text-gray-400 mb-2">

                    Nome

                  </p>

                  <h2 className="text-2xl font-black">

                    {host.nome}

                  </h2>

                </div>

                <div>

                  <p className="text-gray-400 mb-2">

                    BIGO ID

                  </p>

                  <h2 className="text-2xl font-black">

                    {host.bigoId}

                  </h2>

                </div>

                <div>

                  <p className="text-gray-400 mb-2">

                    Email

                  </p>

                  <h2 className="text-xl font-bold break-all">

                    {host.email}

                  </h2>

                </div>

                <div>

                  <p className="text-gray-400 mb-2">

                    Status

                  </p>

                  <h2 className="text-xl font-bold text-green-400">

                    {host.ativo !== false
                      ? "ATIVO"
                      : "INATIVO"}

                  </h2>

                </div>

              </div>

              <button
                onClick={redefinirSenha}
                className="w-full bg-red-600 hover:bg-red-500 py-5 rounded-3xl text-2xl font-black"
              >

                Enviar Recuperação

              </button>

              {success && (

                <div className="bg-green-600 rounded-3xl p-6 mt-8">

                  <h2 className="text-3xl font-black">

                    EMAIL ENVIADO

                  </h2>

                  <p className="mt-3 text-lg">

                    A streamer recebeu um link oficial
                    do Firebase para redefinir a senha.

                  </p>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </AdminLayout>

  );

}