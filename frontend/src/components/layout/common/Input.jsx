import "./common.css";

export default function Input({
  label,
  id,
  type = "text",
  error = "",
  className = "",
  ...props
}) {
  return (
    <div className={`input-group ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className="input-field"
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}
