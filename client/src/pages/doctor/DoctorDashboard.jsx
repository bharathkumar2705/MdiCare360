import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { appointmentService, prescriptionService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { StatusBadge, LoadingSpinner, EmptyState } from '../../components/common/UI';
import { format, isToday } from 'date-fns';

export default function DoctorDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [data, setData] = useState({ appointments: [], prescriptions: [], loading: true });

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, rxRes] = await Promise.all([
          appointmentService.getAll({ limit: 50 }),
          prescriptionService.getAll({ limit: 5 }),
        ]);
        setData({ appointments: apptRes.data.data || [], prescriptions: rxRes.data.data || [], loading: false });
      } catch { setData((d) => ({ ...d, loading: false })); }
    };
    load();
  }, []);

  const today = data.appointments.filter((a) => isToday(new Date(a.date)));
  const pending = data.appointments.filter((a) => a.status === 'PENDING').length;
  const completed = data.appointments.filter((a) => a.status === 'COMPLETED').length;
  const todayEarnings = today.filter((a) => a.paymentStatus === 'PAID').reduce((s, a) => s + (a.doctorId?.consultationFeeInPerson || 0), 0);
  const uniquePatients = new Set(data.appointments.map((a) => a.patientId?._id || a.patientId)).size;

  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dayAppts = data.appointments.filter((a) => new Date(a.date).toDateString() === d.toDateString() && a.paymentStatus === 'PAID');
    return { day: format(d, 'EEE'), revenue: dayAppts.length * 600, count: dayAppts.length };
  });

  if (data.loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ').slice(0, 2).join(' ')}!</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              You have <strong style={{ color: 'var(--color-primary)' }}>{today.length}</strong> appointments today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" onClick={() => navigate('/doctor/availability')}>⚙️ Manage Schedule</button>
            <button className="btn btn-primary" onClick={() => navigate('/doctor/prescriptions/new')}>+ New Prescription</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: "Today's Appointments", value: today.length, icon: '📅', color: 'primary' },
          { label: 'Pending Requests', value: pending, icon: '⏳', color: 'warning' },
          { label: 'Completed', value: completed, icon: '✅', color: 'success' },
          { label: 'Total Patients', value: uniquePatients, icon: '👥', color: 'secondary' },
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
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">💰 Weekly Appointments</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🗓️ Today's Schedule</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/appointments')}>View all</button>
          </div>
          {today.length === 0 ? (
            <EmptyState icon="🕐" title="No appointments today" description="Enjoy a free day or update your availability." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {today.slice(0, 5).map((appt) => (
                <div key={appt._id} onClick={() => navigate(`/doctor/appointments/${appt._id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--color-border)', cursor: 'pointer', transition: 'all 200ms ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width: 48, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{appt.slotTime}</div>
                  <div className="avatar avatar-sm">{appt.patientId?.name?.[0] || '?'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{appt.patientId?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{appt.symptoms?.slice(0, 40) || 'General consultation'}</div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Requests */}
      {data.appointments.filter((a) => a.status === 'PENDING').length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">⏳ Pending Appointment Requests</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctor/appointments?status=PENDING')}>View all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.appointments.filter((a) => a.status === 'PENDING').slice(0, 3).map((appt) => (
              <div key={appt._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px', borderRadius: 12, border: '1.5px solid var(--color-warning-light)', background: 'var(--color-warning-light)' }}>
                <div className="avatar avatar-md">{appt.patientId?.name?.[0] || '?'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{appt.patientId?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{format(new Date(appt.date), 'MMMM d, yyyy')} • {appt.slotTime} • {appt.consultationType}</div>
                  {appt.symptoms && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, fontStyle: 'italic' }}>"{appt.symptoms}"</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => appointmentService.updateStatus(appt._id, { status: 'CONFIRMED' }).then(() => toast.success('Confirmed'))}>✓ Accept</button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/doctor/appointments/${appt._id}`)}>View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
