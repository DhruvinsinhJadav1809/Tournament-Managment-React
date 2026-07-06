import { useAuth } from "@/hooks/useAuth";
import AdminDashboardPage from "./AdminDashboardPage";
import UserDashboardPage from "./UserDashboardPage";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboardPage /> : <UserDashboardPage />;
}
