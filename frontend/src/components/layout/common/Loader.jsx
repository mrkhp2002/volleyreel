import "./common.css";

export default function Loader({ fullPage = false }) {
  return (
    <div className={`loader-wrapper ${fullPage ? "loader-fullpage" : ""}`}>
      <div className="premium-spinner"></div>
      <p className="loader-text">Loading VolleyReel...</p>
    </div>
  );
}