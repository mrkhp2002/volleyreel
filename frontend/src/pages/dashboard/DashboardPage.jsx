import StatCard from "../../components/dashboard/StatCard";
import QuickActionButton from "../../components/dashboard/QuickActionButton";
import RecentMatchesPanel from "../../components/dashboard/RecentMatchesPanel";
import ActiveTournamentsPanel from "../../components/dashboard/ActiveTournamentsPanel";
import MetricPanel from "../../components/dashboard/MetricPanel";
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
import {
  statCards,
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
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here&apos;s your volleyball analytics overview</p>
      </header>

      <section className="dashboard-stats-grid" aria-label="Key metrics">
        {statCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} icon={statIcons[index]} />
        ))}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="dashboard-quick-actions">
          <QuickActionButton
            to="/tournaments"
            tone="blue"
            title="Create Tournament"
            subtitle="Set up a new tournament"
            icon={<TrophyIcon />}
          />
          <QuickActionButton
            to="/teams"
            tone="teal"
            title="Add Team"
            subtitle="Register a new team"
            icon={<UsersIcon />}
          />
          <QuickActionButton
            to="/players"
            tone="purple"
            title="Add Player"
            subtitle="Add player to roster"
            icon={<UserIcon />}
          />
          <QuickActionButton
            to="/matches"
            tone="orange"
            title="Create Match"
            subtitle="Set up a new match"
            icon={<PlusCircleIcon />}
          />
          <QuickActionButton
            to="/matches"
            tone="royal"
            title="Upload & Review"
            subtitle="Upload match videos"
            icon={<UploadIcon />}
          />
          <QuickActionButton
            to="/reports"
            tone="dark-teal"
            title="View Reports"
            subtitle="Access analytics reports"
            icon={<FileIcon />}
          />
        </div>
      </section>

      <section className="dashboard-row dashboard-row--split">
        <RecentMatchesPanel matches={recentMatches} />
        <ActiveTournamentsPanel tournaments={activeTournaments} />
      </section>

      <section className="dashboard-row dashboard-row--metrics">
        {bottomMetrics.map((panel) => (
          <MetricPanel key={panel.title} title={panel.title} rows={panel.rows} />
        ))}
      </section>
    </div>
  );
}
