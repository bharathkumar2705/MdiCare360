import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { markAllRead, markRead } from '../../store/slices/notificationSlice';
import { logout } from '../../store/slices/authSlice';
import { notificationService, authService } from '../../services';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuToggle }) {
  const { user } = useSelector((s) => s.auth);
  const { items, unreadCount } = useSelector((s) => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAll = async () => {
    dispatch(markAllRead());
    await notificationService.markAllRead();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    }
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) return parts[1].charAt(0).toUpperCase() + parts[1].slice(1).replace(/-/g, ' ');
    return 'Dashboard';
  };

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const getRolePrefix = (role) => {
    switch (role) {
      case 'PLATFORM_ADMIN':
      case 'HOSPITAL_ADMIN':
        return 'admin';
      case 'DOCTOR':
        return 'doctor';
      case 'LAB':
        return 'lab';
      case 'PHARMACY':
        return 'pharmacy';
      case 'PATIENT':
      default:
        return 'patient';
    }
  };

  const rolePrefix = getRolePrefix(user?.role);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          ☰
        </button>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>{getPageTitle()}</h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="notif-btn" onClick={() => setShowNotifs((v) => !v)} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
              width: 380, zIndex: 200, animation: 'slideDown 150ms ease',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAll} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {items.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>No notifications</p>
                  </div>
                ) : items.slice(0, 8).map((n) => (
                  <div key={n._id}
                    onClick={() => { dispatch(markRead(n._id)); notificationService.markRead(n._id); if (n.link) navigate(n.link); setShowNotifs(false); }}
                    style={{
                      padding: '14px 20px', borderBottom: '1px solid var(--color-border-light)',
                      cursor: 'pointer', background: n.isRead ? 'transparent' : 'var(--color-primary-light)',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', marginTop: 6, flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 2 }}>{n.title}</p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.message}</p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                          {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 30,
              transition: 'background 150ms ease',
            }}
          >
            <div className="avatar avatar-sm" style={{ background: 'var(--color-primary)', color: 'white', fontWeight: 700 }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.name)}
            </div>
            <div style={{ textAlign: 'left', display: 'none' }} className="navbar-user-info">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{user?.name || 'Account'}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')?.toLowerCase()}</div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>▾</span>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              width: 240,
              zIndex: 200,
              overflow: 'hidden',
              animation: 'slideDown 150ms ease',
            }}>
              {/* User Header */}
              <div style={{ padding: '16px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-text)' }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </div>
                <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: 10, textTransform: 'uppercase' }}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              {/* Links */}
              <div style={{ padding: '8px 0' }}>
                <button
                  onClick={() => { setShowUserMenu(false); navigate(`/${rolePrefix}/profile`); }}
                  style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text)', textAlign: 'left' }}
                >
                  <span>👤</span>
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); navigate(`/${rolePrefix}/settings`); }}
                  style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text)', textAlign: 'left' }}
                >
                  <span>⚙️</span>
                  <span>Account Settings</span>
                </button>
              </div>

              {/* Logout Button */}
              <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    border: 'none',
                    background: '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 8,
                    textAlign: 'left',
                  }}
                >
                  <span>🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
