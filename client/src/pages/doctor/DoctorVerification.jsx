import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doctorService } from '../../services';
import toast from 'react-hot-toast';

const MEDICAL_COUNCILS = [
  'National Medical Commission (NMC / MCI)',
  'Maharashtra Medical Council',
  'Karnataka Medical Council',
  'Tamil Nadu Medical Council',
  'Delhi Medical Council',
  'Andhra Pradesh Medical Council',
  'Telangana State Medical Council',
  'West Bengal Medical Council',
  'Gujarat Medical Council',
  'Other State Medical Council / International Board',
];

export default function DoctorVerification() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const fetchProfile = async () => {
    try {
      const res = await doctorService.getMyProfile();
      setDoctor(res.data.data);
      if (res.data.data) {
        setValue('registrationNumber', res.data.data.registrationNumber || '');
        setValue('registrationCouncil', res.data.data.registrationCouncil || MEDICAL_COUNCILS[0]);
        setValue('degree', res.data.data.qualifications?.[0]?.degree || 'MBBS');
        setValue('institution', res.data.data.qualifications?.[0]?.institution || '');
        setValue('year', res.data.data.qualifications?.[0]?.year || new Date().getFullYear());
        setValue('experience', res.data.data.experience || 0);
        setValue('specialization', res.data.data.specialization || '');
      }
    } catch (err) {
      toast.error('Failed to load verification profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        registrationNumber: data.registrationNumber,
        registrationCouncil: data.registrationCouncil,
        specialization: data.specialization,
        experience: Number(data.experience),
        qualifications: [
          {
            degree: data.degree,
            institution: data.institution,
            year: Number(data.year),
          },
        ],
        verificationStatus: 'UNDER_REVIEW',
      };
      await doctorService.updateProfile(payload);
      toast.success('Credentials submitted! Under review by MediCare360 compliance team.');
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  const status = doctor?.verificationStatus || 'PENDING';

  const STATUS_BADGES = {
    VERIFIED: { bg: '#DEF7EC', color: '#03543F', text: 'Verified Provider', icon: '✅' },
    UNDER_REVIEW: { bg: '#FEF08A', color: '#713F12', text: 'Under Review by Admin', icon: '⏳' },
    REJECTED: { bg: '#FDE8E8', color: '#9B1C1C', text: 'Verification Rejected', icon: '❌' },
    PENDING: { bg: '#F3F4F6', color: '#374151', text: 'Pending Submission', icon: '📝' },
  };

  const badge = STATUS_BADGES[status] || STATUS_BADGES.PENDING;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Medical License Verification
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            In compliance with clinical regulations, all healthcare providers must be verified before seeing patients.
          </p>
        </div>
        <div
          style={{
            padding: '8px 16px',
            borderRadius: 99,
            background: badge.bg,
            color: badge.color,
            fontWeight: 700,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{badge.icon}</span>
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Notice Banner */}
      {status === 'VERIFIED' ? (
        <div style={{ padding: 20, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#166534', margin: '0 0 6px' }}>
            🎉 You are an Officially Verified Practitioner
          </h3>
          <p style={{ color: '#15803D', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Your medical council registration has been verified by the MediCare360 Compliance Board. Your profile is active and visible in public searches.
          </p>
        </div>
      ) : status === 'UNDER_REVIEW' ? (
        <div style={{ padding: 20, background: '#FEF9C3', border: '1px solid #FEF08A', borderRadius: 16, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#854D0E', margin: '0 0 6px' }}>
            ⏳ Credentials Under Verification
          </h3>
          <p style={{ color: '#A16207', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Our compliance officers are verifying your registration number against the medical council registry. You will receive an email notification once approved.
          </p>
        </div>
      ) : status === 'REJECTED' ? (
        <div style={{ padding: 20, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#991B1B', margin: '0 0 6px' }}>
            ❌ Verification Not Approved
          </h3>
          <p style={{ color: '#B91C1C', fontSize: 14, margin: '0 0 8px', lineHeight: 1.5 }}>
            {doctor?.verificationNote || 'Your submitted credentials could not be validated. Please check the details and re-submit.'}
          </p>
          <p style={{ color: '#7F1D1D', fontSize: 13, margin: 0 }}>
            Update your council registration number and degree details below to request a new review.
          </p>
        </div>
      ) : (
        <div style={{ padding: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 16, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E40AF', margin: '0 0 6px' }}>
            📋 Required for Accepting Patients
          </h3>
          <p style={{ color: '#1D4ED8', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            Please submit your official state or national medical council registration details below.
          </p>
        </div>
      )}

      {/* Form Card */}
      <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
            1. Medical Council Registration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                Medical Registration Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g. MMC-2016-04928"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                {...register('registrationNumber', { required: 'Registration number is required' })}
              />
              {errors.registrationNumber && (
                <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {errors.registrationNumber.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                Registration Council <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                {...register('registrationCouncil', { required: 'Please select a council' })}
              >
                {MEDICAL_COUNCILS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '28px 0 20px', borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
            2. Medical Education & Credentials
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                Primary Degree <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g. MBBS, MD - Cardiology"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                {...register('degree', { required: 'Degree is required' })}
              />
              {errors.degree && (
                <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {errors.degree.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                College / University Institution <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g. All India Institute of Medical Sciences"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                {...register('institution', { required: 'Institution is required' })}
              />
              {errors.institution && (
                <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {errors.institution.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                Year of Completion
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 2014"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                {...register('year', { min: 1960, max: new Date().getFullYear() })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                Primary Specialization <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g. Cardiology, Dermatology"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                {...register('specialization', { required: 'Specialization is required' })}
              />
              {errors.specialization && (
                <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {errors.specialization.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' }}>
                Years of Clinical Experience
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 8"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                {...register('experience', { min: 0 })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: 15, fontWeight: 700 }}
            >
              {submitting ? 'Submitting for Review...' : status === 'VERIFIED' ? 'Update Credentials' : 'Submit for Admin Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}