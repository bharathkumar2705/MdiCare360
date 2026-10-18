import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LabTests() {
  const [tests, setTests] = useState([
    {
      id: 't-1',
      name: 'Complete Blood Count (CBC) with ESR',
      category: 'Hematology',
      price: 350,
      turnaround: '6 Hours',
      sampleType: 'EDTA Whole Blood (3 ml)',
      fasting: 'Not Required',
      active: true,
    },
    {
      id: 't-2',
      name: 'Complete Lipid Profile & Serum Cholesterol',
      category: 'Biochemistry',
      price: 650,
      turnaround: '8 Hours',
      sampleType: 'Serum / SST (4 ml)',
      fasting: '10-12 Hours Overnight Fasting Required',
      active: true,
    },
    {
      id: 't-3',
      name: 'Glycated Hemoglobin (HbA1c) & Glucose',
      category: 'Diabetes Care',
      price: 500,
      turnaround: '4 Hours',
      sampleType: 'EDTA Whole Blood (2 ml)',
      fasting: 'Not Required',
      active: true,
    },
    {
      id: 't-4',
      name: 'Thyroid Function Profile (T3, T4, TSH)',
      category: 'Endocrinology',
      price: 550,
      turnaround: '8 Hours',
      sampleType: 'Serum / SST (3 ml)',
      fasting: 'Fasting Preferred (Morning Sample)',
      active: true,
    },
    {
      id: 't-5',
      name: 'Liver Function Test (LFT) with Enzymes',
      category: 'Biochemistry',
      price: 700,
      turnaround: '8 Hours',
      sampleType: 'Serum / SST (4 ml)',
      fasting: '8-10 Hours Fasting',
      active: true,
    },
    {
      id: 't-6',
      name: 'Vitamin D (25-Hydroxy) Total',
      category: 'Special Chemistry',
      price: 1100,
      turnaround: '24 Hours',
      sampleType: 'Serum / SST (3 ml)',
      fasting: 'Not Required',
      active: true,
    },
  ]);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    category: 'Biochemistry',
    price: 500,
    turnaround: '8 Hours',
    sampleType: 'Serum (3 ml)',
    fasting: 'Not Required',
  });

  const handleToggle = (id) => {
    setTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
    toast.success('Test availability updated.');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTest.name) {
      toast.error('Test name is required.');
      return;
    }
    setTests([{ id: `t-${Date.now()}`, ...newTest, price: Number(newTest.price), active: true }, ...tests]);
    setShowAdd(false);
    setNewTest({ name: '', category: 'Biochemistry', price: 500, turnaround: '8 Hours', sampleType: 'Serum (3 ml)', fasting: 'Not Required' });
    toast.success('New diagnostic test added to catalog!');
  };

  const filtered = tests.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Pathology & Diagnostic Test Catalog
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Manage diagnostic investigations, pricing, turnaround times, and sample collection guidelines.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>➕</span>
          <span>Add New Test</span>
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search test catalog by name or clinical category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 18px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((t) => (
          <div key={t.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#F5F3FF', color: '#6D28D9' }}>
                  {t.category}
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#16A34A' }}>
                  ₹{t.price}
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                {t.name}
              </h3>
              <div style={{ fontSize: 12, color: '#64748B', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>🧪 Sample: <strong style={{ color: '#334155' }}>{t.sampleType}</strong></div>
                <div>⏱️ Turnaround: <strong style={{ color: '#334155' }}>{t.turnaround}</strong></div>
                <div>📋 Fasting: <strong style={{ color: t.fasting.includes('Required') ? '#D97706' : '#16A34A' }}>{t.fasting}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.active ? '#16A34A' : '#DC2626' }}>
                {t.active ? '● Available for Booking' : '○ Paused'}
              </span>
              <button onClick={() => handleToggle(t.id)} className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px' }}>
                {t.active ? 'Pause' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Add Diagnostic Test</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Test Name</label>
                <input type="text" required value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Category</label>
                  <input type="text" value={newTest.category} onChange={(e) => setNewTest({ ...newTest, category: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Price (₹ INR)</label>
                  <input type="number" value={newTest.price} onChange={(e) => setNewTest({ ...newTest, price: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
