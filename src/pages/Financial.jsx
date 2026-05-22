import Sidebar from "../components/Sidebar";

export default function Financial() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      <Sidebar />

      <main className="flex-1 p-10">

        <h1 className="text-5xl font-bold text-orange-500 mb-10">
          Financeiro
        </h1>

        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-gray-900 p-6 rounded-2xl">
            <h2 className="text-gray-400">
              Receita
            </h2>

            <p className="text-3xl font-bold mt-3">
              R$ 0
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl">
            <h2 className="text-gray-400">
              Comissões
            </h2>

            <p className="text-3xl font-bold mt-3">
              R$ 0
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl">
            <h2 className="text-gray-400">
              Pagamentos
            </h2>

            <p className="text-3xl font-bold mt-3">
              0
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl">
            <h2 className="text-gray-400">
              Lucro
            </h2>

            <p className="text-3xl font-bold mt-3 text-green-400">
              R$ 0
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}