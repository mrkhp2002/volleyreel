import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import TournamentsPage from "../pages/tournaments/TournamentsPage";
import TeamsPage from "../pages/teams/TeamsPage";
import CreateTeamPage from "../pages/teams/CreateTeamPage";
import TeamDetailsPage from "../pages/teams/TeamDetailsPage";
import EditTeamPage from "../pages/teams/EditTeamPage";
import PlayersPage from "../pages/players/PlayersPage";
import MatchesPage from "../pages/matches/MatchesPage";
import MatchesCreatePage from "../pages/matches/MatchesCreatePage";
import MatchesUploadPage from "../pages/matches/MatchesUploadPage";
import MatchesVideosPage from "../pages/matches/MatchesVideosPage";
import MatchDetailsPage from "../pages/matches/MatchDetailsPage";
import TournamentAnalyticsPage from "../pages/tournament-analytics/TournamentAnalyticsPage";
import TournamentReportsPage from "../pages/reports/TournamentReportsPage";
import PublicReportsPage from "../pages/reports/PublicReportsPage";
import SettingsPage from "../pages/settings/SettingsPage";
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
          <Route path="/teams">
            <Route index element={<TeamsPage />} />
            <Route path="create" element={<CreateTeamPage />} />
            <Route path=":teamId/edit" element={<EditTeamPage />} />
            <Route path=":teamId" element={<TeamDetailsPage />} />
          </Route>
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/matches">
            <Route index element={<MatchesPage />} />
            <Route path="create" element={<MatchesCreatePage />} />
            <Route path="upload" element={<MatchesUploadPage />} />
            <Route path="videos" element={<MatchesVideosPage />} />
            <Route path=":matchId" element={<MatchDetailsPage />} />
          </Route>
          <Route path="/tournament-analytics" element={<TournamentAnalyticsPage />} />
          <Route path="/reports" element={<Navigate to="/reports/tournament" replace />} />
          <Route path="/reports/tournament" element={<TournamentReportsPage />} />
          <Route path="/reports/public" element={<PublicReportsPage />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}