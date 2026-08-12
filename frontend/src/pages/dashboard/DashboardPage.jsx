import React, { useState, useEffect } from "react";
import StatCard from "../../components/dashboard/StatCard";
import QuickActionButton from "../../components/dashboard/QuickActionButton";
import RecentMatchesPanel from "../../components/dashboard/RecentMatchesPanel";
import ActiveTournamentsPanel from "../../components/dashboard/ActiveTournamentsPanel";
import MetricPanel from "../../components/dashboard/MetricPanel";
import useAuth from "../../hooks/useAuth";
// import API from "../../apiClient"; // 
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

// කලින් තිබුණු Static data ටික අපි ඒ විදිහටම ගන්නවා
import {
  statCards as initialStatCards,
  recentMatches,
  activeTournaments,
  bottomMetrics,
} from "./dashboardData";
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
  });

  // අලුත්: Active Tournaments ටික තියාගන්න State එක
  const [activeTournamentsList, setActiveTournamentsList] = useState([]);

useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const statsResponse = await API.get("/dashboard/stats");
        const tournamentsResponse = await API.get("/tournaments/");
        const teamsResponse = await API.get("/teams/"); // 1. අලුතින් Teams ටිකත් ගන්නවා
        
        const tournamentsData = tournamentsResponse.data;
        const teamsData = teamsResponse.data; // ඔක්කොම Teams ටික මෙතන තියෙනවා

        setStats({
          ...statsResponse.data,
          total_tournaments: tournamentsData.length,
          // (අවශ්‍ය නම් total_teams එකත් මෙතනින්ම update කරන්න පුළුවන්)
          total_teams: teamsData.length > 0 ? teamsData.length : statsResponse.data.total_teams, 
        });

        const formattedTournaments = tournamentsData.slice(0, 3).map(t => {
          // 2. මේ ටූනමන්ට් එකට අයිති Teams ගාණ ෆිල්ටර් කරලා හොයාගන්නවා
          const matchTeamsCount = teamsData.filter(team => team.tournament_id === t.tournament_id).length;

          return {
            name: t.name,
            status: t.status || "Upcoming",
            dateRange: (t.start_date && t.end_date) ? `${t.start_date} to ${t.end_date}` : "TBD",
            teams: `${matchTeamsCount} teams`, // 3. 0 වෙනුවට අපි හොයාගත්ත ගාණ මෙතනට දානවා
          };
        });
        
        setActiveTournamentsList(formattedTournaments);
        
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  // උඩ තියෙන කොටු 4 ට අංක දැමීම
  const dynamicStatCards = [...initialStatCards];
  if (dynamicStatCards.length >= 4) {
    dynamicStatCards[0] = { ...dynamicStatCards[0], value: stats.total_tournaments }; 
    dynamicStatCards[1] = { ...dynamicStatCards[1], value: stats.total_teams || 0 }; 
    dynamicStatCards[2] = { ...dynamicStatCards[2], value: stats.total_players || 0 }; 
    dynamicStatCards[3] = { ...dynamicStatCards[3], value: stats.total_matches || 0 }; 
  }

  // අලුත්: යට තියෙන Metric Panels වල "Team Overview" එක සජීවී කිරීම
  const dynamicBottomMetrics = [...bottomMetrics];
  if (dynamicBottomMetrics.length > 0) {
    // Players ලා ගාණ ටීම් ගාණෙන් බෙදලා Average එක ගන්නවා
    const avgPlayers = stats.total_teams > 0 ? Math.round(stats.total_players / stats.total_teams) : 0;

    dynamicBottomMetrics[0] = {
      title: "Team Overview",
      rows: [
        { label: "Active Teams", value: stats.total_teams?.toString() || "0" },
        { label: "Registered Players", value: stats.total_players?.toString() || "0" },
        { label: "Avg Players/Team", value: avgPlayers.toString() },
      ],
    };
  }

  return (
    <div className="dashboard-page">
      {/* Ambient background glows */}
      <div className="dashboard-glow dashboard-glow--1" />
      <div className="dashboard-glow dashboard-glow--2" />
      <div className="dashboard-glow dashboard-glow--3" />

      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here&apos;s your volleyball analytics overview</p>
      </header>

      {/* මෙතන අපි දැන් පාවිච්චි කරන්නේ dynamicStatCards (Live Data) */}
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
        <RecentMatchesPanel matches={recentMatches} />
        <ActiveTournamentsPanel tournaments={activeTournamentsList.length > 0 ? activeTournamentsList : activeTournaments} />
      </section>

      <section className="dashboard-row dashboard-row--metrics">
        {dynamicBottomMetrics.map((panel) => (
          <MetricPanel key={panel.title} title={panel.title} rows={panel.rows} />
        ))}
      </section>
    </div>
  );
}