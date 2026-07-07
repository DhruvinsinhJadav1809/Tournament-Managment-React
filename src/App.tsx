import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/pages/errors/ErrorBoundary";
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { PrivateRoute, AdminRoute, GuestRoute } from "@/routes/guards";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import GamesPage from "@/pages/games/GamesPage";
import TournamentsPage from "@/pages/tournaments/TournamentsPage";
import UsersPage from "@/pages/users/UsersPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import SchedulePage from "./pages/schedule/SchedulePage";
import AnnouncementsPage from "./pages/announcements/AnnouncementsPage";
import MobileBlocker from "./components/layout/MobileBlocker";
import MessagesPage from "@/pages/messages/MessagesPage";

export default function App() {
  return (
    <ErrorBoundary>
      <MobileBlocker>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected */}
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                {/* Admin only */}
                <Route element={<AdminRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/tournaments" element={<TournamentsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </MobileBlocker>
    </ErrorBoundary>
  );
}
