import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PharmacyInventory() {
  const [items, setItems] = useState([
    {
      id: 'med-1',
      name: 'Telmisartan 40mg',
      category: 'Antihypertensive',
      batch: 'B-88192',
      expiry: 'Dec 2027',
      stock: 340,
      price: 110,
      schedule: 'Schedule H',
      status: 'In Stock',
    },
    {
      id: 'med-2',
      name: 'Metformin 500mg SR',
      category: 'Antidiabetic',
      batch: 'B-77210',
      expiry: 'Aug 2027',
      stock: 520,
      price: 65,
      schedule: 'Schedule H',
      status: 'In Stock',
    },
    {
      id: 'med-3',
      name: 'Montelukast + Levocetirizine',
      category: 'Antiallergic',
      batch: 'B-99120',
      expiry: 'Nov 2026',
      stock: 45,
      price: 145,
      schedule: 'Schedule H',
      status: 'Low Stock',
    },
    {
      id: 'med-4',
      name: 'Paracetamol 650mg (Dolo)',
      category: 'Analgesic & Antipyretic',
      batch: 'B-44102',
      expiry: 'May 2028',
      stock: 890,
      price: 32,
      schedule: 'OTC',
      status: 'In Stock',
    },
    {
      id: 'med-5',
      name: 'Atorvastatin 10mg',
      category: 'Lipid Lowering / Statin',
      batch: 'B-66230',
      expiry: 'Jan 2027',
      stock: 210,
      price: 180,
      schedule: 'Schedule H',
      status: 'In Stock',
    },
    {
      id: 'med-6',
      name: 'Amoxicillin + Clavulanic Acid 625mg',
      category: 'Antibiotic',
      batch: 'B-33120',
      expiry: 'Oct 2026',
      stock: 18,
      price: 240,
      schedule: 'Schedule H',
      status: 'Low Stock',
    },
  ]);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'General',
    batch: `B-${Math.floor(10000 + Math.random() * 90000)}`,
    expiry: 'Dec 2027',
    stock: 100,
    price: 100,
    schedule: 'Schedule H',
  });

  const handleRestock = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stock: i.stock + 100, status: 'In Stock' } : i))
    );
    toast.success('Inventory restocked (+100 units).');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.name) {
      toast.error('Medicine name is required.');
      return;
    }
    const created = {
      id: `med-${Date.now()}`,
      ...newItem,
      stock: Number(newItem.stock),
      price: Number(newItem.price),
      status: Number(newItem.stock) < 30 ? 'Low Stock' : 'In Stock',
    };
    setItems([created, ...items]);
    setShowAdd(false);
    toast.success(`${created.name} added to pharmacy inventory!`);
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.batch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Pharmacy Drug Formulary & Inventory
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Stock reconciliation, batch tracking, expiry monitoring, and Schedule H drug dispensing controls.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💊</span>
          <span>Add New Medicine</span>
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search inventory by medicine name, category, or batch number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 18px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none' }}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>Medicine & Category</th>
                <th style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>Batch / Expiry</th>
                <th style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>Schedule</th>
                <th style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>Current Stock</th>
                <th style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{item.batch}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Exp: {item.expiry}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: item.schedule === 'OTC' ? '#DCFCE7' : '#FEF3C7', color: item.schedule === 'OTC' ? '#15803D' : '#92400E' }}>
                      {item.schedule}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>
                    ₹{item.price}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: item.stock < 30 ? '#DC2626' : '#16A34A' }}>
                    {item.stock} units
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: item.status === 'In Stock' ? '#16A34A' : '#D97706' }}>
                      ● {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <button onClick={() => handleRestock(item.id)} className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px' }}>
                      + Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Add Medicine to Inventory</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Medicine Name & Strength</label>
                <input type="text" required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Category</label>
                  <input type="text" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Price (₹ INR)</label>
                  <input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Initial Stock Qty</label>
                  <input type="number" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Drug Schedule</label>
                  <select value={newItem.schedule} onChange={(e) => setNewItem({ ...newItem, schedule: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
                    <option value="Schedule H">Schedule H (Prescription)</option>
                    <option value="OTC">OTC (Over the Counter)</option>
                    <option value="Schedule X">Schedule X</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
