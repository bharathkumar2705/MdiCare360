import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([
    {
      id: 'hosp-1',
      name: 'MediCare360 Society Health Center',
      type: 'Primary Community Clinic & Health Hub',
      address: 'Sector 4, Main Society Boulevard, Bengaluru - 560034',
      phone: '+91 80 4920 1100',
      email: 'clinic@medicare360.com',
      departments: ['Cardiology', 'General Medicine', 'Pediatrics', 'Diagnostics'],
      beds: 24,
      icuBeds: 4,
      ventilators: 2,
      operationTheatres: 1,
      ambulance: '108 / +91 80 4920 1199',
      isVerified: true,
      isActive: true,
      rating: 4.9,
      doctorsCount: 8,
      facilities: ['24x7 Emergency Care', 'In-House Pathology Lab', 'Day Care Observation', 'Minor OT', 'Ambulance On-Site'],
      headDoctor: 'Dr. Bharath Kumar Reddy (Chief Medical Officer)',
    },
    {
      id: 'hosp-2',
      name: 'Manipal Community Specialty Hospital',
      type: 'Multi-Specialty Tertiary Hospital',
      address: 'Old Airport Road, HAL 2nd Stage, Bengaluru - 560017',
      phone: '+91 80 2502 4444',
      email: 'society.desk@manipal.edu',
      departments: ['Emergency ICU', 'Cardiac Surgery', 'Neurology', 'Orthopedics'],
      beds: 350,
      icuBeds: 60,
      ventilators: 30,
      operationTheatres: 12,
      ambulance: '+91 80 2502 4108',
      isVerified: true,
      isActive: true,
      rating: 4.8,
      doctorsCount: 65,
      facilities: ['Level 1 Trauma Center', 'Cardiac Cath Lab', '24x7 Blood Bank', 'Advanced MRI/CT', 'Helipad Facility'],
      headDoctor: 'Dr. Sudarshan Ballal (Medical Director)',
    },
    {
      id: 'hosp-3',
      name: 'Apollo Neighborhood Medical Center',
      type: 'Secondary Care & Day Surgery',
      address: '154/11, Bannerghatta Main Rd, Bengaluru - 560076',
      phone: '+91 80 2630 4050',
      email: 'partners@apollo.org',
      departments: ['General Surgery', 'Gastroenterology', 'Dermatology', 'ENT'],
      beds: 120,
      icuBeds: 18,
      ventilators: 8,
      operationTheatres: 4,
      ambulance: '+91 80 2630 4108',
      isVerified: true,
      isActive: true,
      rating: 4.7,
      doctorsCount: 28,
      facilities: ['Endoscopy Suite', 'Dialysis Center', 'Day Surgery Ward', 'Digital X-Ray & Ultrasound', 'Pharmacy 24x7'],
      headDoctor: 'Dr. Anupam Sibal (Group Medical Director)',
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [editingHospital, setEditingHospital] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHosp, setNewHosp] = useState({
    name: '',
    type: 'Multi-Specialty Hospital',
    address: '',
    phone: '',
    email: '',
    departments: 'General Medicine, Emergency',
    beds: 50,
  });

  const handleToggle = (id) => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isActive: !h.isActive } : h))
    );
    toast.success('Hospital partner operational status updated.');
  };

  const handleDeleteHospital = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from the platform? This will remove all affiliated emergency quotas.`)) {
      setHospitals((prev) => prev.filter((h) => h.id !== id));
      if (selectedHospital?.id === id) setSelectedHospital(null);
      toast.success(`${name} has been permanently deleted.`);
    }
  };

  const handleAddHospital = (e) => {
    e.preventDefault();
    if (!newHosp.name || !newHosp.address) {
      toast.error('Please enter hospital name and address.');
      return;
    }
    const created = {
      id: `hosp-${Date.now()}`,
      ...newHosp,
      departments: newHosp.departments.split(',').map((d) => d.trim()),
      beds: Number(newHosp.beds),
      icuBeds: Math.round(Number(newHosp.beds) * 0.15),
      ventilators: Math.round(Number(newHosp.beds) * 0.08),
      operationTheatres: 2,
      ambulance: '108',
      isVerified: true,
      isActive: true,
      rating: 5.0,
      doctorsCount: 10,
      facilities: ['24x7 Emergency Care', 'Pharmacy', 'Diagnostic Lab'],
      headDoctor: 'Medical Superintendent',
    };
    setHospitals([created, ...hospitals]);
    setShowAddModal(false);
    setNewHosp({ name: '', type: 'Multi-Specialty Hospital', address: '', phone: '', email: '', departments: 'General Medicine, Emergency', beds: 50 });
    toast.success(`${created.name} successfully affiliated to MediCare360!`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setHospitals((prev) =>
      prev.map((h) => (h.id === editingHospital.id ? editingHospital : h))
    );
    if (selectedHospital?.id === editingHospital.id) {
      setSelectedHospital(editingHospital);
    }
    setEditingHospital(null);
    toast.success('Hospital details updated successfully!');
  };

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase()) ||
      h.departments.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Hospitals & Health Centers Administration
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Full administrative control: View details, affiliate new hospitals, edit bed capacities, or remove partner centers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>➕</span>
          <span>Add New Hospital</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search hospitals by name, locality, or clinical department..."
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

      {/* Hospitals Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {filtered.map((h) => (
          <div
            key={h.id}
            style={{
              background: 'white',
              borderRadius: 18,
              border: '1px solid #E2E8F0',
              padding: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div
                onClick={() => setSelectedHospital(h)}
                style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 14, background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  🏥
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#0F172A',
                        textDecoration: 'underline',
                        textDecorationColor: '#93C5FD',
                        textUnderlineOffset: '4px',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = '#0284C7')}
                      onMouseLeave={(e) => (e.target.style.color = '#0F172A')}
                    >
                      {h.name}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#DEF7EC', color: '#03543F' }}>
                      ✓ NABH Accredited
                    </span>
                    <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>
                      ★ {h.rating}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    {h.type} • {h.address}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: h.isActive ? '#DCFCE7' : '#FEE2E2',
                    color: h.isActive ? '#15803D' : '#991B1B',
                  }}
                >
                  {h.isActive ? 'Active' : 'Suspended'}
                </span>
                <button
                  onClick={() => setSelectedHospital(h)}
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  👁️ Details
                </button>
                <button
                  onClick={() => setEditingHospital({ ...h, departmentsStr: h.departments.join(', ') })}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggle(h.id)}
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  {h.isActive ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteHospital(h.id, h.name)}
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '6px 12px', color: '#DC2626', borderColor: '#FCA5A5' }}
                  title="Delete Hospital"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Department Badges & Metrics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ color: '#334155' }}>Specialties:</strong>
                {h.departments.map((dept, i) => (
                  <span key={i} style={{ background: '#F1F5F9', color: '#475569', padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500 }}>
                    {dept}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 16, color: '#64748B', fontSize: 13 }}>
                <span>🛏️ Total: <strong style={{ color: '#0F172A' }}>{h.beds} Beds</strong></span>
                <span>🚑 Helpline: <strong style={{ color: '#DC2626' }}>{h.ambulance}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  🏥
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedHospital.name}
                    </h2>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#DEF7EC', color: '#03543F' }}>
                      ✓ Verified
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    {selectedHospital.type} • {selectedHospital.address}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Total Beds</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{selectedHospital.beds}</div>
              </div>
              <div style={{ background: '#FEF2F2', padding: 14, borderRadius: 12, border: '1px solid #FECACA', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#991B1B', fontWeight: 600 }}>ICU Beds</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>{selectedHospital.icuBeds || 6}</div>
              </div>
              <div style={{ background: '#EFF6FF', padding: 14, borderRadius: 12, border: '1px solid #BFDBFE', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 600 }}>Ventilators</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2563EB', marginTop: 2 }}>{selectedHospital.ventilators || 4}</div>
              </div>
              <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 12, border: '1px solid #BBF7D0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>Specialists</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A', marginTop: 2 }}>{selectedHospital.doctorsCount || 12}</div>
              </div>
            </div>

            {/* Clinical Departments */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                Clinical Departments & Centers of Excellence
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedHospital.departments?.map((dept, i) => (
                  <span key={i} style={{ background: '#F1F5F9', color: '#1E293B', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid #E2E8F0' }}>
                    🩺 {dept}
                  </span>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                Infrastructure & Facilities
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {selectedHospital.facilities?.map((f, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#16A34A' }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Hotline */}
            <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, border: '1px solid #FDE68A', marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                🚨 Society Priority Emergency Hotline
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#B45309', marginTop: 4 }}>
                {selectedHospital.ambulance}
              </div>
              <div style={{ fontSize: 13, color: '#78350F', marginTop: 4 }}>
                Direct desk: {selectedHospital.phone} • Email: {selectedHospital.email}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const h = selectedHospital;
                    setSelectedHospital(null);
                    setEditingHospital({ ...h, departmentsStr: h.departments.join(', ') });
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  ✏️ Edit Hospital
                </button>
                <button
                  onClick={() => handleDeleteHospital(selectedHospital.id, selectedHospital.name)}
                  className="btn btn-outline"
                  style={{ fontSize: 13, color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  🗑️ Delete Hospital
                </button>
              </div>

              <button
                onClick={() => setSelectedHospital(null)}
                className="btn btn-primary"
                style={{ fontSize: 13 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hospital Modal */}
      {editingHospital && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Edit Hospital Details</h2>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Hospital Name</label>
                <input
                  type="text"
                  required
                  value={editingHospital.name}
                  onChange={(e) => setEditingHospital({ ...editingHospital, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Address</label>
                <input
                  type="text"
                  required
                  value={editingHospital.address}
                  onChange={(e) => setEditingHospital({ ...editingHospital, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Phone Hotline</label>
                  <input
                    type="text"
                    value={editingHospital.phone}
                    onChange={(e) => setEditingHospital({ ...editingHospital, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Bed Capacity</label>
                  <input
                    type="number"
                    value={editingHospital.beds}
                    onChange={(e) => setEditingHospital({ ...editingHospital, beds: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Departments (comma-separated)</label>
                <input
                  type="text"
                  value={editingHospital.departmentsStr}
                  onChange={(e) => setEditingHospital({
                    ...editingHospital,
                    departmentsStr: e.target.value,
                    departments: e.target.value.split(',').map((s) => s.trim()),
                  })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setEditingHospital(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Affiliate New Hospital</h2>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>Connect an emergency or multi-specialty partner to the society platform.</p>
            <form onSubmit={handleAddHospital} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Hospital Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortis Healthcare Center"
                  value={newHosp.name}
                  onChange={(e) => setNewHosp({ ...newHosp, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Full Address & City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 154 Bannerghatta Rd, Bengaluru"
                  value={newHosp.address}
                  onChange={(e) => setNewHosp({ ...newHosp, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Phone Helpline</label>
                  <input
                    type="text"
                    placeholder="+91 80 4920 1100"
                    value={newHosp.phone}
                    onChange={(e) => setNewHosp({ ...newHosp, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Bed Count</label>
                  <input
                    type="number"
                    value={newHosp.beds}
                    onChange={(e) => setNewHosp({ ...newHosp, beds: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Clinical Departments (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Cardiology, Pediatrics, Emergency ICU"
                  value={newHosp.departments}
                  onChange={(e) => setNewHosp({ ...newHosp, departments: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
