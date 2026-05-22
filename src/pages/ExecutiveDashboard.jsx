import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import {
  db
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function ExecutiveDashboard() {

  const [hosts, setHosts] = useState([]);

  const [ranking, setRanking] = useState([]);

  const [totalBeans, setTotalBeans] = useState(0);

  const [totalHoras, setTotalHoras] = useState(0);

  const [ativos, setAtivos] = useState(0);

  const [settings, setSettings] = useState({

    metaFamilia: 10000000,

    rankingAtual: 55,

    metaRanking: 50,

    percentualBigo: 5,

    objetivoMensal: "TOP 50",

    alertaRisco: 70

  });

  async function carregarConfiguracoes() {

    try {

      const ref = doc(
        db,
        "system_settings",
        "main"
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {

        setSettings((prev) => ({
          ...prev,
          ...snap.data()
        }));

      }

    } catch (error) {

      console.error(error);

    }

  }

  async function carregarDados() {

    try {

      const snapshot = await getDocs(
        collection(db, "hosts")
      );

      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setHosts(lista);

      let beans = 0;

      let horas = 0;

      let ativosCount = 0;

      lista.forEach((host) => {

        beans += Number(host.beans || 0);

        horas += Number(
          host.horasNumero ||
          host.horas ||
          0
        );

        if (host.ativo !== false) {

          ativosCount++;

        }

      });

      setTotalBeans(beans);

      setTotalHoras(horas);

      setAtivos(ativosCount);

      const top = [...lista]
        .sort(
          (a, b) =>
            Number(b.beans || 0) -
            Number(a.beans || 0)
        )
        .slice(0, 8);

      setRanking(top);

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    carregarConfiguracoes();

    carregarDados();

  }, []);

  const progressoMeta =
    settings.metaFamilia > 0
      ? (
          (totalBeans /
            settings.metaFamilia) *
          100
        ).toFixed(1)
      : 0;

  const faltamBeans =
    Math.max(
      settings.metaFamilia -
        totalBeans,
      0
    );

  const faltamPosicoes =
    Math.max(
      settings.rankingAtual -
        settings.metaRanking,
      0
    );

  const receitaAgencia =
    (
      totalBeans *
      (settings.percentualBigo / 100)
    ).toFixed(0);

  const mediaPorHost =
    ativos > 0
      ? Math.floor(totalBeans / ativos)
      : 0;

  const grafico = ranking.map((item) => ({
    nome:
      item.nome?.split(" ")[0] ||
      "Host",
    beans: item.beans || 0
  }));

  return (

    <AdminLayout>

      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-black text-orange-500">

              Executive Dashboard

            </h1>

            <p className="text-gray-400 mt-3 text-lg">

              Inteligência operacional da Fênix Warriors

            </p>

          </div>

          <div className="bg-orange-500/10 border border-orange-500 rounded-3xl px-8 py-5">

            <p className="text-sm text-orange-300">

              OBJETIVO DO MÊS

            </p>

            <h2 className="text-4xl font-black text-orange-500">

              {settings.objetivoMensal}

            </h2>

          </div>

        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">

            <p className="text-gray-400">

              Beans Totais

            </p>

            <h2 className="text-5xl font-black text-green-400 mt-4">

              {totalBeans.toLocaleString("pt-BR")}

            </h2>

          </div>

          <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">

            <p className="text-gray-400">

              Horas Totais

            </p>

            <h2 className="text-5xl font-black text-blue-400 mt-4">

              {Math.floor(totalHoras)}

            </h2>

          </div>

          <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">

            <p className="text-gray-400">

              Hosts Ativos

            </p>

            <h2 className="text-5xl font-black text-pink-400 mt-4">

              {ativos}

            </h2>

          </div>

          <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800">

            <p className="text-gray-400">

              Progresso da Meta

            </p>

            <h2 className="text-5xl font-black text-orange-500 mt-4">

              {progressoMeta}%

            </h2>

          </div>

        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-10">

          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">

            <p className="text-gray-400 mb-4">

              Ranking Atual

            </p>

            <h2 className="text-7xl font-black text-orange-500">

              #{settings.rankingAtual}

            </h2>

            <p className="text-gray-500 mt-4">

              Ranking oficial BIGO

            </p>

          </div>

          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">

            <p className="text-gray-400 mb-4">

              Meta Ranking

            </p>

            <h2 className="text-6xl font-black text-pink-400">

              TOP {settings.metaRanking}

            </h2>

            <p className="text-gray-500 mt-4">

              Objetivo operacional

            </p>

          </div>

          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">

            <p className="text-gray-400 mb-4">

              Faltam Beans

            </p>

            <h2 className="text-4xl font-black text-green-400">

              {faltamBeans.toLocaleString("pt-BR")}

            </h2>

            <p className="text-gray-500 mt-4">

              Para atingir a meta

            </p>

          </div>

          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">

            <p className="text-gray-400 mb-4">

              Distância do TOP

            </p>

            <h2 className="text-5xl font-black text-blue-400">

              {faltamPosicoes}

            </h2>

            <p className="text-gray-500 mt-4">

              posições restantes

            </p>

          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-3xl font-black">

                TOP Hosts

              </h2>

              <div className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-2xl font-bold">

                TOP 8

              </div>

            </div>

            <div className="space-y-4">

              {ranking.map((host, index) => (

                <div
                  key={host.id}
                  className="bg-black rounded-2xl p-5 flex items-center justify-between border border-gray-800"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-xl font-black">

                      {index + 1}

                    </div>

                    <div>

                      <h3 className="font-black text-lg">

                        {host.nome || "Sem Nome"}

                      </h3>

                      <p className="text-gray-500 text-sm">

                        {host.bigoId}

                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <h2 className="text-2xl font-black text-green-400">

                      {(host.beans || 0).toLocaleString("pt-BR")}

                    </h2>

                    <p className="text-gray-500 text-sm">

                      beans

                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-3xl font-black">

                Performance Geral

              </h2>

            </div>

            <ResponsiveContainer width="100%" height={450}>

              <AreaChart data={grafico}>

                <XAxis dataKey="nome" />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="beans"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">

          <h2 className="text-3xl font-black mb-8">

            Inteligência Operacional

          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-4">

                Receita Agência

              </p>

              <h2 className="text-4xl font-black text-orange-500">

                {Number(receitaAgencia).toLocaleString("pt-BR")}

              </h2>

              <p className="text-gray-500 mt-3">

                estimativa BIGO %

              </p>

            </div>

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-4">

                Média por Host

              </p>

              <h2 className="text-4xl font-black text-green-400">

                {mediaPorHost.toLocaleString("pt-BR")}

              </h2>

              <p className="text-gray-500 mt-3">

                beans por host

              </p>

            </div>

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-4">

                Alerta de Risco

              </p>

              <h2 className="text-4xl font-black text-red-400">

                {settings.alertaRisco}%

              </h2>

              <p className="text-gray-500 mt-3">

                limite operacional

              </p>

            </div>

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-4">

                Percentual BIGO

              </p>

              <h2 className="text-4xl font-black text-blue-400">

                {settings.percentualBigo}%

              </h2>

              <p className="text-gray-500 mt-3">

                comissão da agência

              </p>

            </div>

          </div>

        </div>

      </div>

    </AdminLayout>

  );

}