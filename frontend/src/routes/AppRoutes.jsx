import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import TournamentsPage from "../pages/tournaments/TournamentsPage";
import TeamsPage from "../pages/teams/TeamsPage";
import PlayersPage from "../pages/players/PlayersPage";
import MatchesPage from "../pages/matches/MatchesPage";
import TournamentAnalyticsPage from "../pages/tournament-analytics/TournamentAnalyticsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import LeaderboardsPage from "../pages/leaderboards/LeaderboardsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Application Routes (wrapped in AppLayout and ProtectedRoute) */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/tournament-analytics" element={<TournamentAnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}