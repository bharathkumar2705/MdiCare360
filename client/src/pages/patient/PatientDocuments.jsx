import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PatientDocuments() {
  const [docs, setDocs] = useState([
    { id: '1', title: 'Comprehensive Blood Work (CBC & Lipid)', type: 'LAB_REPORT', date: '2026-10-10', doctor: 'Dr. Priya Sharma', summary: 'All parameters within normal clinical limits. HDL cholesterol elevated favorably.' },
    { id: '2', title: 'Chest X-Ray Digital Scan', type: 'RADIOLOGY', date: '2026-09-18', doctor: 'Dr. Meera Iyer', summary: 'Clear lung fields with no signs of active infiltration, consolidation or pleural effusion.' },
  ]);
  const [filter, setFilter] = useState('ALL');
  const [uploadModal, setUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('LAB_REPORT');
  const [analyzingId, setAnalyzingId] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newDoc = {
      id: Date.now().toString(),
      title: newTitle,
      type: newType,
      date: new Date().toISOString().split('T')[0],
      doctor: 'Self Uploaded',
      summary: 'Uploaded to digital health locker. Ready for AI clinical summarization.',
    };
    setDocs([newDoc, ...docs]);
    setNewTitle('');
    setUploadModal(false);
    toast.success('Document encrypted and stored in your health locker!');
  };

  const handleAiSummarize = (id) => {
    setAnalyzingId(id);
    setTimeout(() => {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, summary: 'AI Clinical Summary: Biomarkers analyzed. Glycated hemoglobin (HbA1c) 5.6%, Fasting blood glucose 92 mg/dL. Findings indicate stable glycemic control with low cardiovascular risk profile.' }
            : d
        )
      );
      setAnalyzingId(null);
      toast.success('AI Medical Document summary generated!');
    }, 1200);
  };

  const filtered = docs.filter((d) => (filter === 'ALL' ? true : d.type === filter));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Medical Records & Health Locker
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Securely store and share lab tests, discharge summaries, and radiology reports.
          </p>
        </div>
        <button
          onClick={() => setUploadModal(true)}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700 }}
        >
          + Upload Medical Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: 4, borderRadius: 12, width: 'fit-content', marginBottom: 24 }}>
        {['ALL', 'LAB_REPORT', 'RADIOLOGY', 'DISCHARGE_SUMMARY'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === tab ? 'white' : 'transparent',
              color: filter === tab ? '#0F172A' : '#64748B',
              boxShadow: filter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>
                  {doc.type === 'LAB_REPORT' ? '🧪' : doc.type === 'RADIOLOGY' ? '🩻' : '📄'}
                </span>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    {doc.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>
                    Uploaded on {doc.date} • {doc.doctor}
                  </p>
                </div>
              </div>
              <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                {doc.type}
              </span>
            </div>

            {/* AI Summary Box */}
            <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0284C7', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>✨</span> AI Document Insights
                </span>
                <button
                  onClick={() => handleAiSummarize(doc.id)}
                  disabled={analyzingId === doc.id}
                  style={{ border: 'none', background: 'transparent', color: '#0284C7', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  {analyzingId === doc.id ? 'Analyzing...' : 'Re-Summarize'}
                </button>
              </div>
              <p style={{ color: '#475569', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {doc.summary}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => toast.success('Secure document link copied for doctor consultation.')} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}>
                🔗 Share with Doctor
              </button>
              <button onClick={() => toast.success('Downloading encrypted PDF...')} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }}>
                ⬇️ Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Upload Medical Record</h3>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Document Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Thyroid Profile Test"
                  className="form-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
                >
                  <option value="LAB_REPORT">Lab Test Report</option>
                  <option value="RADIOLOGY">Radiology / X-Ray / MRI Scan</option>
                  <option value="DISCHARGE_SUMMARY">Hospital Discharge Summary</option>
                  <option value="PRESCRIPTION">External Prescription</option>
                </select>
              </div>

              <div style={{ border: '2px dashed #CBD5E1', padding: 24, textAlign: 'center', borderRadius: 12, marginBottom: 24, color: '#64748B', fontSize: 13 }}>
                📁 Drag & drop your PDF or Image here, or browse files
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setUploadModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save to Health Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}