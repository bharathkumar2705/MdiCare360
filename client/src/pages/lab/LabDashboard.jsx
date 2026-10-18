import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LabDashboard() {
  const [orders, setOrders] = useState([
    { id: 'LAB-2026-081', patientName: 'Rahul Agarwal', testName: 'Lipid Profile & HbA1c', sampleType: 'Blood', status: 'SAMPLE_COLLECTED', date: '2026-10-14', priority: 'NORMAL' },
    { id: 'LAB-2026-082', patientName: 'Mohit Kumar', testName: 'Complete Blood Count (CBC)', sampleType: 'Blood', status: 'PENDING_COLLECTION', date: '2026-10-14', priority: 'URGENT' },
    { id: 'LAB-2026-080', patientName: 'Priyanka Desai', testName: 'Thyroid Stimulating Hormone (TSH)', sampleType: 'Serum', status: 'COMPLETED', date: '2026-10-13', priority: 'NORMAL' },
  ]);

  const handleUpdateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    toast.success(`Lab order ${id} marked as ${newStatus.replace('_', ' ')}`);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Diagnostic Laboratory Operations
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Manage sample collection requests, report generation, and biomarker validation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#F0FDF4', color: '#166534', padding: '8px 16px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
            ✅ NABL Accredited Lab Partner
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 13, color: '#64748B' }}>Samples Pending Collection</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>4</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 13, color: '#64748B' }}>Under Lab Processing</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0284C7', marginTop: 4 }}>6</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 13, color: '#64748B' }}>Verified Reports Released (Today)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', marginTop: 4 }}>18</div>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
          Active Diagnostic Orders
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '14px 20px' }}>Order ID</th>
                <th style={{ padding: '14px 20px' }}>Patient</th>
                <th style={{ padding: '14px 20px' }}>Test Requested</th>
                <th style={{ padding: '14px 20px' }}>Sample</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0284C7' }}>
                    {o.id}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#0F172A' }}>
                    {o.patientName}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#334155' }}>
                    {o.testName}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748B' }}>
                    {o.sampleType}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        background:
                          o.status === 'COMPLETED' ? '#DEF7EC' : o.status === 'SAMPLE_COLLECTED' ? '#E0F2FE' : '#FEF3C7',
                        color:
                          o.status === 'COMPLETED' ? '#03543F' : o.status === 'SAMPLE_COLLECTED' ? '#0369A1' : '#92400E',
                      }}
                    >
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    {o.status === 'PENDING_COLLECTION' ? (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'SAMPLE_COLLECTED')}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        ✓ Mark Collected
                      </button>
                    ) : o.status === 'SAMPLE_COLLECTED' ? (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'COMPLETED')}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: 12 }}
                      >
                        📤 Upload & Release Report
                      </button>
                    ) : (
                      <span style={{ color: '#16A34A', fontSize: 13, fontWeight: 600 }}>Report Released</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
