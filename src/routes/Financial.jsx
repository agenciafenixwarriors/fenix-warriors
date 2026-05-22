import Sidebar from "../components/Sidebar";

export default function Financial() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      <Sidebar />

      <main className="flex-1 p-10">

        <div className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-5xl font-bold text-orange-500">
              Financeiro
            </h1>

            <p className="text-gray-400 mt-2">
              Controle financeiro da agência
            </p>
          </div>

        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-gray-900 p-6 rounded-2xl">
            <h2 className="text-gray-400">
              Receita Total
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
              Comissões
            </h2>

            <p className="text-3xl font-bold mt-3">
              R$ 0
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

        <div className="bg-gray-900 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            Últimas Transações
          </h2>

          <table className="w-full">

            <thead className="bg-gray-800">

              <tr>
                <th className="p-4 text-left">Host</th>
                <th className="p-4 text-left">Valor</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Data</th>
              </tr>

            </thead>

            <tbody>

              <tr className="border-t border-gray-800">

                <td className="p-4">
                  Streamer Exemplo
                </td>

                <td className="p-4">
                  R$ 500
                </td>

                <td className="p-4 text-green-400">
                  Pago
                </td>

                <td className="p-4">
                  12/05/2026
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}