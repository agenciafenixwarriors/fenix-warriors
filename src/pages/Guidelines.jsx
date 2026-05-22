import AdminLayout from "../layouts/AdminLayout";

export default function Guidelines() {

  const regras = [

    {
      titulo: "Nudez e Conteúdo Sexual",
      risco: "ALTO",
      descricao:
        "É proibido qualquer conteúdo sexual explícito, nudez parcial ou total, poses sugestivas ou comportamentos inadequados."
    },

    {
      titulo: "Discurso de Ódio",
      risco: "ALTO",
      descricao:
        "Ataques contra raça, religião, nacionalidade, gênero ou orientação sexual geram punições severas."
    },

    {
      titulo: "Violência",
      risco: "MÉDIO",
      descricao:
        "Conteúdos violentos, ameaças ou incentivo à violência podem causar suspensão imediata."
    },

    {
      titulo: "Uso de Música Copyright",
      risco: "MÉDIO",
      descricao:
        "Evite músicas protegidas por direitos autorais sem autorização."
    },

    {
      titulo: "Spam e Engajamento Falso",
      risco: "ALTO",
      descricao:
        "Compra de seguidores, troca de presentes falsa ou manipulação de ranking é proibido."
    },

    {
      titulo: "Consumo de Drogas",
      risco: "ALTO",
      descricao:
        "É proibido aparecer utilizando drogas ilícitas durante lives."
    },

    {
      titulo: "Fake Live",
      risco: "ALTO",
      descricao:
        "Lives gravadas simulando transmissão ao vivo podem gerar banimento."
    },

    {
      titulo: "Comportamento Tóxico",
      risco: "MÉDIO",
      descricao:
        "Discussões excessivas, humilhações ou ataques a usuários podem gerar advertências."
    }

  ];

  return (

    <AdminLayout>

      <div className="mb-10">

        <h1 className="text-5xl font-black text-orange-500">

          Diretrizes BIGO Live

        </h1>

        <p className="text-gray-400 mt-4 text-lg">

          Central oficial de prevenção de banimentos da Fênix Warriors

        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {regras.map((regra, index) => (

          <div
            key={index}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6"
          >

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-2xl font-black">

                {regra.titulo}

              </h2>

              <div
                className={`px-4 py-2 rounded-xl font-bold ${
                  regra.risco === "ALTO"
                    ? "bg-red-600"
                    : regra.risco === "MÉDIO"
                    ? "bg-yellow-600"
                    : "bg-green-600"
                }`}
              >

                {regra.risco}

              </div>

            </div>

            <p className="text-gray-300 leading-relaxed">

              {regra.descricao}

            </p>

          </div>

        ))}

      </div>

      <div className="bg-orange-600 rounded-3xl p-8 mt-10">

        <h2 className="text-3xl font-black mb-4">

          ⚠️ Aviso Importante

        </h2>

        <p className="text-lg leading-relaxed">

          O descumprimento das diretrizes da BIGO pode gerar:
          suspensão, bloqueio de monetização, perda de ranking,
          banimento temporário ou encerramento definitivo da conta.

        </p>

      </div>

    </AdminLayout>

  );

}