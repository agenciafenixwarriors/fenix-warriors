export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        Dashboard Fênix
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">
            Ranking
          </h2>

          <p className="text-zinc-400">
            Sistema de pontuação da equipe.
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">
            Financeiro
          </h2>

          <p className="text-zinc-400">
            Controle financeiro da agência.
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">
            Quiz
          </h2>

          <p className="text-zinc-400">
            Sistema de treinamento e gamificação.
          </p>
        </div>
      </div>
    </div>
  );
}