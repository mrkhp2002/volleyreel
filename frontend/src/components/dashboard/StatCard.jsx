export default function StatCard({ label, value, trend, trendDirection = "up", icon, iconTone = "blue" }) {
  return (
    <article className="dash-stat-card">
      <div className="dash-stat-copy">
        <p className="dash-stat-label">{label}</p>
        <p className="dash-stat-value">{value}</p>
        <p className={`dash-stat-trend dash-stat-trend--${trendDirection}`}>{trend}</p>
      </div>
      <div className={`dash-stat-icon dash-stat-icon--${iconTone}`}>{icon}</div>
    </article>
  );
}
