import {
  Link,
  useLocation
} from "react-router-dom";

import {
  Flame,
  LayoutDashboard,
  Users,
  Trophy,
  Wallet,
  LogOut,
  Shield,
  BookOpen,
  AlertTriangle,
  FileSignature,
  KeyRound,
  Upload,
  CalendarDays
} from "lucide-react";

import {
  signOut
} from "firebase/auth";

import {
  auth
} from "../firebase";

import {
  useAuth
} from "../contexts/AuthContext";

export default function AdminLayout({
  children
}) {

  const location = useLocation();

  const { user } = useAuth();

  async function handleLogout() {

    await signOut(auth);

    window.location.href = "/login";

  }

  const menus = [

    {
      nome: "Dashboard",
      rota: "/",
      icon: LayoutDashboard,
      roles: ["admin", "moderador", "financeiro"]
    },

    {
      nome: "Hosts",
      rota: "/hosts",
      icon: Users,
      roles: ["admin", "moderador"]
    },

    {
      nome: "Ranking",
      rota: "/ranking",
      icon: Trophy,
      roles: ["admin", "moderador"]
    },

    {
      nome: "Financeiro",
      rota: "/financial",
      icon: Wallet,
      roles: ["admin", "financeiro"]
    },

    {
      nome: "Diretrizes",
      rota: "/guidelines",
      icon: BookOpen,
      roles: ["admin", "streamer", "moderador"]
    },

    {
      nome: "Advertências",
      rota: "/warnings",
      icon: AlertTriangle,
      roles: ["admin"]
    },

    {
      nome: "Contratos",
      rota: "/contracts",
      icon: FileSignature,
      roles: ["admin"]
    },

    {
      nome: "Recuperação",
      rota: "/recovery",
      icon: KeyRound,
      roles: ["admin"]
    },

    {
      nome: "Importação",
      rota: "/import",
      icon: Upload,
      roles: ["admin"]
    },

    {
      nome: "Central BIGO",
      rota: "/events",
      icon: CalendarDays,
      roles: ["admin"]
    }

  ];

  return (

    <div className="min-h-screen bg-black text-white flex">

      <aside className="w-72 bg-gray-950 border-r border-gray-800 p-6 flex flex-col">

        <div className="flex items-center gap-3 mb-12">

          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/30">

            <Flame size={30} />

          </div>

          <div>

            <h1 className="text-2xl font-black text-orange-500">

              Fênix Warriors

            </h1>

            <p className="text-sm text-gray-400">

              Painel Administrativo

            </p>

          </div>

        </div>

        <div className="mb-10 bg-gray-900 rounded-3xl p-5 border border-gray-800">

          <div className="flex items-center gap-4">

            <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-orange-500/30">

              {user?.nome?.charAt(0) || "F"}

            </div>

            <div className="flex-1 overflow-hidden">

              <h2 className="font-black text-lg truncate">

                {user?.nome || "Usuário"}

              </h2>

              <p className="text-sm text-gray-400 truncate">

                {user?.email}

              </p>

            </div>

          </div>

          <div className="mt-5 flex items-center gap-2 bg-black rounded-2xl px-4 py-3 border border-gray-800">

            <Shield size={18} className="text-orange-400" />

            <span className="uppercase text-sm font-black text-orange-400">

              {user?.role || "streamer"}

            </span>

          </div>

        </div>

        <nav className="flex flex-col gap-3 flex-1 overflow-auto pr-1">

          {menus
            .filter((menu) =>
              menu.roles.includes(user?.role)
            )
            .map((menu) => {

              const Icon = menu.icon;

              const active =
                location.pathname === menu.rota;

              return (

                <Link
                  key={menu.rota}
                  to={menu.rota}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 border font-semibold ${
                    active
                      ? "bg-orange-600 border-orange-500 shadow-lg shadow-orange-500/20"
                      : "bg-gray-900 border-gray-800 hover:bg-gray-800"
                  }`}
                >

                  <Icon size={22} />

                  <span>

                    {menu.nome}

                  </span>

                </Link>

              );

            })}

        </nav>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 mt-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-500/20"
        >

          <LogOut size={20} />

          Sair

        </button>

      </aside>

      <main className="flex-1 p-10 overflow-auto bg-black">

        {children}

      </main>

    </div>

  );

}