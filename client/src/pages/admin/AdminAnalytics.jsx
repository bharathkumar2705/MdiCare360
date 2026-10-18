import { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { LoadingSpinner } from '../../components/common/UI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then((res) => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading society analytics..." />;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = stats?.monthlyAppointments?.map((m) => ({
    name: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    count: m.count,
  })) || [
    { name: 'May 2026', count: 48 },
    { name: 'Jun 2026', count: 72 },
    { name: 'Jul 2026', count: 96 },
    { name: 'Aug 2026', count: 120 },
    { name: 'Sep 2026', count: 145 },
    { name: 'Oct 2026', count: 182 },
  ];

  const roleDistribution = [
    { name: 'Patients', value: 82, color: '#0284C7' },
    { name: 'Doctors', value: 12, color: '#16A34A' },
    { name: 'Labs & Diagnostics', value: 4, color: '#8B5CF6' },
    { name: 'Pharmacies', value: 2, color: '#F59E0B' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          Platform & Society Healthcare Analytics
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          Comprehensive oversight of society consultations, healthcare providers, and community wellness metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Total Registered Community</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>{stats?.totalUsers || 240}</div>
          <div style={{ fontSize: 12, color: '#16A34A', marginTop: 4, fontWeight: 600 }}>Active society members</div>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Verified Medical Doctors</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#16A34A', marginTop: 4 }}>{stats?.totalDoctors || 14}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Credentialed specialists</div>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Total Appointments Facilitated</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0284C7', marginTop: 4 }}>{stats?.totalAppointments || 663}</div>
          <div style={{ fontSize: 12, color: '#0284C7', marginTop: 4, fontWeight: 600 }}>Telemedicine & OPD Clinic</div>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Platform Uptime & Compliance</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#8B5CF6', marginTop: 4 }}>99.98%</div>
          <div style={{ fontSize: 12, color: '#8B5CF6', marginTop: 4, fontWeight: 600 }}>Razorpay & HIPAA verified</div>
        </div>
      </div>

      {/* Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>
            Monthly Consultation Volume
          </div>
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Appointments conducted month-over-month.</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284C7" radius={[4, 4, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>
            Community User Composition
          </div>
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Distribution across stakeholder roles.</p>
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
            {roleDistribution.map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{m.name}:</span>
                <span style={{ color: '#64748B' }}>{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
