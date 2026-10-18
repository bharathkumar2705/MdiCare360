import { useState, useEffect } from 'react';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({ action: actionFilter, page, limit: 30 });
      setLogs(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, page]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Security & Compliance Audit Trail
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            HIPAA and clinical governance immutable activity logs tracking all critical platform actions.
          </p>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="form-input"
          style={{ width: 220, padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
        >
          <option value="">All Actions</option>
          <option value="LOGIN">User Login</option>
          <option value="REGISTER">Registration</option>
          <option value="DOCTOR_VERIFY">Doctor Verification</option>
          <option value="APPOINTMENT_CREATE">Appointments</option>
          <option value="PRESCRIPTION_CREATE">Prescriptions</option>
          <option value="PASSWORD_RESET">Password Resets</option>
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <div className="spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748B' }}>
            No audit records found matching the filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '14px 18px' }}>Timestamp</th>
                  <th style={{ padding: '14px 18px' }}>Action</th>
                  <th style={{ padding: '14px 18px' }}>Actor</th>
                  <th style={{ padding: '14px 18px' }}>Resource</th>
                  <th style={{ padding: '14px 18px' }}>Description</th>
                  <th style={{ padding: '14px 18px' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          background: log.outcome === 'FAILURE' ? '#FEE2E2' : '#F1F5F9',
                          color: log.outcome === 'FAILURE' ? '#DC2626' : '#0F172A',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 11,
                          fontFamily: 'monospace',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{log.userId?.name || 'System / Unauth'}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{log.userId?.email || log.userRole || '-'}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 500 }}>
                      {log.resource || '-'}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      {log.description}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748B', fontFamily: 'monospace', fontSize: 12 }}>
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#64748B' }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}