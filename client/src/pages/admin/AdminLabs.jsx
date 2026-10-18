import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminLabs() {
  const [labs, setLabs] = useState([
    {
      id: 'lab-1',
      name: 'MediCare360 Society Pathology & Diagnostic Hub',
      type: 'NABL Accredited Central Pathology Center',
      address: 'Community Center Ground Floor, Sector 4, Bengaluru',
      phone: '+91 80 4920 1144',
      email: 'lab.desk@medicare360.com',
      accreditation: 'NABL & ICMR Certified',
      testsOffered: 142,
      homeCollection: true,
      turnaround: 'Same Day (6-8 hours)',
      isActive: true,
      rating: 4.9,
      popularTests: ['Complete Blood Count (CBC)', 'Lipid Profile', 'HbA1c & Fasting Sugar', 'Thyroid Profile', 'Liver Function Test'],
      phlebotomists: 6,
    },
    {
      id: 'lab-2',
      name: 'Metropolis Healthcare Diagnostic Partner',
      type: 'National Reference Pathology Network',
      address: '100 Feet Rd, Indiranagar, Bengaluru - 560038',
      phone: '+91 80 4242 8888',
      email: 'partnerships@metropolisindia.com',
      accreditation: 'CAP & NABL Certified',
      testsOffered: 450,
      homeCollection: true,
      turnaround: '12-24 hours',
      isActive: true,
      rating: 4.8,
      popularTests: ['Vitamin D3 & B12', 'Cardiac Biomarkers (Troponin)', 'Autoimmune Panels', 'Cancer Markers (PSA, CA-125)'],
      phlebotomists: 24,
    },
    {
      id: 'lab-3',
      name: 'Dr. Lal PathLabs Express Society Collection Point',
      type: 'Diagnostic Blood Collection Center',
      address: 'Shop 12, Commercial Block, Bengaluru - 560034',
      phone: '+91 80 2555 9090',
      email: 'support@lalpathlabs.com',
      accreditation: 'ISO 15189 & NABL Certified',
      testsOffered: 210,
      homeCollection: true,
      turnaround: '24 hours',
      isActive: true,
      rating: 4.7,
      popularTests: ['Renal Function Test', 'Serum Electrolytes', 'Urine Routine & Microscopic', 'Infectious Disease Serology'],
      phlebotomists: 10,
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLab, setNewLab] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    accreditation: 'NABL Certified',
    testsOffered: 100,
    turnaround: 'Same Day (8 hours)',
  });

  const handleToggle = (id) => {
    setLabs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
    toast.success('Laboratory operational status updated.');
  };

  const handleAddLab = (e) => {
    e.preventDefault();
    if (!newLab.name || !newLab.address) {
      toast.error('Please enter lab name and address.');
      return;
    }
    const created = {
      id: `lab-${Date.now()}`,
      ...newLab,
      type: 'Accredited Pathology Laboratory',
      homeCollection: true,
      isActive: true,
      rating: 5.0,
      popularTests: ['CBC', 'Lipid Profile', 'Thyroid Test'],
      phlebotomists: 4,
    };
    setLabs([created, ...labs]);
    setShowAddModal(false);
    setNewLab({ name: '', address: '', phone: '', email: '', accreditation: 'NABL Certified', testsOffered: 100, turnaround: 'Same Day (8 hours)' });
    toast.success(`${created.name} successfully partnered with MediCare360!`);
  };

  const filtered = labs.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Partner Diagnostic & Pathology Labs
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Click on any diagnostic center to view test profiles, home sample phlebotomy slots, and turnaround SLAs.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>🧪</span>
          <span>Add Diagnostic Lab</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search diagnostic laboratories by name or locality..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 12,
            border: '1px solid #CBD5E1',
            fontSize: 14,
            outline: 'none',
            background: 'white',
          }}
        />
      </div>

      {/* Labs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {filtered.map((l) => (
          <div
            key={l.id}
            style={{
              background: 'white',
              borderRadius: 18,
              border: '1px solid #E2E8F0',
              padding: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div
                onClick={() => setSelectedLab(l)}
                style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 14, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  🧪
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#0F172A',
                        textDecoration: 'underline',
                        textDecorationColor: '#DDD6FE',
                        textUnderlineOffset: '4px',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = '#7C3AED')}
                      onMouseLeave={(e) => (e.target.style.color = '#0F172A')}
                    >
                      {l.name}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#F5F3FF', color: '#6D28D9' }}>
                      {l.accreditation}
                    </span>
                    <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>
                      ★ {l.rating}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    {l.type} • {l.address}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: l.isActive ? '#DCFCE7' : '#FEE2E2',
                    color: l.isActive ? '#15803D' : '#991B1B',
                  }}
                >
                  {l.isActive ? 'Active Partner' : 'Suspended'}
                </span>
                <button
                  onClick={() => setSelectedLab(l)}
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  👁️ View Details
                </button>
                <button
                  onClick={() => handleToggle(l.id)}
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  {l.isActive ? 'Pause Partner' : 'Activate'}
                </button>
              </div>
            </div>

            {/* Turnaround & Service Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 16, color: '#64748B', flexWrap: 'wrap' }}>
                <span>🏠 Home Collection: <strong style={{ color: '#16A34A' }}>Available (₹0 fee for society)</strong></span>
                <span>⏱️ Report Turnaround: <strong style={{ color: '#0F172A' }}>{l.turnaround}</strong></span>
                <span>📊 Tests Offered: <strong style={{ color: '#2563EB' }}>{l.testsOffered}+ Profiles</strong></span>
              </div>
              <div style={{ color: '#64748B' }}>
                📞 Helpline: <strong style={{ color: '#0F172A' }}>{l.phone}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lab Detail Modal */}
      {selectedLab && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  🧪
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedLab.name}
                    </h2>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#F5F3FF', color: '#6D28D9' }}>
                      {selectedLab.accreditation}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    {selectedLab.type} • {selectedLab.address}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLab(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Catalog Tests</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{selectedLab.testsOffered}+</div>
              </div>
              <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 12, border: '1px solid #BBF7D0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>Turnaround SLA</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A', marginTop: 2 }}>{selectedLab.turnaround}</div>
              </div>
              <div style={{ background: '#EFF6FF', padding: 14, borderRadius: 12, border: '1px solid #BFDBFE', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 600 }}>Home Phlebotomists</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', marginTop: 2 }}>{selectedLab.phlebotomists || 8} Active</div>
              </div>
            </div>

            {/* Popular Test Profiles */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                Frequently Ordered Diagnostic Profiles
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedLab.popularTests?.map((t, i) => (
                  <span key={i} style={{ background: '#F8FAFC', color: '#1E293B', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid #E2E8F0' }}>
                    🔬 {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 16, border: '1px solid #E2E8F0', marginBottom: 24, fontSize: 13, color: '#334155' }}>
              <div>📞 Dispatch Helpline: <strong style={{ color: '#0F172A' }}>{selectedLab.phone}</strong></div>
              <div style={{ marginTop: 4 }}>📧 Operations Desk: <strong style={{ color: '#0F172A' }}>{selectedLab.email}</strong></div>
              <div style={{ marginTop: 4 }}>🏠 Home Sample Booking: <strong style={{ color: '#16A34A' }}>Enabled for all society apartments</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
              <button onClick={() => setSelectedLab(null)} className="btn btn-primary" style={{ fontSize: 13 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lab Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Partner New Diagnostic Lab</h2>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>Connect an accredited pathology lab for society diagnostic bookings.</p>
            <form onSubmit={handleAddLab} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Diagnostic Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Diagnostics"
                  value={newLab.name}
                  onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Address & Locality</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4 Commercial Complex"
                  value={newLab.address}
                  onChange={(e) => setNewLab({ ...newLab, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Phone</label>
                  <input
                    type="text"
                    placeholder="+91 80 4920 1144"
                    value={newLab.phone}
                    onChange={(e) => setNewLab({ ...newLab, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Accreditation</label>
                  <input
                    type="text"
                    value={newLab.accreditation}
                    onChange={(e) => setNewLab({ ...newLab, accreditation: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Laboratory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
