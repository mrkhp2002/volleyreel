import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import TournamentsPage from '../pages/tournaments/TournamentsPage';
import TeamsPage from '../pages/teams/TeamsPage';
import PlayersPage from '../pages/players/PlayersPage';
import MatchesPage from '../pages/matches/MatchesPage';
import TournamentAnalyticsPage from '../pages/tournament-analytics/TournamentAnalyticsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import LeaderboardsPage from '../pages/leaderboards/LeaderboardsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/tournament-analytics" element={<TournamentAnalyticsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/leaderboards" element={<LeaderboardsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
