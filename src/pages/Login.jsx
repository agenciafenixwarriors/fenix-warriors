import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../services/firebase";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");
    } catch (error) {
      console.log(error);

      alert("Email ou senha inválidos");
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-900 p-10 rounded-2xl w-full max-w-md"
      >
        <h1 className="text-4xl text-white font-bold mb-6">
          🐦‍🔥 Login Fênix
        </h1>

        <input
          type="email"
          placeholder="Seu email"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white mb-4"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Sua senha"
          className="w-full p-3 rounded-lg bg-zinc-800 text-white mb-6"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-3 rounded-lg">
          Entrar
        </button>
      </form>
    </div>
  );
}