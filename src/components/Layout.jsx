import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="w-72 bg-zinc-950 border-r border-zinc-800 p-6">
        <h1 className="text-3xl font-bold text-orange-500 mb-10">
          🐦‍🔥 Fênix
        </h1>

        <nav className="flex flex-col gap-4">
          <Link
            to="/"
            className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl transition"
          >
            📊 Dashboard
          </Link>

          <Link
            to="/members"
            className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl transition"
          >
            👥 Membros
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}