import { useState } from "react";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  auth
} from "../firebase";

import {
  Link,
  useNavigate
} from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {

    e.preventDefault();

    try {

      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      navigate("/");

    } catch (error) {

      console.error(error);

      alert("Email ou senha inválidos");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-10">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-black text-orange-500">

            🐦‍🔥 Fênix Warriors

          </h1>

          <p className="text-gray-400 mt-4">

            Painel Oficial da Agência

          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <input
            type="email"
            placeholder="Seu email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 outline-none focus:border-orange-500"
          />

          <input
            type="password"
            placeholder="Sua senha"
            required
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-4 outline-none focus:border-orange-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 transition-all rounded-2xl py-4 font-black text-lg"
          >

            {loading
              ? "Entrando..."
              : "ENTRAR"}

          </button>

        </form>

        <div className="mt-8 text-center space-y-3">

          <div>

            <Link
              to="/register"
              className="text-orange-500 font-bold"
            >

              Criar conta

            </Link>

          </div>

          <div>

            <Link
              to="/recovery"
              className="text-gray-400"
            >

              Recuperar acesso

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}