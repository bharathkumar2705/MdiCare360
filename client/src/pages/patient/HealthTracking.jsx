import { useState, useEffect } from 'react';
import { healthMetricService } from '../../services';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoadingSpinner, EmptyState } from '../../components/common/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const METRIC_TYPES = [
  { type: 'WEIGHT', label: 'Weight', icon: '⚖️', unit: 'kg', color: '#0066CC' },
  { type: 'BLOOD_PRESSURE', label: 'Blood Pressure', icon: '🩺', unit: 'mmHg', color: '#EF4444' },
  { type: 'HEART_RATE', label: 'Heart Rate', icon: '❤️', unit: 'bpm', color: '#F59E0B' },
  { type: 'BLOOD_GLUCOSE', label: 'Blood Glucose', icon: '🩸', unit: 'mg/dL', color: '#10B981' },
  { type: 'SPO2', label: 'SpO2', icon: '🫁', unit: '%', color: '#7C3AED' },
  { type: 'TEMPERATURE', label: 'Temperature', icon: '🌡️', unit: '°C', color: '#F97316' },
  { type: 'SLEEP', label: 'Sleep', icon: '😴', unit: 'hrs', color: '#6366F1' },
  { type: 'STEPS', label: 'Steps', icon: '🚶', unit: 'steps', color: '#00B8A9' },
];

export default function HealthTracking() {
  const [activeType, setActiveType] = useState('WEIGHT');
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState({ show: false, value: '', notes: '', systolic: '', diastolic: '' });
  const [adding, setAdding] = useState(false);

  const active = METRIC_TYPES.find((m) => m.type === activeType);

  useEffect(() => {
    loadMetrics();
  }, [activeType]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await healthMetricService.getAll({ type: activeType, limit: 30 });
      setMetrics(res.data.data.reverse());
    } catch {}
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      const value = activeType === 'BLOOD_PRESSURE'
        ? { systolic: Number(addForm.systolic), diastolic: Number(addForm.diastolic) }
        : Number(addForm.value);

      await healthMetricService.add({ type: activeType, value, unit: active.unit, notes: addForm.notes });
      toast.success('Metric recorded!');
      setAddForm({ show: false, value: '', notes: '', systolic: '', diastolic: '' });
      loadMetrics();
    } catch { toast.error('Failed to record metric.'); }
    finally { setAdding(false); }
  };

  const chartData = metrics.map((m) => ({
    date: format(new Date(m.recordedAt), 'MMM d'),
    value: typeof m.value === 'object' ? m.value.systolic : m.value,
    diastolic: typeof m.value === 'object' ? m.value.diastolic : undefined,
  }));

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Health Tracking</h1>
          <p className="page-subtitle">Monitor your health metrics over time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddForm((f) => ({ ...f, show: true }))}>+ Add Reading</button>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <span>ℹ️</span>
        <p style={{ fontSize: 13 }}>Health metrics are for personal tracking only. Consult a healthcare professional for medical advice.</p>
      </div>

      {/* Metric type tabs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {METRIC_TYPES.map((m) => (
          <button key={m.type} onClick={() => setActiveType(m.type)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 99,
              border: `2px solid ${activeType === m.type ? m.color : 'var(--color-border)'}`,
              background: activeType === m.type ? m.color + '15' : 'white', cursor: 'pointer',
              color: activeType === m.type ? m.color : 'var(--color-text-secondary)', fontWeight: 600, fontSize: 13,
              transition: 'all 150ms ease',
            }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">{active?.icon} {active?.label} Trend</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Last 30 readings</span>
          </div>
          {loading ? <LoadingSpinner size="sm" /> :
            chartData.length === 0 ? (
              <EmptyState icon={active?.icon} title="No data yet" description="Add your first reading to start tracking." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={active?.color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={active?.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke={active?.color} fill="url(#mGrad)" strokeWidth={2} name={active?.label} />
                  {activeType === 'BLOOD_PRESSURE' && <Area type="monotone" dataKey="diastolic" stroke="#EF4444" fill="transparent" strokeWidth={2} strokeDasharray="4 2" name="Diastolic" />}
                </AreaChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Recent readings */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Recent Readings</span>
          </div>
          {metrics.length === 0 ? <EmptyState icon="📊" title="No readings yet" /> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {metrics.slice().reverse().map((m) => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--color-surface-2)' }}>
                  <span style={{ fontSize: 22 }}>{active?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: active?.color }}>
                      {typeof m.value === 'object' ? `${m.value.systolic}/${m.value.diastolic}` : m.value} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-secondary)' }}>{m.unit}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{format(new Date(m.recordedAt), 'MMM d, yyyy • h:mm a')}</div>
                    {m.notes && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{m.notes}</div>}
                  </div>
                </div>
              ))}
            </div>}
        </div>
      </div>

      {/* Add reading modal */}
      {addForm.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{active?.icon} Add {active?.label} Reading</h3>
              <button className="modal-close" onClick={() => setAddForm((f) => ({ ...f, show: false }))}>✕</button>
            </div>
            {activeType === 'BLOOD_PRESSURE' ? (
              <div className="form-row">
                <div className="form-group"><label className="form-label">Systolic (mmHg)</label><input className="form-input" type="number" placeholder="e.g. 120" value={addForm.systolic} onChange={(e) => setAddForm((f) => ({ ...f, systolic: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Diastolic (mmHg)</label><input className="form-input" type="number" placeholder="e.g. 80" value={addForm.diastolic} onChange={(e) => setAddForm((f) => ({ ...f, diastolic: e.target.value }))} /></div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">{active?.label} ({active?.unit})</label>
                <input className="form-input" type="number" placeholder={`Enter value in ${active?.unit}`} value={addForm.value} onChange={(e) => setAddForm((f) => ({ ...f, value: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input className="form-input" placeholder="Any additional notes..." value={addForm.notes} onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setAddForm((f) => ({ ...f, show: false }))}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={adding}>{adding ? 'Saving...' : 'Save Reading'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
