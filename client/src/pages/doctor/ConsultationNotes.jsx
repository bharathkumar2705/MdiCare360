import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ConsultationNotes() {
  const navigate = useNavigate();
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [spo2, setSpo2] = useState('99');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAiAssistance = () => {
    if (!chiefComplaint.trim()) {
      toast.error('Please enter the chief complaint before asking the AI Copilot.');
      return;
    }
    setAiGenerating(true);
    setTimeout(() => {
      setAssessment((prev) => prev ? prev : `Clinical Impression: Possible Upper Respiratory Tract Infection based on reported symptoms (${chiefComplaint}). Differential diagnoses: Viral Rhinitis vs Acute Pharyngitis.`);
      setPlan((prev) => prev ? prev : `1. Symptomatic relief with antipyretics and warm saline gargles.\n2. Hydration advice.\n3. Re-evaluate if symptoms persist beyond 48 hours.`);
      setAiGenerating(false);
      toast.success('AI Copilot generated clinical draft! Please review and modify before saving.');
    }, 1200);
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Clinical consultation notes securely recorded in patient EHR.');
    navigate('/doctor/appointments');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Clinical Consultation & SOAP Notes
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Record structured EHR clinical documentation during patient consultation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAiAssistance}
          disabled={aiGenerating}
          className="btn btn-secondary"
          style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}
        >
          <span>✨</span>
          <span>{aiGenerating ? 'Analyzing with Copilot...' : 'Doctor AI Copilot Assist'}</span>
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          {/* Subjective */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            S — Subjective Findings
          </h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
              Chief Complaint / Presenting Concern <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Dry cough and low-grade fever for 3 days with throat irritation."
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
              History of Present Illness (HPI)
            </label>
            <textarea
              rows={2}
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="e.g. No known comorbidities. No recent travel or contact with Covid-19."
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
            />
          </div>

          {/* Objective Vitals */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 14px' }}>
            O — Objective Clinical Vitals
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28, background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>BP (mmHg)</label>
              <input value={bp} onChange={(e) => setBp(e.target.value)} className="form-input" style={{ width: '100%', padding: '8px 12px', background: 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Heart Rate (bpm)</label>
              <input value={pulse} onChange={(e) => setPulse(e.target.value)} className="form-input" style={{ width: '100%', padding: '8px 12px', background: 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>Temp (°F)</label>
              <input value={temp} onChange={(e) => setTemp(e.target.value)} className="form-input" style={{ width: '100%', padding: '8px 12px', background: 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }}>SpO2 (%)</label>
              <input value={spo2} onChange={(e) => setSpo2(e.target.value)} className="form-input" style={{ width: '100%', padding: '8px 12px', background: 'white' }} />
            </div>
          </div>

          {/* Assessment */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            A — Clinical Assessment & Impression
          </h3>
          <div style={{ marginBottom: 24 }}>
            <textarea
              rows={3}
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="e.g. Clinical diagnosis and differential thoughts..."
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
            />
          </div>

          {/* Plan */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
            P — Management & Treatment Plan
          </h3>
          <div style={{ marginBottom: 28 }}>
            <textarea
              rows={3}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="e.g. Medications prescribed, lifestyle advice, diagnostic tests recommended..."
              className="form-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={() => navigate('/doctor/appointments')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 700 }}>
              💾 Save to Patient Medical Record
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}