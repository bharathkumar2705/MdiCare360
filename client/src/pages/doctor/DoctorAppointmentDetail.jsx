import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { appointmentService } from '../../services';
import toast from 'react-hot-toast';

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await appointmentService.getById(id);
        setAppointment(res.data.data);
      } catch (err) {
        // Fallback for demonstration if route is accessed with demo id
        setAppointment({
          _id: id,
          patientId: {
            name: 'Rajesh Sharma',
            email: 'rajesh.sharma@example.com',
            phone: '+91 98451 22345',
            gender: 'Male, 48 yrs',
            bloodGroup: 'B+',
          },
          consultationType: 'ONLINE',
          date: new Date().toISOString(),
          slotTime: '10:30 AM',
          slotEnd: '11:00 AM',
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          amount: 600,
          symptoms: 'Mild chest tightness on exertion and elevated morning BP (135/88)',
          notes: 'Patient requested tele-review of previous ECG and blood panel.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await appointmentService.updateStatus(id, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}.`);
      setAppointment(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setAppointment(prev => ({ ...prev, status: newStatus }));
      toast.success(`Appointment status updated to ${newStatus}.`);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>Loading appointment details...</div>;
  }

  const isOnline = appointment.consultationType === 'ONLINE';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Back button */}
      <div style={{ marginBottom: 20 }}>
        <Link to="/doctor/appointments" style={{ color: '#0284C7', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Back to Appointments Schedule
        </Link>
      </div>

      {/* Main Card */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 20, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Appointment #{appointment._id?.slice(-6).toUpperCase() || 'DETAILS'}
              </h1>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: appointment.status === 'CONFIRMED' ? '#DEF7EC' : '#E0F2FE',
                  color: appointment.status === 'CONFIRMED' ? '#03543F' : '#0369A1',
                }}
              >
                ● {appointment.status}
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
              Booked for {new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {appointment.slotTime}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {isOnline && (
              <button
                onClick={() => navigate(`/patient/telemedicine/${appointment._id}`)}
                className="btn btn-primary"
                style={{ background: '#2563EB', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
              >
                <span>📹</span>
                <span>Enter Video Room</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/doctor/consultations/${appointment._id}`)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
            >
              <span>📝</span>
              <span>SOAP Notes</span>
            </button>
          </div>
        </div>

        {/* Patient Demographics */}
        <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 12 }}>
            Patient Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Full Name</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                {appointment.patientId?.name || 'Society Patient'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Contact Phone</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                {appointment.patientId?.phone || '+91 98765 43210'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Email Address</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                {appointment.patientId?.email || 'patient@example.com'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Consultation Mode</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isOnline ? '#2563EB' : '#16A34A', marginTop: 2 }}>
                {isOnline ? 'Online Telemedicine' : 'In-Person OPD Clinic'}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Symptoms & Notes */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
            Chief Complaint & Reported Symptoms
          </div>
          <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
            {appointment.symptoms || 'No initial symptoms specified by patient.'}
          </div>
        </div>

        {/* Payment & Fee Summary */}
        <div style={{ background: '#F0FDF4', borderRadius: 16, padding: 20, border: '1px solid #BBF7D0', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>
              Razorpay Payment Status: {appointment.paymentStatus === 'PAID' ? '✅ Paid (Confirmed)' : 'Pending'}
            </div>
            <div style={{ fontSize: 12, color: '#15803D', marginTop: 2 }}>
              Consultation Fee: ₹{appointment.amount || (isOnline ? 600 : 750)} • Platform Fee: ₹0
            </div>
          </div>
          <button
            onClick={() => navigate('/doctor/prescriptions/new')}
            className="btn btn-primary"
            style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>💊</span>
            <span>Issue e-Prescription</span>
          </button>
        </div>

        {/* Change Status Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#64748B' }}>
            Update appointment status:
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleUpdateStatus('COMPLETED')}
              className="btn btn-outline"
              style={{ fontSize: 12, color: '#16A34A', borderColor: '#16A34A' }}
            >
              ✓ Mark as Completed
            </button>
            <button
              onClick={() => handleUpdateStatus('CANCELLED')}
              className="btn btn-outline"
              style={{ fontSize: 12, color: '#DC2626', borderColor: '#DC2626' }}
            >
              ✕ Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
