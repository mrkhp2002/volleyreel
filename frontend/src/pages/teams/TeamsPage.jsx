import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { EditIcon, PlusIcon, TrashIcon, ViewIcon } from "../../components/common/TableActionIcons";
import { teamSummaryStats, teamsList } from "./teamsData";
import "../../styles/management.css";

const statusClass = {
  Active: "mgmt-badge mgmt-badge--active",
  Inactive: "mgmt-badge mgmt-badge--inactive",
  Draft: "mgmt-badge mgmt-badge--upcoming",
};

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return teamsList.filter((team) => {
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
  }, [search, statusFilter, divisionFilter]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="management-page">
      <header className="mgmt-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage all volleyball teams in one place</p>
        </div>
        <Link to="/teams/create" className="mgmt-btn mgmt-btn--primary">
          <PlusIcon />
          Create Team
        </Link>
      </header>

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
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={divisionFilter}
          onChange={(e) => {
            setDivisionFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Divisions</option>
          <option value="Premier">Premier</option>
          <option value="Division 1">Division 1</option>
          <option value="Division 2">Division 2</option>
        </select>
      </div>

      <div className="mgmt-stats-row">
        {teamSummaryStats.map((stat) => (
          <div key={stat.label} className="mgmt-stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="mgmt-table-wrap">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Team ID</th>
              <th>Team Name</th>
              <th>Coach</th>
              <th>City</th>
              <th>Players</th>
              <th>Division</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((team) => (
              <tr key={team.id}>
                <td>
                  <Link to={`/teams/${team.id}`} className="mgmt-table-link">
                    {team.id}
                  </Link>
                </td>
                <td>
                  <strong>{team.name}</strong>
                </td>
                <td>{team.coach}</td>
                <td>{team.city}</td>
                <td>{team.players}</td>
                <td>{team.division}</td>
                <td>
                  <span className={statusClass[team.status]}>{team.status}</span>
                </td>
                <td>
                  <div className="mgmt-table-actions">
                    <Link
                      to={`/teams/${team.id}`}
                      className="mgmt-icon-btn"
                      title="View"
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
            ))}
          </tbody>
        </table>

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
      </div>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Team"
        description="Are you sure you want to delete this team? This action cannot be undone and will remove all associated roster data."
        itemName={deleteTarget?.name || ""}
        confirmLabel="Delete Team"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
      />
    </div>
  );
}
