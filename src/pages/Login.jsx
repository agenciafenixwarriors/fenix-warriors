export default function Login() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-10 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Seu email"
          className="w-full p-3 rounded-lg bg-zinc-800 mb-4"
        />

        <input
          type="password"
          placeholder="Sua senha"
          className="w-full p-3 rounded-lg bg-zinc-800 mb-6"
        />

        <button className="w-full bg-orange-500 hover:bg-orange-600 p-3 rounded-lg font-bold">
          Entrar
        </button>
      </div>
    </div>
  );
}