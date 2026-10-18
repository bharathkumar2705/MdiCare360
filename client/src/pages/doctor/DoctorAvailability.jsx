import { useState, useEffect } from 'react';
import { availabilityService } from '../../services';
import toast from 'react-hot-toast';

const DAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
  { key: 'SUN', label: 'Sunday' },
];

export default function DoctorAvailability() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState(30);
  const [bufferTime, setBufferTime] = useState(5);
  const [workingHours, setWorkingHours] = useState({
    MON: { enabled: true, start: '09:00', end: '17:00' },
    TUE: { enabled: true, start: '09:00', end: '17:00' },
    WED: { enabled: true, start: '09:00', end: '17:00' },
    THU: { enabled: true, start: '09:00', end: '17:00' },
    FRI: { enabled: true, start: '09:00', end: '17:00' },
    SAT: { enabled: false, start: '10:00', end: '14:00' },
    SUN: { enabled: false, start: '10:00', end: '14:00' },
  });

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await availabilityService.get();
        if (res.data.data) {
          if (res.data.data.workingHours) setWorkingHours(res.data.data.workingHours);
          if (res.data.data.consultationDuration) setConsultationDuration(res.data.data.consultationDuration);
          if (res.data.data.bufferTime) setBufferTime(res.data.data.bufferTime);
        }
      } catch (err) {
        // Fall back to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleDayToggle = (dayKey) => {
    setWorkingHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey]?.enabled,
      },
    }));
  };

  const handleTimeChange = (dayKey, field, val) => {
    setWorkingHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: val,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await availabilityService.update({
        workingHours,
        consultationDuration: Number(consultationDuration),
        bufferTime: Number(bufferTime),
      });
      toast.success('Availability schedule saved successfully!');
    } catch (err) {
      toast.error('Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 350 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Consultation Hours & Availability
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Configure your active weekly booking hours and slot durations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700 }}
        >
          {saving ? 'Saving...' : '💾 Save Schedule'}
        </button>
      </div>

      {/* Slot duration settings */}
      <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
            Consultation Slot Duration
          </label>
          <select
            value={consultationDuration}
            onChange={(e) => setConsultationDuration(Number(e.target.value))}
            className="form-input"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
          >
            <option value={15}>15 Minutes</option>
            <option value={20}>20 Minutes</option>
            <option value={30}>30 Minutes (Recommended)</option>
            <option value={45}>45 Minutes</option>
            <option value={60}>60 Minutes</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
            Buffer Between Appointments
          </label>
          <select
            value={bufferTime}
            onChange={(e) => setBufferTime(Number(e.target.value))}
            className="form-input"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
          >
            <option value={0}>0 Minutes</option>
            <option value={5}>5 Minutes (Default)</option>
            <option value={10}>10 Minutes</option>
            <option value={15}>15 Minutes</option>
          </select>
        </div>
      </div>

      {/* Days Schedule */}
      <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Weekly Working Schedule</h3>

        <div style={{ display: 'grid', gap: 16 }}>
          {DAYS.map(({ key, label }) => {
            const dayConf = workingHours[key] || { enabled: false, start: '09:00', end: '17:00' };
            return (
              <div
                key={key}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: `1px solid ${dayConf.enabled ? '#BAE6FD' : '#E2E8F0'}`,
                  background: dayConf.enabled ? '#F0F9FF' : '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 140 }}>
                  <input
                    type="checkbox"
                    checked={dayConf.enabled}
                    onChange={() => handleDayToggle(key)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 700, color: dayConf.enabled ? '#0F172A' : '#94A3B8', fontSize: 15 }}>
                    {label}
                  </span>
                </div>

                {dayConf.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="time"
                      value={dayConf.start || '09:00'}
                      onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white' }}
                    />
                    <span style={{ color: '#64748B', fontWeight: 600 }}>to</span>
                    <input
                      type="time"
                      value={dayConf.end || '17:00'}
                      onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                      className="form-input"
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white' }}
                    />
                  </div>
                ) : (
                  <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                    Unavailable / Closed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}