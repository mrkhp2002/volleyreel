import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import CreateTeamPage from "./CreateTeamPage";
import API from "../../services/apiClient";
import "../../styles/management.css";

export default function EditTeamPage() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Database eken data Team ekata genawa
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await API.get(`/teams/${teamId}`);
        const t = response.data;

        // Backend eke data CreateTeamPage eke form ekata galapanawa
        setTeam({
          id: String(t.team_id),
          name: t.name,
          tournament_id: t.tournament_id,
          coach: t.coach || "",
          clubName: t.club_name || "",
          city: t.city || "",
          division: t.division || "",
          category: t.category || "",
          description: t.description || "",
          homeVenue: t.home_venue || "",
          foundedYear: t.founded_year || "",
          rosterLimit: String(t.roster_limit || "15"),
          status: t.status || "Active",
          notes: t.notes || ""
        });
      } catch (error) {
        console.error("Error fetching team for edit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <div className="management-page" style={{ padding: "40px", color: "white", textAlign: "center" }}>
        Loading team data...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="management-page" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div className="mgmt-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>Team Not Found</h2>
          <Link to="/teams" className="mgmt-btn mgmt-btn--primary">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }


  return <CreateTeamPage mode="edit" initialTeam={team} />;
}