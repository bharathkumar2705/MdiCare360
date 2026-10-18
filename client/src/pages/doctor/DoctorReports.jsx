import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DoctorReports() {
  const [reports, setReports] = useState([
    {
      id: 'rep-01',
      patientName: 'Rajesh Sharma',
      patientPhone: '+91 98451 22345',
      testName: 'Complete Lipid Profile & Serum Cholesterol',
      category: 'Biochemistry',
      date: '17 Oct 2026',
      status: 'Reviewed',
      flag: 'Abnormal',
      flagColor: '#EF4444',
      metrics: [
        { parameter: 'Total Cholesterol', result: '242 mg/dL', normal: '< 200 mg/dL', status: 'High' },
        { parameter: 'Triglycerides', result: '190 mg/dL', normal: '< 150 mg/dL', status: 'High' },
        { parameter: 'HDL (Good)', result: '42 mg/dL', normal: '> 40 mg/dL', status: 'Normal' },
        { parameter: 'LDL (Bad)', result: '162 mg/dL', normal: '< 100 mg/dL', status: 'High' },
      ],
      doctorNote: 'Advised Atorvastatin 10mg and dietary fat restrictions. Recheck in 6 weeks.',
    },
    {
      id: 'rep-02',
      patientName: 'Vikram Patel',
      patientPhone: '+91 99801 33412',
      testName: 'Glycated Hemoglobin (HbA1c) & Fasting Blood Sugar',
      category: 'Diabetes Care',
      date: '15 Oct 2026',
      status: 'Pending Review',
      flag: 'Attention Required',
      flagColor: '#F59E0B',
      metrics: [
        { parameter: 'HbA1c', result: '7.8 %', normal: '< 5.7 % (Normal), < 7.0 % (Target)', status: 'Elevated' },
        { parameter: 'Fasting Blood Sugar', result: '142 mg/dL', normal: '70 - 100 mg/dL', status: 'High' },
      ],
      doctorNote: '',
    },
    {
      id: 'rep-03',
      patientName: 'Ananya Reddy',
      patientPhone: '+91 94412 88910',
      testName: 'Complete Blood Count (CBC) & ESR',
      category: 'Hematology',
      date: '12 Oct 2026',
      status: 'Reviewed',
      flag: 'Normal',
      flagColor: '#10B981',
      metrics: [
        { parameter: 'Hemoglobin', result: '13.4 g/dL', normal: '12.0 - 15.5 g/dL', status: 'Normal' },
        { parameter: 'WBC Total Count', result: '7,200 /mcL', normal: '4,500 - 11,000 /mcL', status: 'Normal' },
        { parameter: 'Platelet Count', result: '280,000 /mcL', normal: '150,000 - 450,000 /mcL', status: 'Normal' },
      ],
      doctorNote: 'All hematological parameters within healthy physiological limits.',
    },
  ]);

  const [activeNoteReport, setActiveNoteReport] = useState(null);
  const [noteText, setNoteText] = useState('');

  const handleSaveNote = (id) => {
    if (!noteText.trim()) return;
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, doctorNote: noteText, status: 'Reviewed' } : r))
    );
    toast.success('Clinical impression saved and synchronized to patient EHR!');
    setActiveNoteReport(null);
    setNoteText('');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          Diagnostic Lab Reports & Pathology EHR
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          Review diagnostic lab results, flag critical biomarkers, and document clinical recommendations.
        </p>
      </div>

      {/* Reports Listing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {reports.map((report) => (
          <div
            key={report.id}
            style={{
              background: 'white',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{report.testName}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: report.flagColor === '#10B981' ? '#DEF7EC' : report.flagColor === '#EF4444' ? '#FEE2E2' : '#FEF3C7',
                      color: report.flagColor === '#10B981' ? '#03543F' : report.flagColor === '#EF4444' ? '#991B1B' : '#92400E',
                    }}
                  >
                    ● {report.flag}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Patient: <strong style={{ color: '#0F172A' }}>{report.patientName}</strong> ({report.patientPhone}) • Test Date: {report.date}
                </div>
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: report.status === 'Reviewed' ? '#F1F5F9' : '#FEF3C7',
                  color: report.status === 'Reviewed' ? '#475569' : '#B45309',
                }}
              >
                {report.status}
              </span>
            </div>

            {/* Test Metrics Table */}
            <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 16px', color: '#475569', fontWeight: 600 }}>Parameter</th>
                    <th style={{ padding: '10px 16px', color: '#475569', fontWeight: 600 }}>Observed Value</th>
                    <th style={{ padding: '10px 16px', color: '#475569', fontWeight: 600 }}>Reference Biological Range</th>
                    <th style={{ padding: '10px 16px', color: '#475569', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.metrics.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #EEF2F6' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0F172A' }}>{m.parameter}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: m.status !== 'Normal' ? '#DC2626' : '#16A34A' }}>{m.result}</td>
                      <td style={{ padding: '10px 16px', color: '#64748B' }}>{m.normal}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: m.status !== 'Normal' ? '#DC2626' : '#16A34A' }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Doctor Observation / Note */}
            {report.doctorNote ? (
              <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '12px 16px', border: '1px solid #BFDBFE', fontSize: 13, marginBottom: 16 }}>
                <strong style={{ color: '#1D4ED8' }}>👨‍⚕️ Your Clinical Impression:</strong>{' '}
                <span style={{ color: '#1E3A8A' }}>{report.doctorNote}</span>
              </div>
            ) : null}

            {/* Actions */}
            {activeNoteReport === report.id ? (
              <div style={{ marginTop: 12 }}>
                <textarea
                  rows={3}
                  placeholder="Enter clinical impression and advice for patient..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => handleSaveNote(report.id)} className="btn btn-primary" style={{ fontSize: 13, padding: '6px 14px' }}>
                    Save & Notify Patient
                  </button>
                  <button onClick={() => setActiveNoteReport(null)} className="btn btn-outline" style={{ fontSize: 13, padding: '6px 14px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => {
                    setActiveNoteReport(report.id);
                    setNoteText(report.doctorNote || '');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: 13, padding: '6px 14px' }}
                >
                  {report.doctorNote ? '✏️ Edit Impression' : '📝 Add Clinical Impression'}
                </button>
                <button
                  onClick={() => toast.success('Diagnostic PDF report downloaded.')}
                  className="btn btn-outline"
                  style={{ fontSize: 13, padding: '6px 14px' }}
                >
                  📥 Download Report PDF
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
