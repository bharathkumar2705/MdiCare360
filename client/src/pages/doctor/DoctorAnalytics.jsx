import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function DoctorAnalytics() {
  const [timeRange, setTimeRange] = useState('6M');

  // Consultation volume trends
  const consultationTrends = [
    { month: 'May 2026', total: 42, online: 26, inPerson: 16 },
    { month: 'Jun 2026', total: 58, online: 34, inPerson: 24 },
    { month: 'Jul 2026', total: 72, online: 45, inPerson: 27 },
    { month: 'Aug 2026', total: 84, online: 52, inPerson: 32 },
    { month: 'Sep 2026', total: 95, online: 60, inPerson: 35 },
    { month: 'Oct 2026', total: 110, online: 72, inPerson: 38 },
  ];

  // Consultation mode split
  const modeData = [
    { name: 'Online Telemedicine (Video)', value: 65, color: '#2563EB' },
    { name: 'In-Clinic OPD Consultation', value: 35, color: '#10B981' },
  ];

  // Top Diagnosis
  const diagnosisData = [
    { condition: 'Hypertension & Vitals', count: 48 },
    { condition: 'Type 2 Diabetes', count: 36 },
    { condition: 'Allergic Rhinitis / Sinusitis', count: 28 },
    { condition: 'Seasonal Viral / URTI', count: 22 },
    { condition: 'Routine Health Checkup', count: 18 },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Practice Analytics & Clinical Insights
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Detailed metrics on patient volumes, telemedicine adoption, clinical diagnoses, and care outcomes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 4, borderRadius: 10 }}>
          {['1M', '3M', '6M', '1Y'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: timeRange === t ? 'white' : 'transparent',
                color: timeRange === t ? '#0F172A' : '#64748B',
                boxShadow: timeRange === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Total Consultations</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>461</div>
          <div style={{ fontSize: 12, color: '#16A34A', marginTop: 4, fontWeight: 600 }}>↑ 22% quarter-on-quarter</div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Patient Satisfaction Rating</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>4.92 ★</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Based on 184 verified patient reviews</div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Telemedicine Video Adherence</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>98.4%</div>
          <div style={{ fontSize: 12, color: '#2563EB', marginTop: 4, fontWeight: 600 }}>Zero audio/video dropouts</div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Average Consultation Time</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#10B981', marginTop: 4 }}>18 mins</div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 600 }}>High attention per patient</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Monthly Consultation Growth */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>
            Consultation Volumes by Mode
          </div>
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
            Telemedicine vs In-Clinic visits over the past 6 months.
          </p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="online" fill="#2563EB" name="Online Video" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inPerson" fill="#10B981" name="In-Person Clinic" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Telemedicine vs Clinic Split */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>
            Consultation Channel Share
          </div>
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
            Percentage of patients choosing video telemedicine vs physical clinic.
          </p>
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modeData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {modeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
            {modeData.map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: m.color }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{m.name}:</span>
                <span style={{ color: '#64748B' }}>{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Common Diagnoses Bar */}
      <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>
          Most Frequent Clinical Diagnoses
        </div>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>
          Primary diagnostic tags recorded in patient SOAP charts across all appointments.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {diagnosisData.map((d) => {
            const percentage = Math.round((d.count / 48) * 100);
            return (
              <div key={d.condition}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <strong style={{ color: '#0F172A' }}>{d.condition}</strong>
                  <span style={{ color: '#64748B' }}>{d.count} patients ({percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #0284C7, #2563EB)', borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
