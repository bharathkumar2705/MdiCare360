import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../../services';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const [docRes, revRes] = await Promise.all([
          doctorService.getById(id),
          doctorService.getReviews(id, { limit: 10 }).catch(() => ({ data: { data: [] } })),
        ]);
        setDoctor(docRes.data.data);
        setReviews(revRes.data?.data || []);
      } catch (err) {
        toast.error('Failed to load doctor profile.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2>Doctor Not Found</h2>
        <p style={{ color: '#64748B' }}>The requested doctor profile is unavailable or inactive.</p>
        <Link to="/patient/doctors" className="btn btn-primary" style={{ marginTop: 16 }}>
          Find Another Doctor
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner Card */}
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: 32,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284C7, #0369A1)',
              color: 'white',
              fontSize: 34,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {doctor.userId?.name?.[0] || 'D'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {doctor.userId?.name || 'Doctor'}
              </h1>
              {doctor.verificationStatus === 'VERIFIED' && (
                <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                  ✓ Verified Practitioner
                </span>
              )}
            </div>
            <p style={{ color: '#0284C7', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>
              {doctor.specialization}
            </p>
            <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
              ⏱️ {doctor.experience} Years Experience • ⭐ {doctor.rating || '5.0'} ({doctor.reviewCount || 10} reviews)
            </p>
          </div>
        </div>

        {/* Pricing & Booking CTA */}
        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>Video Teleconsultation</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>₹{doctor.consultationFeeOnline || 600}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>In-Clinic Consultation</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>₹{doctor.consultationFeeInPerson || 800}</span>
          </div>
          <Link
            to={`/patient/appointments/book/${doctor._id}`}
            className="btn btn-primary"
            style={{ width: '100%', textAlign: 'center', padding: '12px', fontSize: 15, fontWeight: 700, marginTop: 4 }}
          >
            📅 Book Appointment Now
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Bio & Education */}
        <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px', color: '#0F172A' }}>
            About Practitioner
          </h3>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>
            {doctor.bio || `${doctor.userId?.name} is a dedicated ${doctor.specialization} specialist committed to delivering evidence-based patient care.`}
          </p>

          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
            🎓 Medical Qualifications
          </h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
            {doctor.qualifications?.length > 0 ? (
              doctor.qualifications.map((q, i) => (
                <li key={i}>{q.degree} — {q.institution} ({q.year})</li>
              ))
            ) : (
              <li>MBBS, MD ({doctor.specialization})</li>
            )}
          </ul>

          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '18px 0 8px' }}>
            🌐 Languages Spoken
          </h4>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
            {doctor.languages?.join(', ') || 'English, Hindi'}
          </p>
        </div>

        {/* Patient Reviews */}
        <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Patient Reviews ({reviews.length})
            </h3>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0284C7' }}>
              ⭐ {doctor.rating || '5.0'} / 5.0
            </span>
          </div>

          {reviews.length === 0 ? (
            <p style={{ color: '#64748B', fontSize: 14 }}>No reviews yet for this doctor.</p>
          ) : (
            <div style={{ display: 'grid', gap: 14, maxHeight: 360, overflowY: 'auto' }}>
              {reviews.map((rev) => (
                <div key={rev._id} style={{ padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
                      {rev.isAnonymous ? 'Verified Patient' : rev.patientId?.name || 'Verified Patient'}
                    </span>
                    <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700 }}>
                      {'⭐'.repeat(rev.rating || 5)}
                    </span>
                  </div>
                  <p style={{ color: '#475569', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    "{rev.comment || 'Very professional, attentive, and helpful diagnosis.'}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}