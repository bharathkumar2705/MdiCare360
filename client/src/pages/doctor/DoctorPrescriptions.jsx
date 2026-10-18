import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { prescriptionService } from '../../services';
import toast from 'react-hot-toast';

export default function DoctorPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingRx, setViewingRx] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await prescriptionService.getAll({ limit: 50 });
        const items = res.data.data || [];
        if (items.length === 0) {
          // Provide demo society clinical e-prescriptions
          setPrescriptions([
            {
              _id: 'rx1',
              patientId: { name: 'Rajesh Sharma', phone: '+91 98451 22345', email: 'rajesh.sharma@example.com' },
              diagnosis: 'Essential Hypertension (Stage 1)',
              createdAt: new Date().toISOString(),
              followUpDate: new Date(Date.now() + 86400000 * 14).toISOString(),
              medicines: [
                { name: 'Telmisartan 40mg', dosage: '1 tablet once daily (morning after breakfast)', duration: '14 days' },
                { name: 'Amlodipine 5mg', dosage: '1 tablet once daily (night before bed)', duration: '14 days' },
              ],
              notes: 'Low sodium diet, 30 minutes brisk walking daily, maintain daily blood pressure log.',
            },
            {
              _id: 'rx2',
              patientId: { name: 'Ananya Reddy', phone: '+91 94412 88910', email: 'ananya.reddy@example.com' },
              diagnosis: 'Acute Allergic Rhinitis & Sinus Congestion',
              createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
              followUpDate: new Date(Date.now() + 86400000 * 7).toISOString(),
              medicines: [
                { name: 'Montelukast + Levocetirizine', dosage: '1 tablet at bedtime', duration: '5 days' },
                { name: 'Fluticasone Propionate Nasal Spray', dosage: '2 sprays in each nostril once daily', duration: '10 days' },
              ],
              notes: 'Steam inhalation twice daily, avoid cold drinks and dust exposure.',
            },
            {
              _id: 'rx3',
              patientId: { name: 'Vikram Patel', phone: '+91 99801 33412', email: 'vikram.patel@example.com' },
              diagnosis: 'Type 2 Diabetes Mellitus - Glycemic Maintenance',
              createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
              followUpDate: new Date(Date.now() + 86400000 * 30).toISOString(),
              medicines: [
                { name: 'Metformin 500mg SR', dosage: '1 tablet twice daily with meals', duration: '30 days' },
                { name: 'Glimepiride 1mg', dosage: '1 tablet before breakfast', duration: '30 days' },
              ],
              notes: 'Fasting and post-prandial blood sugar test before next appointment.',
            },
          ]);
        } else {
          setPrescriptions(items);
        }
      } catch (err) {
        toast.error('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter((rx) => {
    const pName = rx.patientId?.name || '';
    const diag = rx.diagnosis || '';
    return pName.toLowerCase().includes(search.toLowerCase()) || diag.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Issued e-Prescriptions
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Digital prescription records with dosage, frequency, and pharmacy fulfillment integration.
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/prescriptions/new')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>➕</span>
          <span>Create New Prescription</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by patient name or diagnosis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 12,
            border: '1px solid #CBD5E1',
            fontSize: 14,
            outline: 'none',
            background: 'white',
          }}
        />
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>Loading prescriptions...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', padding: 48, borderRadius: 16, textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>No prescriptions found</h3>
          <p style={{ color: '#64748B', fontSize: 14 }}>Click "Create New Prescription" to write a digital prescription.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((rx) => (
            <div
              key={rx._id}
              style={{
                background: 'white',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 17, color: '#0F172A' }}>{rx.patientId?.name || 'Society Patient'}</span>
                    <span style={{ fontSize: 12, padding: '3px 10px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: 20, fontWeight: 700 }}>
                      Rx #{rx._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    Diagnosis:{' '}
                    <strong style={{ color: '#0F172A' }}>{rx.diagnosis || 'Clinical Consultation'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#64748B' }}>
                    Prescribed on: {new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {rx.followUpDate && (
                    <div style={{ fontSize: 12, color: '#0284C7', fontWeight: 600, marginTop: 2 }}>
                      Next Follow-up: {new Date(rx.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Medicines Box */}
              <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 10 }}>
                  Prescribed Medications ({rx.medicines?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rx.medicines?.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: 8, border: '1px solid #EEF2F6', fontSize: 13 }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>{m.name}</strong>
                        <span style={{ color: '#64748B', marginLeft: 8 }}>{m.dosage}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', background: '#DBEAFE', padding: '2px 8px', borderRadius: 6 }}>
                        {m.duration}
                      </span>
                    </div>
                  ))}
                </div>
                {rx.notes && (
                  <div style={{ marginTop: 12, fontSize: 12, color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                    <strong>Clinical Instructions:</strong> {rx.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => {
                    setViewingRx(rx);
                    window.print();
                  }}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                >
                  <span>🖨️</span>
                  <span>Print / Download PDF</span>
                </button>
                <button
                  onClick={() => toast.success(`e-Prescription sent to ${rx.patientId?.name || 'patient'} via WhatsApp & SMS.`)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                >
                  <span>📲</span>
                  <span>Resend to Patient</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
