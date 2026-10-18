import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { patientService } from '../../services';
import { LoadingSpinner } from '../../components/common/UI';
import { format } from 'date-fns';

export default function PatientInsurance() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    provider: 'Star Health & Allied Insurance',
    policyNumber: '',
    holderName: '',
    coverageType: 'Family Comprehensive Health Plan',
    coverageAmount: 1000000,
    validUntil: '2027-12-31',
  });

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      const res = await patientService.getInsurance();
      setPolicies(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load insurance coverage.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    if (!policyForm.policyNumber) {
      toast.error('Policy number is required');
      return;
    }
    try {
      await patientService.saveInsurance(policyForm);
      toast.success('Real insurance policy saved to database!');
      setShowAddModal(false);
      setPolicyForm({
        provider: 'Star Health & Allied Insurance',
        policyNumber: '',
        holderName: '',
        coverageType: 'Family Comprehensive Health Plan',
        coverageAmount: 1000000,
        validUntil: '2027-12-31',
      });
      await fetchInsuranceData();
    } catch (err) {
      toast.error('Failed to save insurance policy.');
    }
  };

  if (loading) return <LoadingSpinner text="Fetching verified insurance policies..." />;

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Health Insurance & Cashless Desk</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            Direct TPA integration, cashless claim pre-authorizations, and coverage tracking.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          + Add Insurance Policy
        </button>
      </div>

      {/* Real Policies */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {policies.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🛡️</div>
            <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No health insurance policies linked</h4>
            <p style={{ margin: '0 0 16px', fontSize: 13 }}>
              Link your health insurance card for cashless hospitalization and doctor consultation claims.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              + Link Your Policy
            </button>
          </div>
        ) : (
          policies.map((pol) => (
            <div key={pol._id} className="card" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #003380 100%)', color: 'white', padding: 28, borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: '#10b981', color: 'white', textTransform: 'uppercase' }}>
                    ● {pol.status}
                  </span>
                  <h2 style={{ fontSize: 24, fontWeight: 900, margin: '10px 0 4px', color: 'white' }}>{pol.provider}</h2>
                  <div style={{ fontSize: 14, color: '#93c5fd' }}>{pol.coverageType}</div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                    Policy No: <strong>{pol.policyNumber}</strong> • Holder: {pol.holderName}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>MAXIMUM COVER</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#34d399' }}>
                    ₹{(pol.coverageAmount || 1000000).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 12, color: '#bfdbfe' }}>Cashless Pre-Auth Enabled</div>
                </div>
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600 }}>VALIDITY</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                    Valid until {pol.validUntil ? format(new Date(pol.validUntil), 'MMMM d, yyyy') : 'Dec 2027'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600 }}>CASHLESS NETWORK</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>14,000+ Hospitals across India</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 600 }}>COPAY & DEDUCTIBLE</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>Zero Copay on Network Hospitals</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal slide-up" style={{ maxWidth: 500, width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Link Health Insurance Policy</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddPolicy}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>INSURANCE COMPANY</label>
                <select
                  className="input"
                  value={policyForm.provider}
                  onChange={(e) => setPolicyForm({ ...policyForm, provider: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Star Health & Allied Insurance">Star Health & Allied Insurance</option>
                  <option value="HDFC ERGO General Insurance">HDFC ERGO General Insurance</option>
                  <option value="Care Health Insurance">Care Health Insurance</option>
                  <option value="Niva Bupa Health Insurance">Niva Bupa Health Insurance</option>
                  <option value="ICICI Lombard">ICICI Lombard</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>POLICY NUMBER</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. SH-2026-99120"
                  value={policyForm.policyNumber}
                  onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>SUM INSURED (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={policyForm.coverageAmount}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverageAmount: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>VALIDITY DATE</label>
                  <input
                    type="date"
                    className="input"
                    value={policyForm.validUntil}
                    onChange={(e) => setPolicyForm({ ...policyForm, validUntil: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
