import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll({});
      setAppointments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load doctor appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}.`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'UPCOMING') return a.status === 'CONFIRMED' || a.status === 'SCHEDULED';
    return a.status === statusFilter;
  });

  const STATUS_STYLES = {
    CONFIRMED: { bg: '#DEF7EC', color: '#03543F', text: 'Confirmed' },
    SCHEDULED: { bg: '#E0F2FE', color: '#0369A1', text: 'Scheduled' },
    COMPLETED: { bg: '#F1F5F9', color: '#475569', text: 'Completed' },
    CANCELLED: { bg: '#FDE8E8', color: '#9B1C1C', text: 'Cancelled' },
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Patient Appointments Schedule
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Manage in-clinic and video telemedicine consultations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: 4, borderRadius: 12 }}>
          {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === tab ? 'white' : 'transparent',
                color: statusFilter === tab ? '#0F172A' : '#64748B',
                boxShadow: statusFilter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: 60, textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>No Appointments Found</h3>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
            No appointments match the selected filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map((apt) => {
            const st = STATUS_STYLES[apt.status] || STATUS_STYLES.SCHEDULED;
            return (
              <div
                key={apt._id}
                style={{
                  background: 'white',
                  borderRadius: 20,
                  padding: 24,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 20,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#E0F2FE',
                        color: '#0369A1',
                        fontWeight: 700,
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {apt.patientId?.name?.[0] || 'P'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0F172A' }}>
                        {apt.patientId?.name || 'Patient'}
                      </h3>
                      <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                        {apt.patientId?.phone || apt.patientId?.email}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                      {st.text}
                    </span>
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                      {apt.type === 'ONLINE' ? '📹 Video Telehealth' : '🏥 In-Clinic'}
                    </span>
                  </div>
                </div>

                {/* Slot Details */}
                <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Date & Time Slot</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                    📅 {new Date(apt.slotDate || apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 14, color: '#0284C7', fontWeight: 600 }}>
                    ⏰ {apt.slotTime || apt.timeSlot || '10:00 AM'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {apt.type === 'ONLINE' && apt.status !== 'CANCELLED' && (
                    <Link
                      to={`/patient/appointments/${apt._id}`}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>📹</span> Join Consultation
                    </Link>
                  )}
                  <Link
                    to={`/doctor/prescriptions/new?appointmentId=${apt._id}&patientId=${apt.patientId?._id}`}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    📝 Write Rx
                  </Link>
                  {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange(apt._id, 'COMPLETED')}
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: 13, color: '#16A34A', borderColor: '#BBF7D0' }}
                    >
                      ✓ Mark Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}