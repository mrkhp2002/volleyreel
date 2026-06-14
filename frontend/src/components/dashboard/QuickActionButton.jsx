import { Link } from "react-router-dom";

export default function QuickActionButton({ to, title, subtitle, icon, tone = "blue" }) {
  const className = `dash-quick-action dash-quick-action--${tone}`;

  if (to) {
    return (
      <Link to={to} className={className}>
        <span className="dash-quick-action-icon">{icon}</span>
        <span className="dash-quick-action-title">{title}</span>
        <span className="dash-quick-action-subtitle">{subtitle}</span>
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      <span className="dash-quick-action-icon">{icon}</span>
      <span className="dash-quick-action-title">{title}</span>
      <span className="dash-quick-action-subtitle">{subtitle}</span>
    </button>
  );
}
