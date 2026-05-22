import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import AdminLayout from "../layouts/AdminLayout";

import {
  getDashboardData
} from "../services/dashboardService";

export default function Dashboard() {

  const [dashboard, setDashboard] = useState({

    totalHosts: 0,

    activeHosts: 0,

    inactiveHosts: 0,

    totalWarnings: 0,

    highRisk: 0,

    totalBeans: 0,

    ranking: []

  });

  const [loading, setLoading] = useState(true);

  async function loadDashboard() {

    try {

      const data =
        await getDashboardData();

      setDashboard(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadDashboard();

  }, []);

  if (loading) {

    return (

      <AdminLayout>

        <div className="text-2xl text-white">

          Carregando dashboard...

        </div>

      </AdminLayout>

    );

  }

  return (

    <AdminLayout>

      <div className="mb-10">

        <h1 className="text-5xl font-black text-orange-500">

          Fênix Warriors

        </h1>

        <p className="text-gray-400 mt-3 text-lg">

          Central inteligente da agência

        </p>

      </div>

      <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-gray-400">

            Hosts

          </h2>

          <p className="text-4xl font-black text-orange-500 mt-3">

            {dashboard.totalHosts}

          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-gray-400">

            Ativas

          </h2>

          <p className="text-4xl font-black text-green-400 mt-3">

            {dashboard.activeHosts}

          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-gray-400">

            Inativas

          </h2>

          <p className="text-4xl font-black text-red-400 mt-3">

            {dashboard.inactiveHosts}

          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-gray-400">

            Advertências

          </h2>

          <p className="text-4xl font-black text-yellow-400 mt-3">

            {dashboard.totalWarnings}

          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-gray-400">

            Alto Risco

          </h2>

          <p className="text-4xl font-black text-red-500 mt-3">

            {dashboard.highRisk}

          </p>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <h2 className="text-gray-400">

            Total Beans

          </h2>

          <p className="text-3xl font-black text-green-400 mt-3">

            {dashboard.totalBeans.toLocaleString("pt-BR")}

          </p>

        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-black">

                Ranking TOP 5

              </h2>

              <p className="text-gray-400 mt-2">

                Streamers com maior quantidade de beans

              </p>

            </div>

          </div>

          <ResponsiveContainer width="100%" height={400}>

            <BarChart data={dashboard.ranking}>

              <XAxis dataKey="nome" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="beans" />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-3xl font-black">

                Ranking Atual

              </h2>

              <p className="text-gray-400 mt-2">

                Performance geral das streamers

              </p>

            </div>

          </div>

          <div className="space-y-4">

            {dashboard.ranking.map((host, index) => (

              <div
                key={host.id}
                className="bg-gray-800 rounded-2xl p-5 flex items-center justify-between"
              >

                <div className="flex items-center gap-4">

                  <div className="bg-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">

                    #{index + 1}

                  </div>

                  <div>

                    <h3 className="font-black text-lg">

                      {host.nome || "Sem Nome"}

                    </h3>

                    <p className="text-gray-400 text-sm">

                      {host.bigoId}

                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="text-green-400 text-2xl font-black">

                    {(host.beans || 0).toLocaleString("pt-BR")}

                  </p>

                  <p className="text-gray-400 text-sm">

                    beans

                  </p>

                </div>

              </div>

            ))}

            {dashboard.ranking.length === 0 && (

              <div className="text-gray-400">

                Nenhuma streamer cadastrada.

              </div>

            )}

          </div>

        </div>

      </div>

    </AdminLayout>

  );

}