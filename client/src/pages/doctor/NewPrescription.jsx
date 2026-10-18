import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { prescriptionService, appointmentService } from '../../services';
import toast from 'react-hot-toast';

export default function NewPrescription() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const patientIdParam = searchParams.get('patientId');
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [patientId, setPatientId] = useState(patientIdParam || '');
  const [patientName, setPatientName] = useState('');
  const [saving, setSaving] = useState(false);

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '500 mg', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'After meals' },
  ]);

  useEffect(() => {
    if (appointmentId) {
      appointmentService.getById(appointmentId).then((res) => {
        if (res.data?.data) {
          const apt = res.data.data;
          setPatientId(apt.patientId?._id || apt.patientId);
          setPatientName(apt.patientId?.name || 'Patient');
        }
      }).catch(() => {});
    }
  }, [appointmentId]);

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '1 tablet', frequency: 'Once daily (1-0-0)', duration: '5 days', instructions: 'After meals' },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, val) => {
    setMedicines((prev) => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error('Please enter a clinical diagnosis.');
      return;
    }
    const validMeds = medicines.filter((m) => m.name.trim());
    if (validMeds.length === 0) {
      toast.error('Please add at least one medicine to the prescription.');
      return;
    }

    setSaving(true);
    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + Number(followUpDays));

      await prescriptionService.create({
        patientId,
        appointmentId: appointmentId || undefined,
        diagnosis,
        medicines: validMeds,
        notes,
        followUpDate,
      });

      toast.success('Digital prescription issued and sent to patient!');
      navigate('/doctor/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Issue Digital Prescription (Rx)
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            {patientName ? `Prescribing for patient: ${patientName}` : 'Issue a digitally signed medical prescription'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 24 }}>
          {/* Diagnosis */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 8, color: '#0F172A' }}>
              Clinical Diagnosis / Primary Condition <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Bronchitis, Essential Hypertension"
              className="form-input"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              required
            />
          </div>

          {/* Medicines Builder */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <label style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                💊 Prescribed Medications
              </label>
              <button
                type="button"
                onClick={addMedicine}
                className="btn btn-secondary"
                style={{ fontSize: 13, padding: '6px 14px' }}
              >
                + Add Medication
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 18,
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: '#0284C7', fontSize: 13 }}>
                      Medication #{idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(idx)}
                        style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Medicine Name
                      </label>
                      <input
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                        placeholder="e.g. Amoxicillin, Paracetamol"
                        className="form-input"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Dosage Strength
                      </label>
                      <input
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg, 10ml"
                        className="form-input"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Frequency
                      </label>
                      <input
                        value={med.frequency}
                        onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                        placeholder="e.g. Twice daily (1-0-1)"
                        className="form-input"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Duration
                      </label>
                      <input
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                        placeholder="e.g. 5 days, 1 month"
                        className="form-input"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Instructions / Food Timing
                    </label>
                    <input
                      value={med.instructions}
                      onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                      placeholder="e.g. Take after breakfast and dinner with plenty of water"
                      className="form-input"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Advice & Follow up */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 6, color: '#0F172A' }}>
                Dietary & General Clinical Advice
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Avoid cold drinks, maintain hydration, rest for 3 days."
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 6, color: '#0F172A' }}>
                Recommended Follow-Up
              </label>
              <select
                value={followUpDays}
                onChange={(e) => setFollowUpDays(Number(e.target.value))}
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              >
                <option value={3}>After 3 Days</option>
                <option value={5}>After 5 Days</option>
                <option value={7}>After 1 Week (Default)</option>
                <option value={14}>After 2 Weeks</option>
                <option value={30}>After 1 Month</option>
                <option value={0}>No follow-up needed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: 15, fontWeight: 700 }}
            >
              {saving ? 'Digitally Signing...' : '✍️ Issue Prescription'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}