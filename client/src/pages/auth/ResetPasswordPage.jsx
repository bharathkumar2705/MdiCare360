import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async ({ password }) => {
    if (!token) {
      toast.error('Reset token is missing or invalid.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed. Token may have expired.');
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
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Password Reset!</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                Sign In
              </Link>
            </div>
          ) : !token ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Invalid Reset Link</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
                No reset token was found in the link. Please request a new password reset link.
              </p>
              <Link to="/forgot-password" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Reset Password</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 8 characters"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none' }}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Must be at least 8 characters' },
                    })}
                  />
                  {errors.password && (
                    <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Re-enter password"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none' }}
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (val) => val === watch('password') || 'Passwords do not match',
                    })}
                  />
                  {errors.confirmPassword && (
                    <span style={{ color: '#EF4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
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
