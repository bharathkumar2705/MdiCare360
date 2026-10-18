import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services';
import { StatusBadge, LoadingSpinner, EmptyState, Pagination, ConfirmModal } from '../../components/common/UI';
import { format, isToday, isTomorrow, isAfter } from 'date-fns';
import toast from 'react-hot-toast';

const TABS = [
  { label: 'All', value: '' }, { label: 'Upcoming', value: 'upcoming' },
  { label: 'Pending', value: 'PENDING' }, { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' }, { label: 'Cancelled', value: 'CANCELLED' },
];

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (tab && tab !== 'upcoming') params.status = tab;
        const res = await appointmentService.getAll(params);
        let data = res.data.data || [];
        if (tab === 'upcoming') data = data.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status) && isAfter(new Date(a.date), new Date()));
        setAppointments(data);
        setPagination(res.data.pagination || { total: data.length, pages: 1 });
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [tab, page]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await appointmentService.updateStatus(cancelModal.id, { status: 'CANCELLED', reason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      setAppointments((prev) => prev.map((a) => a._id === cancelModal.id ? { ...a, status: 'CANCELLED' } : a));
      setCancelModal({ open: false, id: null });
    } catch { toast.error('Cancellation failed'); }
    finally { setCancelling(false); }
  };

  const getDateLabel = (d) => {
    const date = new Date(d);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">View and manage your appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>+ Book New</button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.value} className={`tab-btn ${tab === t.value ? 'active' : ''}`}
            onClick={() => { setTab(t.value); setPage(1); }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner text="Loading appointments..." /> :
        appointments.length === 0 ? (
          <EmptyState icon="📅" title="No appointments found" description="Book an appointment with a doctor to get started." action={<button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>Find a Doctor</button>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {appointments.map((appt) => (
              <div key={appt._id} className="appointment-card" onClick={() => navigate(`/patient/appointments/${appt._id}`)}>
                <div className="appointment-date-block">
                  <div className="appointment-date-day">{format(new Date(appt.date), 'd')}</div>
                  <div className="appointment-date-month">{format(new Date(appt.date), 'MMM')}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700 }}>{appt.doctorId?.userId?.name || 'Doctor'}</div>
                    {appt.doctorId?.verificationStatus === 'VERIFIED' && <span style={{ color: 'var(--color-success)', fontSize: 14 }}>✓</span>}
                  </div>
                  <div style={{ color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}>{appt.doctorId?.specialization}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>🕐 {appt.slotTime}</span>
                    <span>{getDateLabel(appt.date)}</span>
                    <StatusBadge status={appt.consultationType} />
                  </div>
                  {appt.symptoms && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, fontStyle: 'italic' }}>"{appt.symptoms.slice(0, 80)}"</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <StatusBadge status={appt.status} />
                  {appt.consultationType === 'ONLINE' && appt.status === 'CONFIRMED' && isAfter(new Date(`${format(new Date(appt.date), 'yyyy-MM-dd')}T${appt.slotTime}`), new Date(Date.now() - 3600000)) && (
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/patient/telemedicine/${appt._id}`); }}>📹 Join</button>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                      onClick={(e) => { e.stopPropagation(); setCancelModal({ open: true, id: appt._id }); }}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
            <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
          </div>
        )}

      <ConfirmModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, id: null })}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Cancel Appointment"
        danger
        loading={cancelling}
      />
    </div>
  );
}
