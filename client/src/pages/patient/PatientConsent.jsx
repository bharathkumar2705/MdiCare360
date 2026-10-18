import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { patientService, doctorService } from '../../services';
import { LoadingSpinner } from '../../components/common/UI';
import { format } from 'date-fns';

export default function PatientConsent() {
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [durationDays, setDurationDays] = useState(30);

  useEffect(() => {
    fetchConsentData();
  }, []);

  const fetchConsentData = async () => {
    try {
      setLoading(true);
      const [consentRes, doctorRes] = await Promise.all([
        patientService.getConsents(),
        doctorService.search({ limit: 12 }),
      ]);
      setConsents(consentRes.data.data || []);
      const docList = doctorRes.data.data?.doctors || doctorRes.data.data || [];
      setDoctors(docList);
      if (docList.length > 0) {
        setSelectedDoctorId(docList[0].userId?._id || docList[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load consent artifacts.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }
    try {
      await patientService.grantConsent({
        grantedToId: selectedDoctorId,
        grantedToModel: 'DOCTOR',
        durationDays,
      });
      toast.success('Consent granted successfully in MongoDB!');
      setShowGrantModal(false);
      await fetchConsentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grant consent.');
    }
  };

  const handleRevokeConsent = async (id) => {
    try {
      await patientService.revokeConsent(id);
      toast.success('Consent revoked! The healthcare provider can no longer view your health records.');
      await fetchConsentData();
    } catch (err) {
      toast.error('Failed to revoke consent.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading ABDM consent artifacts..." />;

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Health Data Consent & Privacy (ABDM)</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            Control which verified doctors and healthcare providers can access your medical records and prescriptions.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowGrantModal(true)}>
          + Grant Access to Doctor
        </button>
      </div>

      {/* ABDM Info Banner */}
      <div style={{ padding: 18, background: '#eff6ff', borderRadius: 14, border: '1px solid #bfdbfe', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 32 }}>🛡️</div>
        <div>
          <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 15 }}>Ayushman Bharat Digital Mission (ABDM) Compliant</div>
          <div style={{ fontSize: 13, color: '#1e40af', marginTop: 2 }}>
            You maintain 100% granular ownership over your electronic health records. Consents are stored in the database, time-bound, and can be revoked at any second.
          </div>
        </div>
      </div>

      {/* Consents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {consents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
            <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No active consent artifacts</h4>
            <p style={{ margin: '0 0 16px', fontSize: 13 }}>
              Your health records are completely private. Grant temporary access to your consulting doctors when needed.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowGrantModal(true)}>
              + Grant Access to a Doctor
            </button>
          </div>
        ) : (
          consents.map((c) => (
            <div key={c._id} className="card" style={{ padding: 22, opacity: !c.isActive ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                      {c.grantedToId?.name || 'Verified Healthcare Provider'}
                    </h3>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      background: c.isActive ? '#f0fdf4' : '#fef2f2',
                      color: c.isActive ? '#166534' : '#991b1b',
                    }}>
                      ● {c.isActive ? 'ACTIVE' : 'REVOKED'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>
                    Role: {c.grantedToModel} • Contact: {c.grantedToId?.email || 'Doctor on Platform'}
                  </div>
                </div>

                {c.isActive && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleRevokeConsent(c._id)}
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    🚫 Revoke Access
                  </button>
                )}
              </div>

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginRight: 4 }}>Permissions:</span>
                  {Object.entries(c.permissions || {})
                    .filter(([_, v]) => v)
                    .map(([k]) => (
                      <span key={k} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
                        ✓ {k}
                      </span>
                    ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Expires: <strong>{c.expiresAt ? format(new Date(c.expiresAt), 'MMM d, yyyy') : '30 days'}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Grant Modal */}
      {showGrantModal && (
        <div className="modal-overlay">
          <div className="modal slide-up" style={{ maxWidth: 480, width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Authorize Healthcare Provider</h3>
              <button className="modal-close" onClick={() => setShowGrantModal(false)}>✕</button>
            </div>
            <form onSubmit={handleGrantConsent}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>CHOOSE DOCTOR</label>
                <select
                  className="input"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  style={{ width: '100%' }}
                  required
                >
                  {doctors.map((d) => (
                    <option key={d._id} value={d.userId?._id || d.userId || d._id}>
                      {d.userId?.name || d.name || 'Doctor'} - {d.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>ACCESS VALIDITY</label>
                <select
                  className="input"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  style={{ width: '100%' }}
                >
                  <option value={7}>7 Days (Single Consultation)</option>
                  <option value={30}>30 Days (Ongoing Treatment)</option>
                  <option value={90}>90 Days (Chronic Disease Care)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowGrantModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Consent in Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
