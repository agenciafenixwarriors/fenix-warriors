import AdminLayout from "../layouts/AdminLayout";

export default function Ranking() {

  return (

    <AdminLayout>

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold text-orange-500">
            Ranking
          </h1>

          <p className="text-gray-400 mt-2">
            Top streamers da agência
          </p>

        </div>

      </div>

      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">

        <table className="w-full">

          <thead className="bg-gray-800">

            <tr>

              <th className="p-4 text-left">
                Posição
              </th>

              <th className="p-4 text-left">
                Host
              </th>

              <th className="p-4 text-left">
                Pontos
              </th>

              <th className="p-4 text-left">
                Supervisor
              </th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-t border-gray-800">

              <td className="p-4 font-bold text-orange-400">
                #1
              </td>

              <td className="p-4">
                Streamer Exemplo
              </td>

              <td className="p-4">
                15.000 pts
              </td>

              <td className="p-4">
                Equipe Alpha
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </AdminLayout>

  );
}