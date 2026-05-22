import { useState } from "react";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  auth,
  db
} from "../firebase";

import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import {
  Link,
  useNavigate
} from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    whatsapp: "",
    bigoId: "",
    nickname: ""
  });

  async function handleRegister(e) {

    e.preventDefault();

    try {

      setLoading(true);

      // VERIFICA SE O BIGO ID EXISTE
      const q = query(
        collection(db, "hosts"),
        where("bigoId", "==", form.bigoId)
      );

      const snapshot = await getDocs(q);

      let status = "pending";

      if (!snapshot.empty) {

        status = "approved";

      }

      // CRIA USUÁRIO AUTH
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.senha
        );

      const uid = userCredential.user.uid;

      // SALVA NO FIRESTORE
      await setDoc(
        doc(db, "users", uid),
        {
          nome: form.nome,
          email: form.email,
          whatsapp: form.whatsapp,
          bigoId: form.bigoId,
          nickname: form.nickname,

          role: "streamer",

          status,

          ativo: true,

          criadoEm: serverTimestamp()
        }
      );

      alert(
        status === "approved"
          ? "Cadastro aprovado com sucesso!"
          : "Cadastro enviado para análise!"
      );

      navigate("/login");

    } catch (error) {

      console.error(error);

      alert(error.message);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-xl bg-gray-900 rounded-3xl p-10 border border-gray-800">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-black text-orange-500">

            🐦‍🔥 Fênix Warriors

          </h1>

          <p className="text-gray-400 mt-4">

            Cadastro Oficial da Agência

          </p>

        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >

          <input
            type="text"
            placeholder="Nome completo"
            required
            value={form.nome}
            onChange={(e) =>
              setForm({
                ...form,
                nome: e.target.value
              })
            }
            className="w-full bg-gray-800 rounded-2xl p-4 outline-none border border-gray-700 focus:border-orange-500"
          />

          <input
            type="text"
            placeholder="Nickname BIGO"
            required
            value={form.nickname}
            onChange={(e) =>
              setForm({
                ...form,
                nickname: e.target.value
              })
            }
            className="w-full bg-gray-800 rounded-2xl p-4 outline-none border border-gray-700 focus:border-orange-500"
          />

          <input
            type="text"
            placeholder="BIGO ID"
            required
            value={form.bigoId}
            onChange={(e) =>
              setForm({
                ...form,
                bigoId: e.target.value
              })
            }
            className="w-full bg-gray-800 rounded-2xl p-4 outline-none border border-gray-700 focus:border-orange-500"
          />

          <input
            type="text"
            placeholder="WhatsApp"
            required
            value={form.whatsapp}
            onChange={(e) =>
              setForm({
                ...form,
                whatsapp: e.target.value
              })
            }
            className="w-full bg-gray-800 rounded-2xl p-4 outline-none border border-gray-700 focus:border-orange-500"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            className="w-full bg-gray-800 rounded-2xl p-4 outline-none border border-gray-700 focus:border-orange-500"
          />

          <input
            type="password"
            placeholder="Senha"
            required
            value={form.senha}
            onChange={(e) =>
              setForm({
                ...form,
                senha: e.target.value
              })
            }
            className="w-full bg-gray-800 rounded-2xl p-4 outline-none border border-gray-700 focus:border-orange-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 transition-all rounded-2xl py-4 font-black text-lg"
          >

            {loading
              ? "Criando conta..."
              : "CRIAR CONTA"}

          </button>

        </form>

        <div className="mt-8 text-center">

          <p className="text-gray-400">

            Já possui conta?

          </p>

          <Link
            to="/login"
            className="text-orange-500 font-bold"
          >

            Fazer login

          </Link>

        </div>

      </div>

    </div>

  );

}