import { useState, useEffect } from 'react';
import { prescriptionService } from '../../services';
import toast from 'react-hot-toast';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const res = await prescriptionService.getAll({});
        setPrescriptions(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          My Digital Prescriptions (Rx)
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          Access, download, and review medical prescriptions issued by your doctors.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <div className="spinner" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>No Prescriptions Yet</h3>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
            Once you complete a consultation with a doctor, your digital prescriptions will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 28,
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 18, marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>💊</span>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {rx.diagnosis || 'Clinical Prescription'}
                    </h3>
                  </div>
                  <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
                    Prescribed by: <strong>{rx.doctorId?.userId?.name || rx.doctorId?.name || 'Practitioner'}</strong> ({rx.doctorId?.specialization || 'Consultant'})
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0284C7', background: '#F0F9FF', padding: '4px 10px', borderRadius: 99, display: 'inline-block' }}>
                    {rx.prescriptionNumber || 'RX-MEDICARE'}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                    Issued on {new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Medicines List */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>
                  Prescribed Medications:
                </h4>
                <div style={{ display: 'grid', gap: 10 }}>
                  {rx.medicines?.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 14,
                        background: '#F8FAFC',
                        borderRadius: 12,
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>
                          {m.name} <span style={{ color: '#0284C7', fontWeight: 600, fontSize: 13 }}>({m.dosage})</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                          {m.instructions || 'Take as advised'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: '#E2E8F0', color: '#334155', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>
                          {m.frequency}
                        </span>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                          Duration: {m.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice and Follow-up */}
              {rx.notes && (
                <div style={{ padding: 14, background: '#FFFBEB', borderRadius: 12, border: '1px solid #FEF3C7', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>
                    Doctor's Advice:
                  </div>
                  <div style={{ fontSize: 13, color: '#78350F' }}>
                    {rx.notes}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>
                  {rx.followUpDate ? `🗓️ Recommended Follow-up: ${new Date(rx.followUpDate).toLocaleDateString()}` : 'No follow-up required'}
                </span>
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: 13 }}
                >
                  🖨️ Print Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}