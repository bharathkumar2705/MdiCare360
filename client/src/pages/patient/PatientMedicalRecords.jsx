import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { patientService } from '../../services';
import { LoadingSpinner } from '../../components/common/UI';
import { format } from 'date-fns';

export default function PatientMedicalRecords() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ conditions: [], allergies: [], surgeries: [], prescriptions: [], encounters: [] });
  const [activeTab, setActiveTab] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ title: '', category: 'CONDITION', diagnosedYear: new Date().getFullYear(), status: 'ACTIVE', notes: '' });

  useEffect(() => {
    fetchRealRecords();
  }, []);

  const fetchRealRecords = async () => {
    try {
      setLoading(true);
      const res = await patientService.getMedicalRecords();
      setData(res.data.data || { conditions: [], allergies: [], surgeries: [], prescriptions: [], encounters: [] });
    } catch (err) {
      toast.error('Failed to load electronic health records.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.title) {
      toast.error('Record title is required');
      return;
    }
    try {
      await patientService.addMedicalRecord(newRecord);
      toast.success('Medical record saved to database!');
      setShowAddModal(false);
      setNewRecord({ title: '', category: 'CONDITION', diagnosedYear: new Date().getFullYear(), status: 'ACTIVE', notes: '' });
      await fetchRealRecords();
    } catch (err) {
      toast.error('Failed to add medical record.');
    }
  };

  if (loading) return <LoadingSpinner text="Fetching your verified health records..." />;

  const conditionsCount = data.conditions?.length || 0;
  const allergiesCount = data.allergies?.length || 0;
  const prescriptionsCount = data.prescriptions?.length || 0;
  const encountersCount = data.encounters?.length || 0;

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Electronic Health Records (EHR)</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            Verified clinical timeline, active doctor prescriptions, diagnosed conditions, and allergies.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={fetchRealRecords}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            + Add Health Record
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>RECORDED CONDITIONS</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#1e3a8a' }}>{conditionsCount}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Medical history</div>
        </div>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>DOCUMENTED ALLERGIES</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#991b1b' }}>{allergiesCount}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Safety alerts</div>
        </div>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>DOCTOR PRESCRIPTIONS</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#065f46' }}>{prescriptionsCount}</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>From verified doctors</div>
        </div>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>CLINICAL ENCOUNTERS</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#5b21b6' }}>{encountersCount}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Consultations booked</div>
        </div>
      </div>

      {/* Real Prescriptions Section */}
      {data.prescriptions && data.prescriptions.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: 22 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 16px' }}>Doctor Prescriptions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.prescriptions.map((p) => (
              <div key={p._id} style={{ padding: 16, background: 'var(--color-surface-2)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Prescribed by {p.doctorId?.userId?.name || 'Treating Physician'}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Diagnosis: {p.diagnosis || 'General Consultation'}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    📅 {p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '-'}
                  </div>
                </div>
                {p.medications && p.medications.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>MEDICINES:</div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {p.medications.map((m, idx) => (
                        <li key={idx}><strong>{m.name}</strong> - {m.dosage} ({m.frequency}) for {m.duration}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions & Allergies */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 16px' }}>Medical History & Conditions</h3>

        {conditionsCount === 0 && allergiesCount === 0 && data.surgeries?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🩺</div>
            <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No health conditions recorded yet</h4>
            <p style={{ margin: '0 0 16px', fontSize: 13 }}>
              Keep your health profile updated so consulting doctors can view your allergies and diagnoses.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              + Add Your First Medical Record
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.allergies.map((allergy, idx) => (
              <div key={idx} style={{ padding: 14, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#ef4444', color: 'white', textTransform: 'uppercase' }}>ALLERGY</span>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: '#991b1b' }}>{allergy}</div>
                </div>
                <span className="badge badge-error">CRITICAL ALERT</span>
              </div>
            ))}

            {data.conditions.map((cond, idx) => (
              <div key={idx} style={{ padding: 14, borderRadius: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#eff6ff', color: '#1e40af', textTransform: 'uppercase' }}>DIAGNOSED CONDITION</span>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{cond.condition}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Diagnosed: {cond.diagnosedYear}</div>
                </div>
                <span className="badge badge-info">{cond.status}</span>
              </div>
            ))}

            {data.surgeries?.map((surg, idx) => (
              <div key={idx} style={{ padding: 14, borderRadius: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#faf5ff', color: '#6b21a8', textTransform: 'uppercase' }}>PROCEDURE / SURGERY</span>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{surg.procedure}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Year: {surg.year} • {surg.hospital}</div>
                </div>
                <span className="badge badge-neutral">RESOLVED</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal slide-up" style={{ maxWidth: 500, width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Medical Record</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddRecord}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>RECORD TYPE</label>
                <select
                  className="input"
                  value={newRecord.category}
                  onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="CONDITION">Medical Condition / Diagnosis</option>
                  <option value="ALLERGY">Drug / Food Allergy</option>
                  <option value="SURGERY">Surgery / Past Procedure</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>CONDITION / ALLERGY NAME</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Hypertension, Penicillin Allergy, Appendectomy"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>YEAR DIAGNOSED</label>
                  <input
                    type="number"
                    className="input"
                    value={newRecord.diagnosedYear}
                    onChange={(e) => setNewRecord({ ...newRecord, diagnosedYear: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>CURRENT STATUS</label>
                  <select
                    className="input"
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="CHRONIC">Chronic</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
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
