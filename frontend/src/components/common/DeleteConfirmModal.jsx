function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function DeleteConfirmModal({
  open,
  title,
  description,
  itemName,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="mgmt-modal-overlay" role="dialog" aria-modal="true">
      <div className="mgmt-modal">
        <div className="mgmt-modal-header">
          <div className="mgmt-modal-icon">
            <WarningIcon />
          </div>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <input className="mgmt-modal-input" type="text" value={itemName} readOnly />
        <div className="mgmt-modal-actions">
          <button type="button" className="mgmt-btn mgmt-btn--outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="mgmt-btn mgmt-btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
