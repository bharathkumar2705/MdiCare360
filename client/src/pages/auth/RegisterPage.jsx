import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services';
import toast from 'react-hot-toast';

export default function RegisterPage({ isDoctor = false }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const pwd = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fn = isDoctor ? authService.registerDoctor : authService.register;
      const cleanData = { ...data };
      if (!cleanData.phone) delete cleanData.phone;
      if (!cleanData.registrationNumber) delete cleanData.registrationNumber;
      if (isDoctor && cleanData.experience !== undefined) {
        cleanData.experience = parseInt(cleanData.experience, 10) || 0;
      }
      const payload = { ...cleanData, role: isDoctor ? 'DOCTOR' : 'PATIENT' };
      const res = await fn(payload);
      setRegisteredEmail(data.email);
      setSuccess(true);
      toast.success(res.data?.message || 'Registration successful! Verification email sent.');
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.map((e) => e.message).join(', ') ||
        err.response?.data?.message ||
        'Registration failed.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      const res = await authService.resendVerification(registeredEmail);
      toast.success(res.data?.message || 'New verification email dispatched!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A1628, #003380)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 48, maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Verify Your Email</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
          We sent a secure activation link to:
        </p>
        <p style={{ fontWeight: 700, color: '#0A1628', fontSize: 16, marginBottom: 24, wordBreak: 'break-all' }}>
          {registeredEmail}
        </p>
        <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 24, textAlign: 'left', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          💡 <strong>Next Steps:</strong>
          <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
            <li>Open your email inbox and click the <strong>Verify Email Address</strong> button.</li>
            <li>Check your Spam / Junk folder if you do not see it within 2 minutes.</li>
          </ul>
        </div>

        <button
          onClick={handleResend}
          disabled={resending}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 12, display: 'block', textAlign: 'center' }}
        >
          {resending ? 'Sending...' : 'Didn’t receive the email? Resend'}
        </button>

        <Link to="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
          Go to Sign In
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A1628, #003380)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 48px' }}>
      <div style={{ width: '100%', maxWidth: isDoctor ? 600 : 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>MediCare360</h1>
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          {/* Role Switcher Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 24 }}>
            <Link
              to="/register"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: !isDoctor ? 800 : 600,
                fontSize: 14,
                background: !isDoctor ? 'white' : 'transparent',
                color: !isDoctor ? '#0052cc' : '#64748b',
                boxShadow: !isDoctor ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              🧑‍🦱 Patient Account
            </Link>
            <Link
              to="/register/doctor"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: isDoctor ? 800 : 600,
                fontSize: 14,
                background: isDoctor ? 'white' : 'transparent',
                color: isDoctor ? '#0052cc' : '#64748b',
                boxShadow: isDoctor ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              👨‍⚕️ Doctor Account
            </Link>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {isDoctor ? '👨‍⚕️ Doctor Registration' : '🙋 Patient Registration'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
            {isDoctor ? 'Join MediCare360 as a certified healthcare provider' : 'Create your digital healthcare account in 2 minutes'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={isDoctor ? 'form-row' : ''}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Dr. First Last" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
                {errors.name && <p className="form-error">⚠ {errors.name.message}</p>}
              </div>
              {isDoctor && (
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+91 98765 43210" {...register('phone')} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com" {...register('email', { required: 'Email required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
              {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
            </div>

            {isDoctor && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization <span className="required">*</span></label>
                  <input className={`form-input ${errors.specialization ? 'error' : ''}`} placeholder="e.g. Cardiology" {...register('specialization', { required: 'Specialization required' })} />
                  {errors.specialization && <p className="form-error">⚠ {errors.specialization.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience <span className="required">*</span></label>
                  <input className="form-input" type="number" min="0" max="60" placeholder="e.g. 5" {...register('experience', { required: 'Required', min: 0 })} />
                </div>
              </div>
            )}

            {isDoctor && (
              <div className="form-group">
                <label className="form-label">Medical Registration Number</label>
                <input className="form-input" placeholder="MCI/State Council Registration" {...register('registrationNumber')} />
                <p className="form-hint">You will need to upload supporting documents for verification.</p>
              </div>
            )}

            <div className={isDoctor ? 'form-row' : ''}>
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input className={`form-input ${errors.password ? 'error' : ''}`} type="password" placeholder="Min 8 chars, uppercase, number" {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Need uppercase, lowercase & number' } })} />
                {errors.password && <p className="form-error">⚠ {errors.password.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required">*</span></label>
                <input className={`form-input ${errors.confirmPassword ? 'error' : ''}`} type="password" placeholder="Repeat password" {...register('confirmPassword', { required: 'Required', validate: (v) => v === pwd || 'Passwords do not match' })} />
                {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword.message}</p>}
              </div>
            </div>

            {isDoctor && (
              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                <span>ℹ️</span>
                <p style={{ fontSize: 13 }}>Your account will be reviewed by our team after registration. You can start configuring your profile while verification is in progress.</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? 'Creating account...' : isDoctor ? 'Register as Doctor' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
            </p>
            {!isDoctor && (
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                Healthcare provider?{' '}
                <Link to="/register/doctor" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Register as Doctor</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
