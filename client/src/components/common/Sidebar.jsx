import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { markAllRead } from '../../store/slices/notificationSlice';
import { authService, notificationService } from '../../services';
import toast from 'react-hot-toast';

const PATIENT_MENU = [
  { section: 'Main', items: [
    { path: '/patient/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/patient/doctors', icon: '🔍', label: 'Find Doctors' },
    { path: '/patient/appointments', icon: '📅', label: 'Appointments' },
  ]},
  { section: 'Health', items: [
    { path: '/patient/medical-records', icon: '📋', label: 'Medical Records' },
    { path: '/patient/documents', icon: '📁', label: 'Documents' },
    { path: '/patient/prescriptions', icon: '💊', label: 'Prescriptions' },
    { path: '/patient/health', icon: '📈', label: 'Health Tracking' },
  ]},
  { section: 'Services', items: [
    { path: '/patient/labs', icon: '🧪', label: 'Lab Tests' },
    { path: '/patient/pharmacy', icon: '🏥', label: 'Pharmacy' },
    { path: '/patient/payments', icon: '💳', label: 'Payments' },
  ]},
  { section: 'Account', items: [
    { path: '/patient/messages', icon: '💬', label: 'Messages' },
    { path: '/patient/insurance', icon: '🛡️', label: 'Insurance' },
    { path: '/patient/consent', icon: '🔐', label: 'Consent' },
    { path: '/patient/profile', icon: '👤', label: 'Profile' },
    { path: '/patient/settings', icon: '⚙️', label: 'Settings' },
  ]},
];

const DOCTOR_MENU = [
  { section: 'Main', items: [
    { path: '/doctor/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/doctor/appointments', icon: '📅', label: 'Appointments' },
    { path: '/doctor/patients', icon: '👥', label: 'My Patients' },
    { path: '/doctor/consultations', icon: '🩺', label: 'Consultations' },
  ]},
  { section: 'Clinical', items: [
    { path: '/doctor/prescriptions', icon: '💊', label: 'Prescriptions' },
    { path: '/doctor/reports', icon: '📋', label: 'Lab Reports' },
    { path: '/doctor/availability', icon: '🕐', label: 'Availability' },
  ]},
  { section: 'Business', items: [
    { path: '/doctor/earnings', icon: '💰', label: 'Earnings' },
    { path: '/doctor/analytics', icon: '📊', label: 'Analytics' },
  ]},
  { section: 'Account', items: [
    { path: '/doctor/messages', icon: '💬', label: 'Messages' },
    { path: '/doctor/verification', icon: '✅', label: 'Verification' },
    { path: '/doctor/settings', icon: '⚙️', label: 'Settings' },
  ]},
];

const ADMIN_MENU = [
  { section: 'Platform', items: [
    { path: '/admin/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/doctors', icon: '🩺', label: 'Doctors' },
    { path: '/admin/hospitals', icon: '🏥', label: 'Hospitals' },
    { path: '/admin/labs', icon: '🧪', label: 'Labs' },
    { path: '/admin/pharmacies', icon: '💊', label: 'Pharmacies' },
  ]},
  { section: 'System & Security', items: [
    { path: '/admin/analytics', icon: '📊', label: 'Analytics' },
    { path: '/admin/audit-logs', icon: '🔍', label: 'Audit Logs' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ]},
];

const LAB_MENU = [
  { section: 'Lab', items: [
    { path: '/lab/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/lab/bookings', icon: '📅', label: 'Bookings' },
    { path: '/lab/tests', icon: '🧪', label: 'Test Catalog' },
    { path: '/lab/reports', icon: '📋', label: 'Reports' },
  ]},
];

const PHARMACY_MENU = [
  { section: 'Pharmacy', items: [
    { path: '/pharmacy/dashboard', icon: '⊞', label: 'Dashboard' },
    { path: '/pharmacy/orders', icon: '📦', label: 'Orders' },
    { path: '/pharmacy/inventory', icon: '💊', label: 'Inventory' },
  ]},
];

const MENU_MAP = {
  PATIENT: PATIENT_MENU,
  DOCTOR: DOCTOR_MENU,
  PLATFORM_ADMIN: ADMIN_MENU,
  LAB: LAB_MENU,
  PHARMACY: PHARMACY_MENU,
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const menu = MENU_MAP[user?.role] || [];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const getInitials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">MediCare360</div>
          <div className="sidebar-logo-sub">Your Healthcare, Connected.</div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {menu.map(({ section, items }) => (
            <div key={section} className="sidebar-section">
              <div className="sidebar-section-label">{section}</div>
              {items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                const showBadge = item.label === 'Messages' && unreadCount > 0;
                return (
                  <button
                    key={item.path}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => { navigate(item.path); onClose?.(); }}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {showBadge && <span className="sidebar-item-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name truncate">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 150ms ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
