import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { EditIcon, PlusIcon, TrashIcon, ViewIcon } from "../../components/common/TableActionIcons";
import { teamSummaryStats } from "./teamsData"; // teamsList එක අයින් කළා
import API from "../../services/apiClient"; // API එක import කළා
import "../../styles/management.css";

const statusClass = {
  Active: "mgmt-badge mgmt-badge--active",
  Inactive: "mgmt-badge mgmt-badge--inactive",
  Draft: "mgmt-badge mgmt-badge--upcoming",
};

export default function TeamsPage() {
  const [teams, setTeams] = useState([]); // අලුත් Teams state එක
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeSubtab, setActiveSubtab] = useState("list");

  // 1. Database eken data Load kireema
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const [teamsRes, playersRes] = await Promise.all([
          API.get("/teams/"),
          API.get("/players/").catch(() => ({ data: [] }))
        ]);

        const allPlayers = playersRes.data || [];
        const playersCountMap = {};
        allPlayers.forEach(p => {
          if (p.team_id) {
            playersCountMap[p.team_id] = (playersCountMap[p.team_id] || 0) + 1;
          }
        });

        const formattedTeams = (teamsRes.data || []).map(t => ({
          id: String(t.team_id),
          name: t.name,
          coach: t.coach || "-",
          city: t.club_name || "-",
          players: playersCountMap[t.team_id] || 0,
          division: t.division || "Premier",
          status: t.status || "Active",
          tournament_id: t.tournament_id
        }));

        setTeams(formattedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // 2. Search & Filters 
  const filtered = useMemo(() => {
    return teams.filter((team) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        team.name.toLowerCase().includes(q) ||
        team.id.toLowerCase().includes(q) ||
        team.city.toLowerCase().includes(q) ||
        team.coach.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || team.status === statusFilter;
      const matchesDivision = !divisionFilter || team.division === divisionFilter;
      return matchesSearch && matchesStatus && matchesDivision;
    });
  }, [teams, search, statusFilter, divisionFilter]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 3. Stats Calculation 
  const divisionCounts = useMemo(() => {
    const counts = { Premier: 0, "Division 1": 0, "Division 2": 0 };
    teams.forEach((t) => {
      if (counts[t.division] !== undefined) counts[t.division]++;
    });
    return counts;
  }, [teams]);

  const totalListTeams = teams.length;

  // 4. Delete Team Function eka Database sambanda karanwa
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/teams/${deleteTarget.id}`);

      setTeams(teams.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      setPage(1);
      alert("Team deleted successfully!");
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Failed to delete team.");
    }
  };

  if (loading) {
    return <div className="management-page" style={{ padding: "40px", color: "white", textAlign: "center" }}>Loading teams...</div>;
  }

  return (
    <div className="management-page">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Main Header */}
      <header className="mgmt-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage and track all volleyball teams in one place</p>
        </div>
        <Link to="/teams/create" className="mgmt-btn mgmt-btn--primary">
          <PlusIcon />
          Create Team
        </Link>
      </header>

      {/* Shared Page Navigation Tabs */}
      <div className="mgmt-tabs-nav">
        <Link to="/teams" className="mgmt-tab-btn active">
          Team Directory
        </Link>
        <Link to="/teams/create" className="mgmt-tab-btn">
          Create Team
        </Link>
      </div>

      {/* Page Subtabs (List vs Stats) */}
      <div className="mgmt-subtabs-nav">
        <button
          type="button"
          className={`mgmt-subtab-btn${activeSubtab === "list" ? " active" : ""}`}
          onClick={() => setActiveSubtab("list")}
        >
          All Teams ({filtered.length})
        </button>
        <button
          type="button"
          className={`mgmt-subtab-btn${activeSubtab === "stats" ? " active" : ""}`}
          onClick={() => setActiveSubtab("stats")}
        >
          Stats & Analytics
        </button>
      </div>

      {/* Tab panel 1: Team Directory List */}
      {activeSubtab === "list" && (
        <div className="mgmt-tab-panel">
          {/* Filters */}
          <div className="mgmt-filter-bar">
            <input
              type="search"
              placeholder="Search by team name, coach, city, or team ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <CustomSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Status" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Draft", label: "Draft" }
              ]}
              className="mgmt-filter-select"
            />
            <CustomSelect
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Divisions" },
                { value: "Premier", label: "Premier" },
                { value: "Division 1", label: "Division 1" },
                { value: "Division 2", label: "Division 2" }
              ]}
              className="mgmt-filter-select"
            />
          </div>

          {/* Table */}
          <div className="mgmt-table-wrap">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Team ID</th>
                  <th>Team Name</th>
                  <th>Coach</th>
                  <th>Club</th>
                  <th>Tournament ID</th>
                  <th>Division</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length > 0 ? (
                  pageItems.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <Link to={`/teams/${team.id}`} className="mgmt-table-link">
                          TM-{team.id}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/teams/${team.id}`} className="mgmt-table-link" style={{ fontWeight: "bold" }}>
                          {team.name}
                        </Link>
                      </td>
                      <td>{team.coach}</td>
                      <td>{team.city}</td>
                      <td>
                        <Link to={`/tournaments/${team.tournament_id}`} className="mgmt-table-link" style={{ color: "var(--secondary, #3b82f6)" }}>
                          TN-{team.tournament_id}
                        </Link>
                      </td>
                      <td>{team.division}</td>
                      <td>
                        <span className={statusClass[team.status]}>{team.status}</span>
                      </td>
                      <td>
                        <div className="mgmt-table-actions">
                          <Link
                            to={`/teams/${team.id}`}
                            className="mgmt-icon-btn"
                            title="View Details"
                          >
                            <ViewIcon />
                          </Link>
                          <Link
                            to={`/teams/${team.id}/edit`}
                            className="mgmt-icon-btn"
                            title="Edit"
                          >
                            <EditIcon />
                          </Link>
                          <button
                            type="button"
                            className="mgmt-icon-btn mgmt-icon-btn--danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(team)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      No teams match your search or filter settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="mgmt-pagination">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} teams
                </span>
                <div className="mgmt-pagination-controls">
                  <button
                    type="button"
                    className="mgmt-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`mgmt-page-btn${n === currentPage ? " active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="mgmt-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab panel 2: Stats & Analytics */}
      {activeSubtab === "stats" && (
        <div className="mgmt-tab-panel">
          {/* Summary Cards */}
          <div className="mgmt-stats-row">
            {[
              { label: "Total Teams", value: teams.length },
              { label: "Active", value: teams.filter((t) => t.status === "Active").length },
              { label: "Inactive", value: teams.filter((t) => t.status === "Inactive").length },
              { label: "Draft", value: teams.filter((t) => t.status === "Draft").length },
            ].map((stat) => (
              <div key={stat.label} className="mgmt-stat-card">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          {/* Visual Breakdowns */}
          <div className="mgmt-form-grid">
            <div className="mgmt-card">
              <h2 className="mgmt-card-title">Division Distribution</h2>
              <div className="mgmt-stat-list-card">
                <div className="mgmt-stat-item">
                  <div className="mgmt-stat-item-info">
                    <span className="mgmt-stat-item-label">Premier Division</span>
                    <span className="mgmt-stat-item-count">{divisionCounts.Premier} teams</span>
                  </div>
                  <div className="mgmt-progress-bar-bg">
                    <div
                      className="mgmt-progress-bar-fill"
                      style={{ width: `${totalListTeams === 0 ? 0 : (divisionCounts.Premier / totalListTeams) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mgmt-stat-item">
                  <div className="mgmt-stat-item-info">
                    <span className="mgmt-stat-item-label">Division 1</span>
                    <span className="mgmt-stat-item-count">{divisionCounts["Division 1"]} teams</span>
                  </div>
                  <div className="mgmt-progress-bar-bg">
                    <div
                      className="mgmt-progress-bar-fill mgmt-progress-bar-fill--blue"
                      style={{ width: `${totalListTeams === 0 ? 0 : (divisionCounts["Division 1"] / totalListTeams) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mgmt-stat-item">
                  <div className="mgmt-stat-item-info">
                    <span className="mgmt-stat-item-label">Division 2</span>
                    <span className="mgmt-stat-item-count">{divisionCounts["Division 2"]} teams</span>
                  </div>
                  <div className="mgmt-progress-bar-bg">
                    <div
                      className="mgmt-progress-bar-fill mgmt-progress-bar-fill--purple"
                      style={{ width: `${totalListTeams === 0 ? 0 : (divisionCounts["Division 2"] / totalListTeams) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mgmt-card">
              <h2 className="mgmt-card-title">Roster Ratios & Visibility</h2>
              <div className="mgmt-stat-list-card">
                <div className="mgmt-stat-item">
                  <div className="mgmt-stat-item-info">
                    <span className="mgmt-stat-item-label">Active Roster Teams</span>
                    <span className="mgmt-stat-item-count">60%</span>
                  </div>
                  <div className="mgmt-progress-bar-bg">
                    <div className="mgmt-progress-bar-fill mgmt-progress-bar-fill--teal" style={{ width: "60%" }} />
                  </div>
                </div>

                <div className="mgmt-stat-item">
                  <div className="mgmt-stat-item-info">
                    <span className="mgmt-stat-item-label">Publicly Visible</span>
                    <span className="mgmt-stat-item-count">80%</span>
                  </div>
                  <div className="mgmt-progress-bar-bg">
                    <div className="mgmt-progress-bar-fill" style={{ width: "80%" }} />
                  </div>
                </div>

                <div className="mgmt-stat-item">
                  <div className="mgmt-stat-item-info">
                    <span className="mgmt-stat-item-label">Notification Enabled</span>
                    <span className="mgmt-stat-item-count">100%</span>
                  </div>
                  <div className="mgmt-progress-bar-bg">
                    <div className="mgmt-progress-bar-fill mgmt-progress-bar-fill--blue" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Team"
        description="Are you sure you want to delete this team? This action cannot be undone and will remove all associated roster data."
        itemName={deleteTarget?.name || ""}
        confirmLabel="Delete Team"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}