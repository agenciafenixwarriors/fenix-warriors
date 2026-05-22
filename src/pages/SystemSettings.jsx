import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  db
} from "../firebase";

import AdminLayout from "../layouts/AdminLayout";

export default function SystemSettings() {

  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({

    metaFamilia: 10000000,

    rankingAtual: 55,

    metaRanking: 50,

    percentualBigo: 5,

    metaRecrutamento: 10,

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

        setSettings({
          ...settings,
          ...snap.data()
        });

      }

    } catch (error) {

      console.error(error);

    }

  }

  useEffect(() => {

    carregarConfiguracoes();

  }, []);

  async function salvarConfiguracoes() {

    try {

      setLoading(true);

      await setDoc(
        doc(
          db,
          "system_settings",
          "main"
        ),
        {

          ...settings,

          atualizadoEm:
            new Date().toISOString()

        }
      );

      alert(
        "Configurações salvas!"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Erro ao salvar configurações"
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <AdminLayout>

      <div className="max-w-6xl mx-auto">

        <div className="mb-10">

          <h1 className="text-5xl font-black text-orange-500">

            Configurações do Sistema

          </h1>

          <p className="text-gray-400 mt-3 text-lg">

            Controle global da Fênix Warriors

          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">

            <h2 className="text-3xl font-black mb-8">

              Metas da Família

            </h2>

            <div className="space-y-6">

              <div>

                <label className="block text-gray-400 mb-2">

                  Meta da Família (Beans)

                </label>

                <input
                  type="number"
                  value={settings.metaFamilia}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      metaFamilia:
                        Number(e.target.value)
                    })
                  }
                  className="w-full bg-black rounded-2xl p-5 border border-gray-800"
                />

              </div>

              <div>

                <label className="block text-gray-400 mb-2">

                  Ranking Atual

                </label>

                <input
                  type="number"
                  value={settings.rankingAtual}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rankingAtual:
                        Number(e.target.value)
                    })
                  }
                  className="w-full bg-black rounded-2xl p-5 border border-gray-800"
                />

              </div>

              <div>

                <label className="block text-gray-400 mb-2">

                  Meta de Ranking

                </label>

                <input
                  type="number"
                  value={settings.metaRanking}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      metaRanking:
                        Number(e.target.value)
                    })
                  }
                  className="w-full bg-black rounded-2xl p-5 border border-gray-800"
                />

              </div>

              <div>

                <label className="block text-gray-400 mb-2">

                  Objetivo Mensal

                </label>

                <input
                  type="text"
                  value={settings.objetivoMensal}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      objetivoMensal:
                        e.target.value
                    })
                  }
                  className="w-full bg-black rounded-2xl p-5 border border-gray-800"
                />

              </div>

            </div>

          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">

            <h2 className="text-3xl font-black mb-8">

              Operação BIGO

            </h2>

            <div className="space-y-6">

              <div>

                <label className="block text-gray-400 mb-2">

                  Percentual BIGO (%)

                </label>

                <input
                  type="number"
                  value={settings.percentualBigo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      percentualBigo:
                        Number(e.target.value)
                    })
                  }
                  className="w-full bg-black rounded-2xl p-5 border border-gray-800"
                />

              </div>

              <div>

                <label className="block text-gray-400 mb-2">

                  Meta de Recrutamento

                </label>

                <input
                  type="number"
                  value={settings.metaRecrutamento}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      metaRecrutamento:
                        Number(e.target.value)
                    })
                  }
                  className="w-full bg-black rounded-2xl p-5 border border-gray-800"
                />

              </div>

              <div>

                <label className="block text-gray-400 mb-2">

                  Alerta de Risco (%)

                </label>

                <input
                  type="number"
                  value={settings.alertaRisco}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alertaRisco:
                        Number(e.target.value)
                    })
                  }
                  className="w-full bg-black rounded-2xl p-5 border border-gray-800"
                />

              </div>

            </div>

          </div>

        </div>

        <div className="mt-10 bg-gray-900 border border-gray-800 rounded-3xl p-8">

          <h2 className="text-3xl font-black mb-8">

            Resumo Operacional

          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-3">

                Meta Família

              </p>

              <h2 className="text-3xl font-black text-green-400">

                {settings.metaFamilia.toLocaleString("pt-BR")}

              </h2>

            </div>

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-3">

                Ranking Atual

              </p>

              <h2 className="text-3xl font-black text-orange-500">

                #{settings.rankingAtual}

              </h2>

            </div>

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-3">

                Meta Ranking

              </p>

              <h2 className="text-3xl font-black text-pink-400">

                TOP {settings.metaRanking}

              </h2>

            </div>

            <div className="bg-black rounded-2xl p-6 border border-gray-800">

              <p className="text-gray-400 mb-3">

                BIGO %

              </p>

              <h2 className="text-3xl font-black text-blue-400">

                {settings.percentualBigo}%

              </h2>

            </div>

          </div>

        </div>

        <button
          onClick={salvarConfiguracoes}
          disabled={loading}
          className="w-full mt-10 bg-orange-600 hover:bg-orange-500 py-5 rounded-3xl text-2xl font-black"
        >

          {loading
            ? "Salvando..."
            : "Salvar Configurações"}

        </button>

      </div>

    </AdminLayout>

  );

}