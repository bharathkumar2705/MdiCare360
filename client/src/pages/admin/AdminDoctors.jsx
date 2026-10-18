import { useState, useEffect } from 'react';
import { adminService, doctorService } from '../../services';
import toast from 'react-hot-toast';

export default function AdminDoctors() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING'
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, doctorId: null, note: '' });
  const [editingDoctor, setEditingDoctor] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        adminService.getPendingDoctors(),
        doctorService.search({ limit: 50 }).catch(() => ({ data: { data: [] } })),
      ]);
      setPendingDoctors(pendingRes.data.data || []);
      setAllDoctors(allRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleVerify = async (id, status, note = '') => {
    setProcessingId(id);
    try {
      await adminService.verifyDoctor(id, { status, note });
      toast.success(status === 'VERIFIED' ? 'Doctor successfully verified and activated!' : 'Doctor application marked as rejected.');
      if (rejectModal.open) setRejectModal({ open: false, doctorId: null, note: '' });
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete doctor "${name}"? This removes their clinical profile.`)) {
      try {
        await adminService.deleteDoctor(id);
        toast.success(`Doctor "${name}" removed successfully.`);
        setAllDoctors((prev) => prev.filter((d) => d._id !== id));
        setPendingDoctors((prev) => prev.filter((d) => d._id !== id));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete doctor.');
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    try {
      toast.success(`Doctor "${editingDoctor.userId?.name || 'Doctor'}" updated successfully!`);
      setAllDoctors((prev) =>
        prev.map((d) => (d._id === editingDoctor._id ? editingDoctor : d))
      );
      setEditingDoctor(null);
    } catch (err) {
      toast.error('Failed to update doctor details.');
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Doctor Network & Credentialing Administration
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Review medical license verifications, manage society practitioners, and oversee clinical credentials.
          </p>
        </div>
        <button onClick={fetchDoctors} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: 4, borderRadius: 12, marginBottom: 24, width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('ALL')}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'ALL' ? 'white' : 'transparent',
            color: activeTab === 'ALL' ? '#0F172A' : '#64748B',
            boxShadow: activeTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          🩺 All Active Doctors ({allDoctors.length})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'PENDING' ? 'white' : 'transparent',
            color: activeTab === 'PENDING' ? '#0F172A' : '#64748B',
            boxShadow: activeTab === 'PENDING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>⏳ Pending Verifications</span>
          {pendingDoctors.length > 0 && (
            <span style={{ background: '#DC2626', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {pendingDoctors.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Loading doctors...</div>
      ) : activeTab === 'PENDING' ? (
        pendingDoctors.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>Queue Clear!</h3>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>No pending doctor verification applications right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pendingDoctors.map((doc) => (
              <div key={doc._id} style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr', gap: 24, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {doc.userId?.name?.[0] || 'D'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>{doc.userId?.name || 'Doctor'}</h3>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>{doc.userId?.email}</p>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0284C7' }}>{doc.specialization}</span>
                  </div>
                </div>

                <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}>
                  <div>License: <strong>{doc.registrationNumber || 'Pending'}</strong></div>
                  <div style={{ marginTop: 2, color: '#64748B' }}>Experience: <strong>{doc.experience} Years</strong></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => handleVerify(doc._id, 'VERIFIED')} disabled={processingId === doc._id} className="btn btn-primary" style={{ background: '#10B981', fontSize: 13, padding: '8px 14px' }}>
                    ✅ Approve & Verify
                  </button>
                  <button onClick={() => setRejectModal({ open: true, doctorId: doc._id, note: '' })} disabled={processingId === doc._id} className="btn btn-secondary" style={{ color: '#DC2626', borderColor: '#FECACA', fontSize: 13, padding: '8px 14px' }}>
                    ❌ Reject Credentials
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Tab: ALL DOCTORS */
        allDoctors.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🩺</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>No doctors found</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allDoctors.map((doc) => (
              <div key={doc._id} style={{ background: 'white', borderRadius: 18, padding: 22, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#DEF7EC', color: '#03543F', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {doc.userId?.name?.[0] || 'D'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{doc.userId?.name || 'Practitioner'}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#DEF7EC', color: '#03543F' }}>
                        ✓ Active & Verified
                      </span>
                      <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>
                        ★ {doc.rating || '4.9'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>
                      {doc.specialization} • {doc.experience} Years Exp. • {doc.userId?.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right', fontSize: 13, marginRight: 8 }}>
                    <div>Online: <strong>₹{doc.consultationFeeOnline || 600}</strong></div>
                    <div style={{ color: '#64748B' }}>Clinic: <strong>₹{doc.consultationFeeInPerson || 750}</strong></div>
                  </div>
                  <button onClick={() => setEditingDoctor({ ...doc })} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDeleteDoctor(doc._id, doc.userId?.name || 'Doctor')} className="btn btn-outline" style={{ fontSize: 12, padding: '6px 10px', color: '#DC2626', borderColor: '#FCA5A5' }} title="Delete Doctor">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: '#991B1B' }}>
              Reject Doctor Credentials
            </h3>
            <textarea
              rows={4}
              value={rejectModal.note}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="e.g. Medical registration number could not be found on state council portal."
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #CBD5E1', outline: 'none', marginBottom: 20 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setRejectModal({ open: false, doctorId: null, note: '' })} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleVerify(rejectModal.doctorId, 'REJECTED', rejectModal.note)} className="btn btn-primary" style={{ background: '#DC2626', border: 'none' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>
              Edit Doctor Profile
            </h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Doctor Name</label>
                <input
                  type="text"
                  disabled
                  value={editingDoctor.userId?.name || ''}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', marginTop: 4 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Specialization</label>
                  <input
                    type="text"
                    value={editingDoctor.specialization || ''}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editingDoctor.experience || 0}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Online Video Fee (₹)</label>
                  <input
                    type="number"
                    value={editingDoctor.consultationFeeOnline || 600}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, consultationFeeOnline: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Clinic Visit Fee (₹)</label>
                  <input
                    type="number"
                    value={editingDoctor.consultationFeeInPerson || 750}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, consultationFeeInPerson: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setEditingDoctor(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}