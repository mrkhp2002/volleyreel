import React, { useState, useEffect } from "react";
import StatCard from "../../components/dashboard/StatCard";
import QuickActionButton from "../../components/dashboard/QuickActionButton";
import RecentMatchesPanel from "../../components/dashboard/RecentMatchesPanel";
import ActiveTournamentsPanel from "../../components/dashboard/ActiveTournamentsPanel";
import MetricPanel from "../../components/dashboard/MetricPanel";
import useAuth from "../../hooks/useAuth";
import API from "../../services/apiClient";

import {
  TrophyIcon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  VideoIcon,
  PlusCircleIcon,
  UploadIcon,
  FileIcon,
} from "../../components/dashboard/icons";

import "../../styles/dashboard.css";

const statIcons = [
  <TrophyIcon />,
  <UsersIcon />,
  <UserIcon />,
  <CalendarIcon />,
  <ClockIcon />,
  <VideoIcon />,
];

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    total_tournaments: 0,
    total_teams: 0,
    total_players: 0,
    total_matches: 0,
    under_review: 0,
    videos_generated: 0
  });

  const [activeTournamentsList, setActiveTournamentsList] = useState([]);
  const [recentMatchesList, setRecentMatchesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const statsResponse = await API.get("/dashboard/stats");
        const tournamentsResponse = await API.get("/tournaments/");
        const teamsResponse = await API.get("/teams/");
        
        const tournamentsData = Array.isArray(tournamentsResponse.data) ? tournamentsResponse.data : [];
        const teamsData = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
        const statsData = statsResponse.data || {};

        setStats({
          total_tournaments: tournamentsData.length,
          total_teams: teamsData.length,
          total_players: statsData.total_players || 0,
          total_matches: statsData.total_matches || 0,
          under_review: statsData.under_review || 0,
          videos_generated: statsData.videos_generated || 0
        });

        if (statsData.recent_matches && Array.isArray(statsData.recent_matches)) {
          setRecentMatchesList(statsData.recent_matches);
        }

        const formattedTournaments = tournamentsData.slice(0, 5).map(t => {
          const matchTeamsCount = teamsData.filter(team => team.tournament_id === t.tournament_id).length;

          return {
            name: t.name,
            status: t.status || "Upcoming",
            dateRange: (t.start_date && t.end_date) ? `${t.start_date} to ${t.end_date}` : "TBD",
            teams: `${matchTeamsCount} teams`,
          };
        });
        
        setActiveTournamentsList(formattedTournaments);
        
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const dynamicStatCards = [
    { label: "Total Tournaments", value: stats.total_tournaments, trend: "Live Data", iconTone: "blue" },
    { label: "Total Teams", value: stats.total_teams, trend: "Live Data", iconTone: "teal" },
    { label: "Total Players", value: stats.total_players, trend: "Live Data", iconTone: "purple" },
    { label: "Total Matches", value: stats.total_matches, trend: "Live Data", iconTone: "blue" },
    { label: "Under Review", value: stats.under_review, trend: "Live Data", iconTone: "orange" },
    { label: "Videos Generated", value: stats.videos_generated, trend: "Live Data", iconTone: "teal" },
  ];

  const avgPlayers = stats.total_teams > 0 ? Math.round(stats.total_players / stats.total_teams) : 0;

  const dynamicBottomMetrics = [
    {
      title: "Team Overview",
      rows: [
        { label: "Active Teams", value: stats.total_teams.toString() },
        { label: "Registered Players", value: stats.total_players.toString() },
        { label: "Avg Players/Team", value: avgPlayers.toString() },
      ],
    },
    {
      title: "Tournament Scope",
      rows: [
        { label: "Active Tournaments", value: stats.total_tournaments.toString(), tone: "success" },
        { label: "Matches Scheduled", value: stats.total_matches.toString(), tone: "info" },
        { label: "Reviews Pending", value: stats.under_review.toString() },
      ],
    },
    {
      title: "Video Generation",
      rows: [
        { label: "Videos Ready", value: stats.videos_generated.toString(), tone: "success" },
        { label: "Processing Now", value: stats.under_review.toString(), tone: "info" },
        { label: "Total Match Videos", value: stats.total_matches.toString() },
      ],
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Ambient background glows */}
      <div className="dashboard-glow dashboard-glow--1" />
      <div className="dashboard-glow dashboard-glow--2" />
      <div className="dashboard-glow dashboard-glow--3" />

      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here&apos;s your live volleyball analytics overview</p>
      </header>

      <section className="dashboard-stats-grid" aria-label="Key metrics">
        {dynamicStatCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} icon={statIcons[index]} />
        ))}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="dashboard-quick-actions">
          {user?.role === "public_user" ? (
            <>
              <QuickActionButton to="/reports/tournament" tone="blue" title="Tournament Reports" subtitle="View tournament recap reports" icon={<TrophyIcon />} />
              <QuickActionButton to="/reports/public" tone="teal" title="Public Match Reports" subtitle="View shared match reports" icon={<FileIcon />} />
              <QuickActionButton to="/matches/videos" tone="purple" title="Highlight Reels" subtitle="Watch processed highlight videos" icon={<VideoIcon />} />
              <QuickActionButton to="/tournament-analytics" tone="orange" title="Tournament Analytics" subtitle="Analyze game statistics" icon={<PlusCircleIcon />} />
              <QuickActionButton to="/leaderboards" tone="royal" title="Leaderboards" subtitle="Check standings and ranks" icon={<UploadIcon />} />
            </>
          ) : (
            <>
              <QuickActionButton to="/tournaments/create" tone="blue" title="Create Tournament" subtitle="Set up a new tournament" icon={<TrophyIcon />} />
              <QuickActionButton to="/teams/create" tone="teal" title="Add Team" subtitle="Register a new team" icon={<UsersIcon />} />
              <QuickActionButton to="/players?add=true" tone="purple" title="Add Player" subtitle="Add player to roster" icon={<UserIcon />} />
              <QuickActionButton to="/matches/create" tone="orange" title="Create Match" subtitle="Set up a new match" icon={<PlusCircleIcon />} />
              <QuickActionButton to="/matches/upload" tone="royal" title="Upload & Review" subtitle="Upload match videos" icon={<UploadIcon />} />
              <QuickActionButton to="/reports/tournament" tone="dark-teal" title="View Reports" subtitle="Access analytics reports" icon={<FileIcon />} />
            </>
          )}
        </div>
      </section>

      <section className="dashboard-row dashboard-row--split">
        <RecentMatchesPanel matches={recentMatchesList} />
        <ActiveTournamentsPanel tournaments={activeTournamentsList} />
      </section>

      <section className="dashboard-row dashboard-row--metrics">
        {dynamicBottomMetrics.map((panel) => (
          <MetricPanel key={panel.title} title={panel.title} rows={panel.rows} />
        ))}
      </section>
    </div>
  );
}