export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-8">
        🐦‍🔥 Dashboard Fênix
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-3">
            Ranking
          </h2>

          <p className="text-zinc-400">
            Sistema de pontuação.
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-3">
            Financeiro
          </h2>

          <p className="text-zinc-400">
            Controle da agência.
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-3">
            Gamificação
          </h2>

          <p className="text-zinc-400">
            XP, níveis e desafios.
          </p>
        </div>
      </div>
    </div>
  );
}