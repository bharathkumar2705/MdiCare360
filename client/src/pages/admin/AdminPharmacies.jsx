import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([
    {
      id: 'pharm-1',
      name: 'MediCare360 Society Community Dispensary',
      type: 'On-Premise Society 24/7 Pharmacy',
      address: 'Clubhouse Wing B, Sector 4, Bengaluru - 560034',
      phone: '+91 80 4920 1155',
      licenseNumber: 'KA-BGL-DL-2024-99182',
      deliveryTime: '15-30 Mins (Doorstep Delivery)',
      inStockMedicines: 1840,
      requiresPrescription: true,
      isActive: true,
      rating: 4.9,
      operatingHours: '24 Hours / 7 Days a Week',
      pharmacistInCharge: 'Ramesh Verma (B.Pharm, Reg #44102)',
      categories: ['Cardiovascular', 'Antidiabetic', 'Respiratory', 'Antibiotics', 'Pediatric Care', 'Emergency First Aid'],
    },
    {
      id: 'pharm-2',
      name: 'Apollo Pharmacy 24/7 Delivery Hub',
      type: 'Licensed Retail & Cold-Chain Chemist',
      address: 'Plot 88, 17th Cross, HSR Layout, Bengaluru - 560102',
      phone: '+91 80 2572 1010',
      licenseNumber: 'KA-BGL-DL-2022-77210',
      deliveryTime: '45 Mins',
      inStockMedicines: 8200,
      requiresPrescription: true,
      isActive: true,
      rating: 4.8,
      operatingHours: '24 Hours',
      pharmacistInCharge: 'Sunita Rao (M.Pharm)',
      categories: ['Oncology Drugs', 'Specialty Biologics', 'Cold-Chain Insulin', 'General OTC'],
    },
    {
      id: 'pharm-3',
      name: 'MedPlus Neighborhood Society Partner',
      type: 'Generic & Branded Drug Store',
      address: 'Commercial Block 3, Sarjapur Main Rd, Bengaluru',
      phone: '+91 80 4110 3344',
      licenseNumber: 'KA-BGL-DL-2023-45129',
      deliveryTime: '1 Hour',
      inStockMedicines: 5400,
      requiresPrescription: true,
      isActive: true,
      rating: 4.7,
      operatingHours: '07:00 AM - 11:00 PM',
      pharmacistInCharge: 'Deepak Nair (D.Pharm)',
      categories: ['Chronic Disease Maintenance', 'Vitamins & Minerals', 'Mother & Baby', 'Surgicals'],
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPharm, setNewPharm] = useState({
    name: '',
    address: '',
    phone: '',
    licenseNumber: '',
    deliveryTime: '30-45 Mins',
  });

  const handleToggle = (id) => {
    setPharmacies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    toast.success('Pharmacy partner status updated.');
  };

  const handleAddPharmacy = (e) => {
    e.preventDefault();
    if (!newPharm.name || !newPharm.address) {
      toast.error('Please enter pharmacy name and address.');
      return;
    }
    const created = {
      id: `pharm-${Date.now()}`,
      ...newPharm,
      type: 'Licensed Society Pharmacy Partner',
      inStockMedicines: 1200,
      requiresPrescription: true,
      isActive: true,
      rating: 5.0,
      operatingHours: '08:00 AM - 10:00 PM',
      pharmacistInCharge: 'Registered Pharmacist',
      categories: ['Essential Medicines', 'OTC'],
    };
    setPharmacies([created, ...pharmacies]);
    setShowAddModal(false);
    setNewPharm({ name: '', address: '', phone: '', licenseNumber: '', deliveryTime: '30-45 Mins' });
    toast.success(`${created.name} successfully partnered with MediCare360!`);
  };

  const filtered = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Partner Pharmacies & Medicine Fulfillment
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Click on any pharmacy to view drug licenses, active formulary, prescription compliance, and doorstep delivery SLA.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>💊</span>
          <span>Add Pharmacy Partner</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search partner pharmacies by name, locality, or drug license..."
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

      {/* Pharmacies List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {filtered.map((p) => (
          <div
            key={p.id}
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
                onClick={() => setSelectedPharmacy(p)}
                style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ width: 54, height: 54, borderRadius: 14, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  💊
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#0F172A',
                        textDecoration: 'underline',
                        textDecorationColor: '#FDE68A',
                        textUnderlineOffset: '4px',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = '#D97706')}
                      onMouseLeave={(e) => (e.target.style.color = '#0F172A')}
                    >
                      {p.name}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#FEF3C7', color: '#92400E' }}>
                      Lic: {p.licenseNumber}
                    </span>
                    <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>
                      ★ {p.rating}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    {p.type} • {p.address}
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
                    background: p.isActive ? '#DCFCE7' : '#FEE2E2',
                    color: p.isActive ? '#15803D' : '#991B1B',
                  }}
                >
                  {p.isActive ? 'Active Dispensary' : 'Suspended'}
                </span>
                <button
                  onClick={() => setSelectedPharmacy(p)}
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  👁️ View Details
                </button>
                <button
                  onClick={() => handleToggle(p.id)}
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  {p.isActive ? 'Pause Partner' : 'Activate'}
                </button>
              </div>
            </div>

            {/* Delivery & Medicine Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 16, color: '#64748B', flexWrap: 'wrap' }}>
                <span>🚀 Delivery SLA: <strong style={{ color: '#16A34A' }}>{p.deliveryTime}</strong></span>
                <span>📦 Active Formulary: <strong style={{ color: '#0284C7' }}>{p.inStockMedicines}+ Items</strong></span>
                <span>📋 e-Rx Verification: <strong style={{ color: '#7C3AED' }}>Mandatory</strong></span>
              </div>
              <div style={{ color: '#64748B' }}>
                📞 Helpline: <strong style={{ color: '#0F172A' }}>{p.phone}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pharmacy Detail Modal */}
      {selectedPharmacy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                  💊
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedPharmacy.name}
                    </h2>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#DEF7EC', color: '#03543F' }}>
                      ✓ Licensed
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                    {selectedPharmacy.type} • {selectedPharmacy.address}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPharmacy(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Active Medicines</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{selectedPharmacy.inStockMedicines}+</div>
              </div>
              <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 12, border: '1px solid #BBF7D0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>Delivery Speed</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A', marginTop: 2 }}>{selectedPharmacy.deliveryTime}</div>
              </div>
              <div style={{ background: '#EFF6FF', padding: 14, borderRadius: 12, border: '1px solid #BFDBFE', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 600 }}>Operating Hours</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>{selectedPharmacy.operatingHours || '24x7'}</div>
              </div>
            </div>

            {/* Drug License Details */}
            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 16, border: '1px solid #E2E8F0', marginBottom: 20, fontSize: 13, color: '#334155' }}>
              <div>📋 Drug License Form 20B/21B: <strong style={{ color: '#0F172A' }}>{selectedPharmacy.licenseNumber}</strong></div>
              <div style={{ marginTop: 4 }}>👨‍🔬 Pharmacist-in-Charge: <strong style={{ color: '#0F172A' }}>{selectedPharmacy.pharmacistInCharge}</strong></div>
              <div style={{ marginTop: 4 }}>🔒 Schedule H Verification: <strong style={{ color: '#16A34A' }}>Automated matching with Doctor e-Prescriptions</strong></div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                Stock Categories & Therapeutic Classes
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedPharmacy.categories?.map((c, i) => (
                  <span key={i} style={{ background: '#FFFBEB', color: '#92400E', padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid #FDE68A' }}>
                    💊 {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
              <button onClick={() => setSelectedPharmacy(null)} className="btn btn-primary" style={{ fontSize: 13 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Pharmacy Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Partner New Pharmacy</h2>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>Connect a licensed dispensary or retail chemist for society fulfillment.</p>
            <form onSubmit={handleAddPharmacy} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Pharmacy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Pharmacy Sector 4"
                  value={newPharm.name}
                  onChange={(e) => setNewPharm({ ...newPharm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Address & Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Complex, Sarjapur Rd"
                  value={newPharm.address}
                  onChange={(e) => setNewPharm({ ...newPharm, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Phone</label>
                  <input
                    type="text"
                    placeholder="+91 80 4920 1155"
                    value={newPharm.phone}
                    onChange={(e) => setNewPharm({ ...newPharm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Drug License #</label>
                  <input
                    type="text"
                    placeholder="KA-BGL-DL-2024-..."
                    value={newPharm.licenseNumber}
                    onChange={(e) => setNewPharm({ ...newPharm, licenseNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
