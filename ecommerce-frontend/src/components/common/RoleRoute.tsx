import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import Loader from "./Loader";

// Use nested under ProtectedRoute - only lets through users with an allowed role.
export default function RoleRoute({ allow }: { allow: Role[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;
  if (!user || !allow.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
