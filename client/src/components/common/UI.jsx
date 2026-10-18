export function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'spinner-sm', md: 'spinner', lg: 'spinner' };
  return (
    <div className="loading-overlay" style={{ flexDirection: 'column', gap: 16 }}>
      <div className={sizes[size]} style={size === 'lg' ? { width: 60, height: 60, borderWidth: 4 } : {}} />
      {text && <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{text}</p>}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-text">{description}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    PENDING: 'badge-warning', CONFIRMED: 'badge-success', COMPLETED: 'badge-primary',
    CANCELLED: 'badge-error', REJECTED: 'badge-error', IN_PROGRESS: 'badge-secondary',
    NO_SHOW: 'badge-neutral', RESCHEDULED: 'badge-info', RESCHEDULE_REQUESTED: 'badge-warning',
    VERIFIED: 'badge-success', UNDER_REVIEW: 'badge-warning', PAID: 'badge-success',
    UNPAID: 'badge-error', REFUNDED: 'badge-info', SUCCESS: 'badge-success',
    FAILED: 'badge-error', ACTIVE: 'badge-success', EXPIRED: 'badge-error',
    BOOKED: 'badge-primary', REPORT_RELEASED: 'badge-success', PROCESSING: 'badge-secondary',
    DELIVERED: 'badge-success', DISPATCHED: 'badge-secondary', PREPARING: 'badge-warning',
    ONLINE: 'badge-success', IN_PERSON: 'badge-primary',
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status?.replace(/_/g, ' ')}</span>;
}

export function Modal({ isOpen, onClose, title, children, size = '' }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${size ? `modal-${size}` : ''} slide-up`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>{message}</p>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? '...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}

export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: Math.min(pages, 5) }, (_, i) => {
    if (pages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= pages - 2) return pages - 4 + i;
    return page - 2 + i;
  });
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>←</button>
      {nums.map((n) => (
        <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => onPageChange(n)}>{n}</button>
      ))}
      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages}>→</button>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '80%' }} />
    </div>
  );
}

export function AIDisclaimer({ text = 'AI-generated content for informational purposes only. Always review with a qualified healthcare professional before acting on any AI suggestion.' }) {
  return (
    <div className="ai-disclaimer">
      <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
      <p>{text}</p>
    </div>
  );
}
