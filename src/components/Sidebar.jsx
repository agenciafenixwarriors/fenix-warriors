import { Link } from "react-router-dom";

export default function Sidebar() {
  return (

    <aside className="w-72 bg-gray-900 min-h-screen p-6">

      <h1 className="text-4xl font-bold text-orange-500 mb-10">
        🔥 Fênix
      </h1>

      <nav className="flex flex-col gap-4">

        <Link
          to="/"
          className="bg-gray-800 hover:bg-orange-500 transition-all p-4 rounded-2xl"
        >
          Dashboard
        </Link>

        <Link
          to="/hosts"
          className="bg-gray-800 hover:bg-orange-500 transition-all p-4 rounded-2xl"
        >
          Hosts
        </Link>

        <Link
          to="/ranking"
          className="bg-gray-800 hover:bg-orange-500 transition-all p-4 rounded-2xl"
        >
          Ranking
        </Link>

        <Link
          to="/financial"
          className="bg-gray-800 hover:bg-orange-500 transition-all p-4 rounded-2xl"
        >
          Financeiro
        </Link>

      </nav>

    </aside>
  );
}