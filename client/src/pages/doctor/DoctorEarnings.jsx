import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DoctorEarnings() {
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payouts, setPayouts] = useState([
    {
      id: 'TXN-904128',
      date: '17 Oct 2026',
      patientName: 'Rajesh Sharma',
      type: 'Online Telemedicine (Video)',
      method: 'Razorpay UPI (GPay)',
      gross: 600,
      fee: 0,
      net: 600,
      status: 'Settled to Bank',
      statusColor: '#16A34A',
      bankRef: 'HDFC-IMPS-829104',
    },
    {
      id: 'TXN-903874',
      date: '16 Oct 2026',
      patientName: 'Ananya Reddy',
      type: 'In-Clinic OPD Consultation',
      method: 'Pay at Clinic (Cash)',
      gross: 750,
      fee: 0,
      net: 750,
      status: 'Direct Clinic Receipt',
      statusColor: '#0284C7',
      bankRef: 'CASH-REC-019',
    },
    {
      id: 'TXN-902910',
      date: '14 Oct 2026',
      patientName: 'Vikram Patel',
      type: 'Online Telemedicine (Video)',
      method: 'Razorpay NetBanking (SBI)',
      gross: 600,
      fee: 0,
      net: 600,
      status: 'Settled to Bank',
      statusColor: '#16A34A',
      bankRef: 'HDFC-IMPS-774021',
    },
    {
      id: 'TXN-901844',
      date: '12 Oct 2026',
      patientName: 'Sumanth Roy',
      type: 'Online Telemedicine (Video)',
      method: 'Razorpay Card (Visa)',
      gross: 600,
      fee: 0,
      net: 600,
      status: 'Settled to Bank',
      statusColor: '#16A34A',
      bankRef: 'HDFC-IMPS-662910',
    },
  ]);

  const totalEarnings = payouts.reduce((sum, p) => sum + p.net, 0);
  const totalSettled = payouts.filter(p => p.status.includes('Settled')).reduce((sum, p) => sum + p.net, 0);
  const pendingSettlement = 1200; // Recent consultation queue

  const handleInstantPayout = () => {
    setPayoutLoading(true);
    setTimeout(() => {
      setPayoutLoading(false);
      toast.success('Instant settlement initiated! ₹1,200 transferred to your linked HDFC Bank account via IMPS.');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Doctor Earnings & Financial Settlement
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Real-time reconciliation of online Razorpay telemedicine payments and in-clinic consultation receipts.
          </p>
        </div>
        <button
          onClick={handleInstantPayout}
          disabled={payoutLoading}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>⚡</span>
          <span>{payoutLoading ? 'Processing Settlement...' : 'Request Instant Payout'}</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Total Gross Revenue</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginTop: 6 }}>₹{(totalEarnings + pendingSettlement).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#16A34A', marginTop: 4, fontWeight: 600 }}>↑ 18.4% from last month</div>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Settled to Bank Account</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#16A34A', marginTop: 6 }}>₹{totalSettled.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Deposited in HDFC •••• 4521</div>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Pending Razorpay Settlement</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0284C7', marginTop: 6 }}>₹{pendingSettlement.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#0284C7', marginTop: 4, fontWeight: 600 }}>Auto-settles in T+1 days</div>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Platform Commission</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#8B5CF6', marginTop: 6 }}>0% (Free)</div>
          <div style={{ fontSize: 12, color: '#8B5CF6', marginTop: 4, fontWeight: 600 }}>Zero platform fees for society doctors</div>
        </div>
      </div>

      {/* Linked Bank Card */}
      <div style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A8A 100%)', color: 'white', padding: 24, borderRadius: 20, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93C5FD', fontWeight: 700 }}>
            Official Settlement Bank Account
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>HDFC Bank Ltd. (Koramangala Branch)</div>
          <div style={{ fontSize: 14, color: '#CBD5E1', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>Account: •••••••• 4521</span>
            <span>IFSC: HDFC0000240</span>
            <span>UPI ID: bharathkumarreddynaru@okhdfcbank</span>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 18px', borderRadius: 12, fontSize: 13, border: '1px solid rgba(255,255,255,0.2)' }}>
          ✅ KYC Verified & Active
        </div>
      </div>

      {/* Transaction History Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
          Consultation Payout Ledger
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600 }}>Txn ID & Date</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600 }}>Patient & Consultation</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600 }}>Payment Method</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600 }}>Gross Fee</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600 }}>Net Disbursed</th>
                <th style={{ padding: '12px 18px', color: '#475569', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.id}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{p.date}</div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.patientName}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{p.type}</div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{p.method}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.bankRef}</div>
                  </td>
                  <td style={{ padding: '16px 18px', fontWeight: 600, color: '#0F172A' }}>
                    ₹{p.gross}
                  </td>
                  <td style={{ padding: '16px 18px', fontWeight: 700, color: '#16A34A', fontSize: 14 }}>
                    ₹{p.net}
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        background: p.statusColor === '#16A34A' ? '#DEF7EC' : '#E0F2FE',
                        color: p.statusColor === '#16A34A' ? '#03543F' : '#0369A1',
                      }}
                    >
                      {p.status}
                    </span>
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
