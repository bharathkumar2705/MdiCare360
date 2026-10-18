import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { loginSuccess } from '../../store/slices/authSlice';
import { authService } from '../../services';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const ROLE_ROUTES = {
    PATIENT: '/patient/dashboard', DOCTOR: '/doctor/dashboard',
    PLATFORM_ADMIN: '/admin/dashboard', LAB: '/lab/dashboard',
    PHARMACY: '/pharmacy/dashboard', HOSPITAL_ADMIN: '/hospital/dashboard',
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setUnverifiedEmail(null);
    try {
      const res = await authService.login(data);
      dispatch(loginSuccess(res.data));
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate(ROLE_ROUTES[res.data.user.role] || '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email);
        toast.error('Please verify your email before logging in.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const res = await authService.resendVerification(unverifiedEmail);
      toast.success(res.data?.message || 'New verification link dispatched to your inbox!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0A1628 0%, #0E2A4A 50%, #003380 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>MediCare360</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>Your Healthcare, Connected.</p>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>Sign in to your account</p>

          {unverifiedEmail && (
            <div style={{ marginBottom: 20, padding: 14, background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: '#92400E', fontWeight: 600, marginBottom: 6 }}>
                ⚠️ Email Verification Required
              </p>
              <p style={{ fontSize: 12, color: '#78350F', marginBottom: 10, lineHeight: 1.5 }}>
                Your account ({unverifiedEmail}) is not verified yet. Check your inbox for the activation link.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                {resending ? 'Sending email...' : 'Resend verification email to my inbox'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
              />
              {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  style={{ paddingRight: 48 }}
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 18 }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="form-error">⚠ {errors.password.message}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <><span className="spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create account</Link>
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>
              Are you a doctor?{' '}
              <Link to="/register/doctor" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Join as Doctor</Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div style={{ marginTop: 24, padding: 16, background: 'var(--color-surface-2)', borderRadius: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Admin:</span>
                <span style={{ fontFamily: 'monospace' }}>admin@medicare360.com / Admin@12345</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Patient:</span>
                <span style={{ fontFamily: 'monospace' }}>rahul@demo.com / Patient@123</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Doctor:</span>
                <span style={{ fontFamily: 'monospace' }}>dr.priya.sharma@demo.com / Doctor@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
