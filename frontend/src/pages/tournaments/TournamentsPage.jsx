import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { EditIcon, PlusIcon, TrashIcon, ViewIcon } from "../../components/common/TableActionIcons";
import { initialTournaments } from "./tournamentsData";
import "../../styles/management.css";


import API from "../../services/apiClient";

const statusClass = {
  Ongoing: "mgmt-badge mgmt-badge--ongoing",
  Upcoming: "mgmt-badge mgmt-badge--upcoming",
  Completed: "mgmt-badge mgmt-badge--completed"
};

// Helper to format date string to "MMM DD, YYYY"
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function TournamentsPage() {
  /*
  const [tournaments, setTournaments] = useState(() => {
    const saved = localStorage.getItem("volleyreel_tournaments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialTournaments;
  });

  // Sync to local storage when state changes
  useEffect(() => {
    localStorage.setItem("volleyreel_tournaments", JSON.stringify(tournaments));
  }, [tournaments]);
*/


  const [tournaments, setTournaments] = useState([]);
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await API.get("/tournaments/");

        const formattedData = response.data.map((t) => ({
          id: String(t.tournament_id),
          name: t.name,
          location: t.location,
          city: t.location,
          startDate: t.start_date || "",
          endDate: t.end_date || "",
          status: t.status || "Upcoming",
          teamsCount: 0,
        }));

        setTournaments(formattedData);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);






  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Dynamic lists of cities for city filter
  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(tournaments.map((t) => t.city).filter(Boolean)));
    return [
      { value: "", label: "All Locations" },
      ...cities.map((city) => ({ value: city, label: city }))
    ];
  }, [tournaments]);

  // Filter list
  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.location && t.location.toLowerCase().includes(q)) ||
        (t.city && t.city.toLowerCase().includes(q));
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const matchesCity = !cityFilter || t.city === cityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [tournaments, search, statusFilter, cityFilter]);

  // Pagination params
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: tournaments.length,
      ongoing: tournaments.filter((t) => t.status === "Ongoing").length,
      upcoming: tournaments.filter((t) => t.status === "Upcoming").length,
      completed: tournaments.filter((t) => t.status === "Completed").length
    };
  }, [tournaments]);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const updated = tournaments.filter((t) => t.id !== deleteTarget.id);
    setTournaments(updated);
    setDeleteTarget(null);
    setPage(1);
  };

  return (
    <div className="management-page">
      {/* Background ambient glows */}
      <div className="mgmt-glow mgmt-glow--primary" />
      <div className="mgmt-glow mgmt-glow--secondary" />

      {/* Main Header */}
      <header className="mgmt-header">
        <div>
          <h1>Tournament Management</h1>
          <p>Manage all volleyball tournaments in one place</p>
        </div>
        <Link to="/tournaments/create" className="mgmt-btn mgmt-btn--primary">
          <PlusIcon />
          Create Tournament
        </Link>
      </header>

      {/* Shared Page Navigation Tabs */}
      <div className="mgmt-tabs-nav">
        <Link to="/tournaments" className="mgmt-tab-btn active">
          Tournament Directory
        </Link>
        <Link to="/tournaments/create" className="mgmt-tab-btn">
          Create Tournament
        </Link>
      </div>

      {/* Stats row */}
      <div className="mgmt-stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "20px" }}>
        <div className="mgmt-stat-card">
          <span>Total Tournaments</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Ongoing</span>
          <strong>{stats.ongoing}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Upcoming</span>
          <strong>{stats.upcoming}</strong>
        </div>
        <div className="mgmt-stat-card">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mgmt-filter-bar">
        <input
          type="search"
          placeholder="Search by tournament name, location, or tournament ID..."
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
            { value: "Ongoing", label: "Ongoing" },
            { value: "Upcoming", label: "Upcoming" },
            { value: "Completed", label: "Completed" }
          ]}
          className="mgmt-filter-select"
        />
        <CustomSelect
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            setPage(1);
          }}
          options={cityOptions}
          className="mgmt-filter-select"
        />
      </div>

      {/* Table grid */}
      <div className="mgmt-table-wrap">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Tournament ID</th>
              <th>Tournament Name</th>
              <th>Location</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Teams</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length > 0 ? (
              pageItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/tournaments/${item.id}`} className="mgmt-table-link">
                      {item.id}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/tournaments/${item.id}`} className="mgmt-table-link" style={{ fontWeight: 700 }}>
                      {item.name}
                    </Link>
                  </td>
                  <td>{item.city || "Various"}</td>
                  <td>{formatDate(item.startDate)}</td>
                  <td>{formatDate(item.endDate)}</td>
                  <td>{item.teamsCount || item.teamLimit}</td>
                  <td>
                    <span className={statusClass[item.status] || "mgmt-badge"}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mgmt-table-actions">
                      <Link
                        to={`/tournaments/${item.id}`}
                        className="mgmt-icon-btn"
                        title="View Details"
                      >
                        <ViewIcon />
                      </Link>
                      <Link
                        to={`/tournaments/${item.id}/edit`}
                        className="mgmt-icon-btn"
                        title="Edit"
                      >
                        <EditIcon />
                      </Link>
                      <button
                        type="button"
                        className="mgmt-icon-btn mgmt-icon-btn--danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(item)}
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
                  No tournaments match your search or filter settings.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination bar */}
        {filtered.length > 0 && (
          <div className="mgmt-pagination">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} tournaments
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

      {/* Delete Confirmation popup overlay */}
      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Tournament Profile"
        description="Are you sure you want to permanently delete this tournament profile? All associated logs and schedules will be lost."
        itemName={deleteTarget?.name || ""}
        confirmLabel="Delete Tournament"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
