import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { appointmentService, prescriptionService, healthMetricService } from '../../services';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusBadge, LoadingSpinner, EmptyState } from '../../components/common/UI';
import { format, isToday, isTomorrow, isAfter } from 'date-fns';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [data, setData] = useState({ appointments: [], prescriptions: [], metrics: [], loading: true });

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, rxRes, metricsRes] = await Promise.all([
          appointmentService.getAll({ limit: 20 }),
          prescriptionService.getAll({ limit: 5 }),
          healthMetricService.getAll({ type: 'WEIGHT', limit: 30 }),
        ]);
        setData({
          appointments: apptRes.data.data || [],
          prescriptions: rxRes.data.data || [],
          metrics: metricsRes.data.data || [],
          loading: false,
        });
      } catch {
        setData((d) => ({ ...d, loading: false }));
      }
    };
    load();
  }, []);

  const upcoming = data.appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status) && isAfter(new Date(a.date), new Date())).slice(0, 1)[0];
  const todayAppts = data.appointments.filter((a) => isToday(new Date(a.date)));
  const completed = data.appointments.filter((a) => a.status === 'COMPLETED').length;
  const pending = data.appointments.filter((a) => a.status === 'PENDING').length;

  const chartData = data.metrics.slice(0, 14).reverse().map((m) => ({
    date: format(new Date(m.recordedAt), 'MMM d'),
    value: typeof m.value === 'object' ? m.value.systolic : m.value,
  }));

  const quickActions = [
    { icon: '🔍', label: 'Find Doctor', path: '/patient/doctors', color: 'var(--color-primary)' },
    { icon: '📅', label: 'Book Appointment', path: '/patient/doctors', color: 'var(--color-secondary)' },
    { icon: '📁', label: 'Upload Report', path: '/patient/documents', color: '#7C3AED' },
    { icon: '💊', label: 'View Prescriptions', path: '/patient/prescriptions', color: 'var(--color-warning)' },
    { icon: '🧪', label: 'Book Lab Test', path: '/patient/labs', color: 'var(--color-success)' },
  ];

  if (data.loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const getHour = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)' }}>
              {getHour()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Here's your health summary for today.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>
            + Book Appointment
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Appointments', value: data.appointments.length, icon: '📅', color: 'primary' },
          { label: 'Completed', value: completed, icon: '✅', color: 'success' },
          { label: 'Prescriptions', value: data.prescriptions.length, icon: '💊', color: 'secondary' },
          { label: 'Pending', value: pending, icon: '⏳', color: 'warning' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className={`stat-icon-wrap ${color}`}>{icon}</div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        {/* Upcoming Appointment */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📅 Upcoming Appointment</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patient/appointments')}>View all</button>
          </div>
          {upcoming ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="appointment-date-block">
                  <div className="appointment-date-day">{format(new Date(upcoming.date), 'd')}</div>
                  <div className="appointment-date-month">{format(new Date(upcoming.date), 'MMM')}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {upcoming.doctorId?.userId?.name || 'Doctor'}
                  </div>
                  <div style={{ color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>
                    {upcoming.doctorId?.specialization}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 4 }}>
                    🕐 {upcoming.slotTime} &nbsp;|&nbsp; <StatusBadge status={upcoming.consultationType} />
                  </div>
                </div>
                <StatusBadge status={upcoming.status} />
              </div>
              {upcoming.consultationType === 'ONLINE' && upcoming.status === 'CONFIRMED' && (
                <button className="btn btn-primary" onClick={() => navigate(`/patient/telemedicine/${upcoming._id}`)}>
                  📹 Join Consultation
                </button>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline-primary btn-sm flex-1" onClick={() => navigate(`/patient/appointments/${upcoming._id}`)}>View Details</button>
              </div>
            </div>
          ) : (
            <EmptyState icon="📅" title="No upcoming appointments" description="Book your next consultation with a doctor." action={<button className="btn btn-primary btn-sm" onClick={() => navigate('/patient/doctors')}>Find a Doctor</button>} />
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ Quick Actions</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {quickActions.map(({ icon, label, path, color }) => (
              <button key={label} onClick={() => navigate(path)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 8px', borderRadius: 12, border: '1.5px solid var(--color-border)',
                  background: 'var(--color-surface)', cursor: 'pointer', transition: 'all 200ms ease',
                  fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.background = 'var(--color-surface-2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
              >
                <span style={{ fontSize: 28 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        {/* Health Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Weight Trend (Last 14 days)</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patient/health')}>Track Health</button>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fill="url(#wGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="📊" title="No health data yet" description="Start tracking your health metrics." action={<button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/patient/health')}>Add Metrics</button>} />
          )}
        </div>

        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🕐 Recent Activity</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patient/appointments')}>View all</button>
          </div>
          {data.appointments.length === 0 ? (
            <EmptyState icon="📋" title="No appointments yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.appointments.slice(0, 4).map((appt) => (
                <div key={appt._id}
                  onClick={() => navigate(`/patient/appointments/${appt._id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer' }}>
                  <div className="avatar avatar-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    🩺
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, truncate: true }}>{appt.doctorId?.userId?.name || 'Doctor'}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{format(new Date(appt.date), 'MMM d, yyyy')} • {appt.slotTime}</div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prescriptions */}
      {data.prescriptions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">💊 Recent Prescriptions</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patient/prescriptions')}>View all</button>
          </div>
          <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead><tr>
                <th>Rx Number</th><th>Diagnosis</th><th>Doctor</th><th>Date</th><th>Status</th>
              </tr></thead>
              <tbody>
                {data.prescriptions.map((rx) => (
                  <tr key={rx._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patient/prescriptions/${rx._id}`)}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>{rx.prescriptionNumber}</span></td>
                    <td>{rx.diagnosis || '-'}</td>
                    <td>{rx.doctorId?.userId?.name || '-'}</td>
                    <td>{format(new Date(rx.createdAt), 'MMM d, yyyy')}</td>
                    <td><StatusBadge status={rx.isActive ? 'ACTIVE' : 'COMPLETED'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
