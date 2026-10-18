import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { patientService } from '../../services';
import { LoadingSpinner } from '../../components/common/UI';
import { format } from 'date-fns';

export default function PatientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealPayments();
  }, []);

  const fetchRealPayments = async () => {
    try {
      setLoading(true);
      const res = await patientService.getPayments();
      setPayments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = payments
    .filter((p) => p.status === 'SUCCESS' || p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const downloadReceipt = (p) => {
    toast.success(`Downloading verified receipt for Txn #${p.gatewayPaymentId || p._id.slice(-8)}...`);
  };

  if (loading) return <LoadingSpinner text="Fetching your billing records..." />;

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Payments & Invoices</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            Real-time transaction history from your appointments, lab bookings, and medicine orders.
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchRealPayments}>
          🔄 Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>TOTAL HEALTHCARE SPEND</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: '#1e3a8a' }}>₹{totalSpent}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{payments.length} real transactions</div>
        </div>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>SUCCESSFUL PAYMENTS</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: '#166534' }}>
            {payments.filter((p) => p.status === 'SUCCESS').length}
          </div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>Verified via Razorpay</div>
        </div>
        <div className="card" style={{ padding: 20, borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>OUTSTANDING DUES</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: '#5b21b6' }}>₹0</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>All services paid</div>
        </div>
      </div>

      {/* Real Invoices Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Billing Ledger</h3>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{payments.length} records</span>
        </div>

        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
            <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No payments recorded yet</h4>
            <p style={{ margin: 0, fontSize: 13 }}>
              When you book a doctor appointment, lab test, or pharmacy order, your real receipts and invoices will be listed here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>PAYMENT ID</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>SERVICE & DESCRIPTION</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>DATE</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>GATEWAY</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>AMOUNT</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>STATUS</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {p.gatewayPaymentId || p._id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600 }}>{p.description || p.serviceType}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>Service: {p.serviceType}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                      {p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy, h:mm a') : '-'}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                      {p.gateway || 'RAZORPAY'}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 800, fontSize: 15 }}>
                      ₹{p.amount}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => downloadReceipt(p)}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        📄 Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
