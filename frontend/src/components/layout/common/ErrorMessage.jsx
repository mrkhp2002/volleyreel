import "./common.css";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-alert">
      <div className="error-alert-icon">⚠️</div>
      <div className="error-alert-content">
        <h4 className="error-alert-title">System Error</h4>
        <p className="error-alert-message">{message || "An unexpected error occurred."}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="error-alert-retry-btn">
          Retry
        </button>
      )}
    </div>
  );
}