import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { appointmentService } from '../../services';
import { StatusBadge, LoadingSpinner } from '../../components/common/UI';
import PaymentModal from '../../components/common/PaymentModal';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchAppointment = async () => {
    try {
      const res = await appointmentService.getById(id);
      setAppt(res.data.data);
    } catch (err) {
      toast.error('Failed to load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handlePaymentSuccess = async (paymentData) => {
    try {
      await appointmentService.pay(id);
      setShowPaymentModal(false);
      toast.success(`Paid ₹${fee} via ${paymentData.method}!`);
      await fetchAppointment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment update failed.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading appointment details..." />;
  if (!appt) return <div className="alert alert-error">Appointment not found.</div>;

  const fee = appt.consultationType === 'ONLINE'
    ? (appt.doctorId?.consultationFeeOnline || 850)
    : (appt.doctorId?.consultationFeeInPerson || 850);

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patient/appointments')} style={{ marginBottom: 16 }}>
        ← Back to Appointments
      </button>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>APPOINTMENT #{appt._id?.slice(-8).toUpperCase()}</span>
            <h2 style={{ fontWeight: 800, fontSize: 24, marginTop: 4 }}>Appointment Details</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge status={appt.status} />
            <StatusBadge status={appt.paymentStatus} />
          </div>
        </div>

        {/* Doctor and appointment summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, padding: 20, background: 'var(--color-surface-2)', borderRadius: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{appt.doctorId?.userId?.name || 'Dr. Specialist'}</div>
            <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>{appt.doctorId?.specialization || 'Medical Specialist'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{format(new Date(appt.date), 'EEEE, MMMM d, yyyy')}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Slot: {appt.slotTime}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consultation Type</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{appt.consultationType === 'ONLINE' ? '💻 Video Consultation' : '🏥 In-Person Clinic Visit'}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Standard Consultation</div>
          </div>
        </div>

        {/* Symptoms */}
        {appt.symptoms && (
          <div style={{ marginBottom: 24, padding: 16, border: '1px solid var(--color-border)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>PATIENT NOTES & SYMPTOMS</div>
            <p style={{ fontSize: 14, margin: 0, color: 'var(--color-text)' }}>{appt.symptoms}</p>
          </div>
        )}

        {/* Payment section */}
        {appt.paymentStatus !== 'PAID' ? (
          <div style={{ padding: 24, borderRadius: 16, border: '2px solid #3b82f6', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="badge badge-warning" style={{ marginBottom: 8 }}>Payment Required</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0', color: '#1e3a8a' }}>Complete Your Consultation Payment</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#1e40af' }}>
                  Pay your doctor consultation fee to confirm your booking slot.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>AMOUNT DUE</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#1e3a8a' }}>₹{fee}</div>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔒 256-bit Secure Gateway</span>
                <span>• Razorpay Verified</span>
                <span>• Instant Confirmation</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowPaymentModal(true)}
                style={{ padding: '12px 32px', fontSize: 16, fontWeight: 700 }}
              >
                Pay ₹{fee} Now (UPI / Card / NetBanking)
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 20, borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: 16 }}>Payment Completed</div>
                <div style={{ fontSize: 13, color: '#15803d' }}>Consultation fee of ₹{fee} was successfully paid.</div>
              </div>
            </div>
            <span className="badge badge-success">Paid via Razorpay</span>
          </div>
        )}

        {/* Video room button for confirmed online appointments */}
        {appt.consultationType === 'ONLINE' && (
          <div style={{ marginTop: 12 }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: 16, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              onClick={() => navigate(`/patient/telemedicine/${appt._id}`)}
              disabled={appt.status === 'CANCELLED' || appt.status === 'REJECTED'}
            >
              📹 Join Video Consultation Room
            </button>
          </div>
        )}
      </div>

      {/* Real Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={fee}
        serviceType="APPOINTMENT"
        serviceId={appt._id}
        title={`Consultation Fee - Dr. ${appt.doctorId?.userId?.name || 'Doctor'}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
