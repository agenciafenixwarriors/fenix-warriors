import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  children,
  requiredRole
}) {

  const { user, loading } = useAuth();

  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Carregando...

      </div>
    );

  }

  if (!user) {

    return <Navigate to="/login" />;

  }

  if (
    requiredRole &&
    user.role !== requiredRole
  ) {

    return <Navigate to="/" />;

  }

  return children;

}