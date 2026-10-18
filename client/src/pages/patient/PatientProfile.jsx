import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { user } = useSelector((state) => state.auth);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dob, setDob] = useState('1994-06-15');
  const [gender, setGender] = useState('MALE');
  const [emergencyName, setEmergencyName] = useState('Suresh Naru');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 43210');
  const [allergies, setAllergies] = useState('Penicillin, Dust mites');
  const [chronicConditions, setChronicConditions] = useState('Mild Seasonal Asthma');
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Patient health profile updated successfully!');
    }, 600);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          Patient Health Profile
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          Personal health details shared with your consulting doctors during appointments.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 24 }}>
          {/* Identity Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #F1F5F9' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                color: 'white',
                fontSize: 24,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user?.name?.[0] || 'P'}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>
                {user?.name || 'Patient'}
              </h2>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                {user?.email} • {user?.role}
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>
            1. Core Biological Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>
            2. Medical History & Allergies
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Known Drug & Food Allergies
              </label>
              <textarea
                rows={2}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Chronic Conditions / Pre-existing Illness
              </label>
              <textarea
                rows={2}
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Diabetes Type 2, Hypertension"
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>
            3. Emergency Contact
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Contact Name</label>
              <input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Next of kin / family member"
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Contact Phone</label>
              <input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: 15, fontWeight: 700 }}
            >
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}