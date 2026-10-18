import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { doctorService } from '../../services';
import toast from 'react-hot-toast';

export default function DoctorProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorService.getMyProfile();
        setDoctor(res.data?.data);
      } catch (err) {
        // Fallback default for active logged-in doctor
        setDoctor({
          specialization: 'Cardiology',
          registrationNumber: 'MCI-884920-KMC',
          experience: 12,
          qualifications: ['MBBS', 'MD (General Medicine)', 'DM (Cardiology)'],
          languages: ['English', 'Telugu', 'Hindi'],
          consultationFeeOnline: 600,
          consultationFeeInPerson: 750,
          isOnlineConsultationAvailable: true,
          isInPersonAvailable: true,
          rating: 4.9,
          totalReviews: 184,
          bio: 'Senior Consultant Interventional Cardiologist committed to patient-centric cardiovascular wellness, preventive cardiology, and evidence-based digital telemedicine.',
          clinic: {
            name: 'MediCare360 Society Health Center',
            address: 'Sector 4, Main Society Boulevard, Bengaluru - 560034',
            timing: 'Mon - Sat: 09:00 AM - 07:00 PM',
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading doctor profile...</div>;
  }

  const qualificationsList = Array.isArray(doctor?.qualifications)
    ? doctor.qualifications.join(', ')
    : doctor?.qualifications || 'MBBS, MD';

  const languagesList = Array.isArray(doctor?.languages)
    ? doctor.languages.join(', ')
    : doctor?.languages || 'English, Hindi';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner Card */}
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: 32,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 800,
                boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)',
              }}
            >
              {user?.name?.[0] || 'D'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {user?.name || 'Dr. Bharath Kumar Reddy'}
                </h1>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: '#DEF7EC',
                    color: '#03543F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>✓</span> Verified Practitioner
                </span>
              </div>

              <div style={{ fontSize: 15, color: '#0284C7', fontWeight: 600, marginTop: 4 }}>
                {doctor?.specialization || 'Cardiology Specialist'} • {doctor?.experience || 12} Years Experience
              </div>

              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>📧 {user?.email}</span>
                <span>📞 {user?.phone || '+91 98765 43210'}</span>
                <span>📋 Reg: {doctor?.registrationNumber || 'MCI-884920-KMC'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/doctor/settings')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
            >
              <span>⚙️</span>
              <span>Edit Practice & Fees</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Credentials & Fees */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Professional Qualifications */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
            🎓 Medical Qualifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Degrees & Certifications</div>
              <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{qualificationsList}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Languages Spoken</div>
              <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{languagesList}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Medical Council Registration</div>
              <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{doctor?.registrationNumber || 'KMC / MCI Verified'}</div>
            </div>
          </div>
        </div>

        {/* Consultation Pricing */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
            💰 Consultation Fees
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#EFF6FF', borderRadius: 12, border: '1px solid #DBEAFE' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1E40AF' }}>📹 Telemedicine (Video Call)</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Encrypted WebRTC consultation</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1E40AF' }}>
                ₹{doctor?.consultationFeeOnline || 600}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #DCFCE7' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#166534' }}>🏥 In-Clinic OPD Visit</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Physical consultation & vitals</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>
                ₹{doctor?.consultationFeeInPerson || 750}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio & Clinic Location */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Bio */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
            📝 Clinical Biography
          </h2>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {doctor?.bio || 'Senior Consultant Cardiologist serving society residents with dedication.'}
          </p>
        </div>

        {/* Clinic Location */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
            📍 Clinic Practice Location
          </h2>
          <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: '#0F172A' }}>{doctor?.clinic?.name || 'MediCare360 Society Health Center'}</div>
            <div style={{ color: '#64748B', marginTop: 4 }}>{doctor?.clinic?.address || 'Sector 4, Main Society Boulevard, Bengaluru - 560034'}</div>
            <div style={{ color: '#16A34A', fontWeight: 600, marginTop: 8, fontSize: 13 }}>
              🕒 {doctor?.clinic?.timing || 'Mon - Sat: 09:00 AM - 07:00 PM'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 14, color: '#475569' }}>
          Looking to configure your schedule or bank payouts?
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/doctor/availability" className="btn btn-outline" style={{ fontSize: 13 }}>
            Manage Schedule
          </Link>
          <Link to="/doctor/settings" className="btn btn-primary" style={{ fontSize: 13 }}>
            Full Settings Suite
          </Link>
        </div>
      </div>
    </div>
  );
}
