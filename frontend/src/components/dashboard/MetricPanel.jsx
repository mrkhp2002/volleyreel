export default function MetricPanel({ title, rows }) {
  return (
    <section className="dash-panel dash-panel--metric">
      <h2 className="dash-metric-title">{title}</h2>
      <ul className="dash-metric-list">
        {rows.map((row) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <strong className={row.tone ? `dash-metric-value--${row.tone}` : ""}>
              {row.value}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
