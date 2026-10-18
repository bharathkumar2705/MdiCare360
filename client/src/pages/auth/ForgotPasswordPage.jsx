import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Password reset instructions sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A1628 0%, #0E2A4A 50%, #003380 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
              MediCare360
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>
              Your Healthcare, Connected.
            </p>
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📬</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Password Reset Email Sent</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                If an account exists with that email address, a password reset link has been dispatched to your inbox.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Forgot Password?</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
                Enter your email address and we’ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none' }}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Link to="/login" style={{ color: 'var(--color-primary, #0284C7)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
