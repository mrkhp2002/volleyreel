import { Link, useParams } from "react-router-dom";
import CreateTeamPage from "./CreateTeamPage";
import { getTeamByRouteId } from "./teamsData";
import "../../styles/management.css";

export default function EditTeamPage() {
  const { teamId } = useParams();
  const team = getTeamByRouteId(teamId);

  if (!team) {
    return (
      <div className="management-page">
        <Link to="/teams" className="mgmt-back-link">
          ← Back to Teams
        </Link>
        <h1>Team not found</h1>
      </div>
    );
  }

  return <CreateTeamPage mode="edit" initialTeam={team} />;
}
