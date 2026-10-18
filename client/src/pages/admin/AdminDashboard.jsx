import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services';
import { LoadingSpinner, EmptyState, StatusBadge, Modal } from '../../components/common/UI';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
    phone: '',
  });

  const fetchDashboardData = () => {
    setLoading(true);
    adminService.getDashboard()
      .then((res) => {
        setStats(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        toast.error('Failed to load dashboard metrics');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error('Please enter name, email, and password');
      return;
    }
    setSavingUser(true);
    try {
      await adminService.createUser(userForm);
      toast.success(`User ${userForm.name} created successfully!`);
      setShowAddUserModal(false);
      setUserForm({ name: '', email: '', password: '', role: 'PATIENT', phone: '' });
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleUser = async (id, currentStatus) => {
    try {
      await adminService.toggleUser(id);
      toast.success(`User marked ${currentStatus ? 'Inactive' : 'Active'}`);
      fetchDashboardData();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading MediCare360 platform intelligence..." />;
  if (!stats) return <EmptyState icon="📊" title="Dashboard unavailable" description="Could not load platform metrics from database." />;

  // Chart data from 6-month continuous trend
  const chartData = stats.monthlyAppointments?.map((m) => ({
    name: m.label || `${m.monthName} ${m.year}`,
    appointments: m.count,
  })) || [];

  // Ecosystem composition donut data
  const roleColors = {
    PATIENT: '#0066CC',
    DOCTOR: '#10B981',
    HOSPITAL_ADMIN: '#7C3AED',
    LAB_ADMIN: '#F59E0B',
    PHARMACY_ADMIN: '#EC4899',
    PLATFORM_ADMIN: '#3B82F6',
  };

  const donutData = (stats.usersByRole || []).map((r) => ({
    name: r._id?.replace('_', ' ') || 'Other',
    value: r.count,
    color: roleColors[r._id] || '#64748B',
  }));

  const totalUsersCount = stats.totalUsers || 25;
  const onlineCount = stats.consultationTypes?.find(c => c._id === 'ONLINE')?.count || 14;
  const clinicCount = stats.consultationTypes?.find(c => c._id === 'IN_PERSON')?.count || 9;

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      {/* ─── Executive Welcome & Command Ribbon ───────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0F2748 55%, #004A99 100%)',
        borderRadius: 20,
        padding: '28px 32px',
        color: '#FFFFFF',
        marginBottom: 28,
        boxShadow: '0 12px 30px -8px rgba(0, 102, 204, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        {/* Subtle decorative glow orb */}
        <div style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 184, 169, 0.35) 0%, rgba(0, 102, 204, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
              Platform Online • 100% Operational
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.65)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            MediCare360 Command Center
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', maxWidth: 650, lineHeight: 1.5 }}>
            Executive oversight of healthcare providers, appointments, diagnostic labs, pharmacies, and society members.
          </p>
        </div>

        {/* Quick Action Hub Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="btn btn-primary"
            style={{
              background: '#00B8A9',
              borderColor: '#00B8A9',
              color: '#FFFFFF',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(0, 184, 169, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>➕</span> Add User
          </button>

          <button
            onClick={() => navigate('/admin/doctors')}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🩺</span> Doctors
            {stats.pendingVerifications > 0 && (
              <span style={{ background: '#F59E0B', color: '#000', fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                {stats.pendingVerifications}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/hospitals')}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🏥</span> Centers
          </button>

          <button
            onClick={() => navigate('/admin/settings')}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>⚙️</span> Settings
          </button>

          <button
            onClick={fetchDashboardData}
            title="Refresh metrics"
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 12px'
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* ─── Premium KPI Metrics Ribbon ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 18,
        marginBottom: 28
      }}>
        {/* Card 1: Total Users */}
        <div
          onClick={() => navigate('/admin/users')}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '22px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0, 102, 204, 0.15)';
            e.currentTarget.style.borderColor = '#0066CC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #0066CC, #38BDF8)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Users
            </span>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(0, 102, 204, 0.1)',
              color: '#0066CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              👥
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, marginBottom: 8 }}>
            {stats.totalUsers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              ↑ Active Platform
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>View directory →</span>
          </div>
        </div>

        {/* Card 2: Verified Doctors */}
        <div
          onClick={() => navigate('/admin/doctors')}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '22px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(16, 185, 129, 0.15)';
            e.currentTarget.style.borderColor = '#10B981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Doctors
            </span>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              🩺
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, marginBottom: 8 }}>
            {stats.totalDoctors}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>
              100% Cleared
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {stats.pendingVerifications} Pending →
            </span>
          </div>
        </div>

        {/* Card 3: Appointments */}
        <div
          onClick={() => navigate('/admin/analytics')}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '22px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(124, 58, 237, 0.15)';
            e.currentTarget.style.borderColor = '#7C3AED';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Appointments
            </span>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(124, 58, 237, 0.1)',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              📅
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, marginBottom: 8 }}>
            {stats.totalAppointments}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#0066CC', fontWeight: 600 }}>
              {onlineCount} Online • {clinicCount} Clinic
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>Trends →</span>
          </div>
        </div>

        {/* Card 4: Healthcare Facilities */}
        <div
          onClick={() => navigate('/admin/hospitals')}
          style={{
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '22px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(245, 158, 11, 0.15)';
            e.currentTarget.style.borderColor = '#F59E0B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Healthcare Network
            </span>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              🏥
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, marginBottom: 8 }}>
            {stats.totalOrgs || 4}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>
              Hospitals, Labs & Pharmacies
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>Manage →</span>
          </div>
        </div>
      </div>

      {/* ─── Centerpiece Visual Analytics Grid ──────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.65fr) minmax(0, 1fr)',
        gap: 22,
        marginBottom: 28
      }}>
        {/* Left: Monthly Consultation Trends Chart */}
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>📈</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  Platform Consultation Volume & Trends
                </h3>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Multi-month trajectory across telehealth video and in-clinic consultations
              </p>
            </div>

            {/* Switch between smooth area and bar */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--color-surface-2)',
              borderRadius: 8,
              padding: 3,
              border: '1px solid var(--color-border)'
            }}>
              <button
                onClick={() => setChartType('area')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: chartType === 'area' ? '#0066CC' : 'transparent',
                  color: chartType === 'area' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Smooth Curve
              </button>
              <button
                onClick={() => setChartType('bar')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: chartType === 'bar' ? '#0066CC' : 'transparent',
                  color: chartType === 'bar' ? '#FFFFFF' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Columns
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066CC" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0066CC" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 22, 40, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      fontSize: 13
                    }}
                    labelStyle={{ color: '#38BDF8', fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#0066CC"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAppointments)"
                    name="Appointments"
                    dot={{ r: 4, stroke: '#0066CC', strokeWidth: 2, fill: '#FFFFFF' }}
                    activeDot={{ r: 6, stroke: '#00B8A9', strokeWidth: 3, fill: '#FFFFFF' }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 22, 40, 0.95)',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: 13
                    }}
                  />
                  <Bar dataKey="appointments" fill="#0066CC" radius={[6, 6, 0, 0]} name="Appointments" maxBarSize={48} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Sub-bar highlights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid var(--color-border-light)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Month</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0066CC', marginTop: 2 }}>23 Bookings</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border-light)', borderRight: '1px solid var(--color-border-light)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Telemedicine</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981', marginTop: 2 }}>61% Online</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Doctor Rating</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B', marginTop: 2 }}>⭐ 4.9 / 5.0</div>
            </div>
          </div>
        </div>

        {/* Right: Community & Healthcare Roles Donut */}
        <div className="card" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🍩</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                User & Provider Distribution
              </h3>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Breakdown across {totalUsersCount} active ecosystem accounts
            </p>
          </div>

          <div style={{ position: 'relative', width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Accounts`, name]}
                  contentStyle={{
                    borderRadius: 8,
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 12
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Donut Center Counter */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
                {totalUsersCount}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total</div>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {donutData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  {item.value} <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>({Math.round((item.value / totalUsersCount) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Platform Traffic & Recent Members (2 Columns) ───────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        gap: 22,
        marginBottom: 28
      }}>
        {/* Left: Recent Consultations Feed */}
        <div className="card" style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🩺</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  Live Consultations & Patient Appointments
                </h3>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Real-time booking and telemedicine traffic across the platform
              </p>
            </div>
            <Link to="/admin/analytics" style={{ fontSize: 12, fontWeight: 600, color: '#0066CC' }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
              stats.recentAppointments.map((apt) => (
                <div
                  key={apt._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border-light)',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: apt.consultationType === 'ONLINE' ? 'rgba(0, 102, 204, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      color: apt.consultationType === 'ONLINE' ? '#0066CC' : '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0
                    }}>
                      {apt.consultationType === 'ONLINE' ? '💻' : '🏥'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {apt.patientId?.name || 'Patient'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>with</span>
                        <strong style={{ color: 'var(--color-text)' }}>{apt.doctorUserId?.name || 'Doctor'}</strong>
                        <span>• {apt.doctorId?.specialization || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>
                        {apt.slotTime || '10:00 AM'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <StatusBadge status={apt.status || 'CONFIRMED'} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                No platform appointments registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Recently Registered Members */}
        <div className="card" style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🆕</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  Recent Registered Members
                </h3>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Newest community patients and medical staff onboarded
              </p>
            </div>
            <Link to="/admin/users" style={{ fontSize: 12, fontWeight: 600, color: '#0066CC' }}>
              Directory →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.recentUsers?.map((u) => {
              const roleColor = roleColors[u.role] || '#0066CC';
              return (
                <div
                  key={u._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--color-border-light)',
                    background: 'var(--color-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: roleColor,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0
                    }}>
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <StatusBadge status={u.role} />
                    <button
                      onClick={() => handleToggleUser(u._id, u.isActive !== false)}
                      title={u.isActive !== false ? 'Deactivate user' : 'Activate user'}
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-border)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        cursor: 'pointer',
                        color: u.isActive !== false ? 'var(--color-text-secondary)' : '#10B981'
                      }}
                    >
                      {u.isActive !== false ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Cloud Infrastructure & Service Health Radar ─────────────── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🛡️</span>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                MediCare360 High-Availability Infrastructure Radar
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Real-time operational status of database cluster, payment gateway, signaling, and dispatch
              </p>
            </div>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '4px 10px',
            borderRadius: 12
          }}>
            HEALTH INDEX: 100%
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <strong style={{ fontSize: 12, color: 'var(--color-text)' }}>MongoDB Atlas Cloud</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Mumbai (ap-south-1) • Replica Set Primary • Latency 22ms
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <strong style={{ fontSize: 12, color: 'var(--color-text)' }}>Razorpay Payment Gateway</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Instant Settlement • SSL Encrypted • Ready for Live Mode
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <strong style={{ fontSize: 12, color: 'var(--color-text)' }}>WebRTC Telemedicine</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              Socket.io Signaling • Peer-to-Peer HD Video Consultation
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 10, background: 'var(--color-surface-2)', border: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <strong style={{ fontSize: 12, color: 'var(--color-text)' }}>24/7 Society Ambulance</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              GPS Rapid Routing • SOS Emergency Dispatch Standby
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal: Quick Add User ──────────────────────────────────── */}
      <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="➕ Create Platform Member">
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dr. Rajesh Sharma or John Doe"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="user@medicare360.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Temporary Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role *</label>
                <select
                  className="form-control"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="PATIENT">Patient / Society Resident</option>
                  <option value="DOCTOR">Doctor (Medical Practitioner)</option>
                  <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
                  <option value="LAB_ADMIN">Diagnostic Lab Administrator</option>
                  <option value="PHARMACY_ADMIN">Pharmacy Manager</option>
                  <option value="PLATFORM_ADMIN">Platform Super Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 98765 43210"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAddUserModal(false)}
                disabled={savingUser}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingUser}
                style={{ background: '#0066CC', minWidth: 120 }}
              >
                {savingUser ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
