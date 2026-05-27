import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ value, onChange, options, placeholder, className, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`custom-select-container ${className || ""}`} ref={containerRef} id={id}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder || "Select..."}</span>
        <span className="custom-select-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "10px", height: "10px" }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      {isOpen && (
        <ul className="custom-select-options">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? "selected" : ""}`}
              onClick={() => {
                onChange({ target: { value: opt.value } });
                setIsOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
