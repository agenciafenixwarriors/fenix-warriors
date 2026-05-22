import { useAuth } from "../contexts/AuthContext";

import AdminLayout from "../layouts/AdminLayout";

export default function StreamerDashboard() {

  const { user } = useAuth();

  return (

    <AdminLayout>

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-black text-orange-500">

            Olá, {user?.nome}

          </h1>

          <p className="text-gray-400 mt-3 text-lg">

            Bem-vinda ao painel da Fênix Warriors

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Meta Beans

          </h2>

          <p className="text-4xl font-black text-green-400 mt-3">

            {user?.metas?.beans || 0}

          </p>

        </div>

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Meta Horas

          </h2>

          <p className="text-4xl font-black text-blue-400 mt-3">

            {user?.metas?.horas || 0}

          </p>

        </div>

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Status

          </h2>

          <p className="text-3xl font-black text-orange-400 mt-3">

            {user?.status || "ativo"}

          </p>

        </div>

        <div className="bg-gray-900 p-6 rounded-3xl">

          <h2 className="text-gray-400">

            Cargo

          </h2>

          <p className="text-3xl font-black text-pink-400 mt-3 uppercase">

            {user?.role}

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-gray-900 rounded-3xl p-6">

          <h2 className="text-2xl font-black mb-6">

            Dados da Conta

          </h2>

          <div className="space-y-4">

            <div className="bg-gray-800 p-4 rounded-2xl">

              <p className="text-gray-400 text-sm">

                Nome

              </p>

              <p className="font-bold text-lg">

                {user?.nome}

              </p>

            </div>

            <div className="bg-gray-800 p-4 rounded-2xl">

              <p className="text-gray-400 text-sm">

                Email

              </p>

              <p className="font-bold text-lg">

                {user?.email}

              </p>

            </div>

            <div className="bg-gray-800 p-4 rounded-2xl">

              <p className="text-gray-400 text-sm">

                BIGO ID

              </p>

              <p className="font-bold text-lg">

                {user?.bigoId}

              </p>

            </div>

          </div>

        </div>

        <div className="bg-gray-900 rounded-3xl p-6">

          <h2 className="text-2xl font-black mb-6">

            Avisos da Agência

          </h2>

          <div className="space-y-4">

            <div className="bg-orange-600 p-4 rounded-2xl">

              <p className="font-bold">

                🔥 Bem-vinda à Fênix Warriors

              </p>

            </div>

            <div className="bg-gray-800 p-4 rounded-2xl">

              <p>

                Leia atentamente as regras da BIGO Live para evitar punições.

              </p>

            </div>

            <div className="bg-gray-800 p-4 rounded-2xl">

              <p>

                Complete suas metas mensais para manter benefícios da agência.

              </p>

            </div>

          </div>

        </div>

      </div>

    </AdminLayout>

  );

}