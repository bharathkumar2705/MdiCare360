import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService, appointmentService } from '../../services';
import { LoadingSpinner, StatusBadge, EmptyState } from '../../components/common/UI';
import PaymentModal from '../../components/common/PaymentModal';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: type, 2: date, 3: slot, 4: confirm
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [form, setForm] = useState({
    consultationType: 'IN_PERSON',
    date: '',
    slotTime: '',
    symptoms: '',
  });

  const next7Days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  useEffect(() => {
    doctorService.getById(doctorId).then((res) => { setDoctor(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (form.date && form.consultationType) {
      setSlotsLoading(true);
      doctorService.getAvailability(doctorId, { date: form.date, consultationType: form.consultationType })
        .then((res) => setSlots(res.data.data?.slots || []))
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [form.date, form.consultationType, doctorId]);

  const [createdAppt, setCreatedAppt] = useState(null);

  const handleConfirmClick = async () => {
    setBooking(true);
    try {
      const res = await appointmentService.book({
        doctorId,
        consultationType: form.consultationType,
        date: form.date,
        slotTime: form.slotTime,
        symptoms: form.symptoms,
      });
      const newAppt = res.data.data;
      setCreatedAppt(newAppt);

      if (fee > 0) {
        setShowPaymentModal(true);
      } else {
        toast.success('Appointment booked successfully!');
        navigate(`/patient/appointments/${newAppt._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    toast.success('Appointment booked and confirmed with payment!');
    if (createdAppt?._id) {
      navigate(`/patient/appointments/${createdAppt._id}`);
    } else {
      navigate('/patient/appointments');
    }
  };

  if (loading) return <LoadingSpinner text="Loading doctor details..." />;
  if (!doctor) return <div className="alert alert-error">Doctor not found.</div>;

  const fee = form.consultationType === 'ONLINE' ? doctor.consultationFeeOnline : doctor.consultationFeeInPerson;

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="page-title" style={{ marginTop: 8 }}>Book Appointment</h1>
      </div>

      {/* Doctor summary */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="doctor-avatar" style={{ width: 60, height: 60, fontSize: 22 }}>
            {doctor.userId?.name?.split(' ').slice(0, 2).map((n) => n[0]).join('') || 'DR'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{doctor.userId?.name}</div>
            <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14 }}>{doctor.specialization}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{doctor.experience} years experience</div>
          </div>
          {doctor.verificationStatus === 'VERIFIED' && (
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>✓ Verified</span>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        {['Consultation Type', 'Select Date', 'Choose Slot', 'Confirm'].map((label, i) => (
          <div key={label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px',
              background: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-border)',
              color: step >= i + 1 ? 'white' : 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
              transition: 'all 300ms ease',
            }}>{step > i + 1 ? '✓' : i + 1}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: step === i + 1 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 1: Type */}
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Select Consultation Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { type: 'IN_PERSON', icon: '🏥', label: 'In-Person', desc: 'Visit the clinic/hospital', available: doctor.isInPersonAvailable, fee: doctor.consultationFeeInPerson },
                { type: 'ONLINE', icon: '💻', label: 'Online Consultation', desc: 'Video call from home', available: doctor.isOnlineConsultationAvailable, fee: doctor.consultationFeeOnline },
              ].map(({ type, icon, label, desc, available, fee: f }) => (
                <button key={type} disabled={!available}
                  onClick={() => { setForm((d) => ({ ...d, consultationType: type })); setStep(2); }}
                  style={{
                    padding: 24, border: `2px solid ${form.consultationType === type ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 16, cursor: available ? 'pointer' : 'not-allowed', background: available ? 'white' : 'var(--color-surface-2)',
                    opacity: available ? 1 : 0.5, transition: 'all 200ms ease', textAlign: 'left',
                  }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>{desc}</div>
                  {available ? (
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>₹{f}</div>
                  ) : (
                    <span className="badge badge-neutral">Not Available</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Select Date</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {next7Days.slice(0, 14).map((d) => {
                const ds = format(d, 'yyyy-MM-dd');
                const selected = form.date === ds;
                return (
                  <button key={ds} onClick={() => setForm((f) => ({ ...f, date: ds, slotTime: '' }))}
                    style={{
                      padding: '12px 4px', borderRadius: 12, border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: selected ? 'var(--color-primary)' : 'white', color: selected ? 'white' : 'var(--color-text)',
                      cursor: 'pointer', transition: 'all 150ms ease', textAlign: 'center',
                    }}>
                    <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{format(d, 'EEE')}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{format(d, 'd')}</div>
                    <div style={{ fontSize: 10 }}>{format(d, 'MMM')}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" disabled={!form.date} onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Slot */}
        {step === 3 && (
          <div>
            <h3 style={{ marginBottom: 8 }}>Choose Time Slot</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 20 }}>{format(new Date(form.date), 'EEEE, MMMM d, yyyy')}</p>
            {slotsLoading ? <LoadingSpinner size="sm" text="Loading available slots..." /> :
              slots.length === 0 ? (
                <EmptyState icon="🗓️" title="No slots available" description="No available slots for this date." action={<button className="btn btn-outline" onClick={() => setStep(2)}>Choose Another Date</button>} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10, marginBottom: 24 }}>
                  {slots.map((slot) => (
                    <button key={slot} onClick={() => setForm((f) => ({ ...f, slotTime: slot }))}
                      style={{
                        padding: '12px 8px', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14,
                        border: `2px solid ${form.slotTime === slot ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: form.slotTime === slot ? 'var(--color-primary)' : 'white',
                        color: form.slotTime === slot ? 'white' : 'var(--color-text)', cursor: 'pointer', transition: 'all 150ms ease',
                      }}>{slot}</button>
                  ))}
                </div>
              )}
            <div className="form-group">
              <label className="form-label">Describe your symptoms (optional)</label>
              <textarea className="form-textarea" rows={3} placeholder="Brief description of your concern..." value={form.symptoms} onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" disabled={!form.slotTime} onClick={() => setStep(4)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Confirm Appointment</h3>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Doctor', doctor.userId?.name],
                  ['Specialization', doctor.specialization],
                  ['Type', form.consultationType],
                  ['Date', format(new Date(form.date), 'EEEE, MMMM d, yyyy')],
                  ['Time', form.slotTime],
                  ['Consultation Fee', `₹${fee}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>₹{fee}</span>
              </div>
            </div>
            {form.symptoms && (
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--color-info-light)', borderRadius: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>"{form.symptoms}"</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline flex-1" onClick={() => setStep(3)} disabled={booking}>← Edit</button>
              <button className="btn btn-primary flex-1" onClick={handleConfirmClick} disabled={booking}>
                {booking ? 'Processing...' : `Confirm & Pay ₹${fee}`}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 12 }}>
              Secure payment via UPI, Credit/Debit Card, or Net Banking.
            </p>
          </div>
        )}
      </div>

      {/* Real Razorpay Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          if (createdAppt?._id) {
            navigate(`/patient/appointments/${createdAppt._id}`);
          }
        }}
        amount={fee}
        serviceType="APPOINTMENT"
        serviceId={createdAppt?._id}
        title={`Doctor Consultation - ${doctor?.userId?.name || 'Doctor'}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
