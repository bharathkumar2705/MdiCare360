import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PharmacyDashboard() {
  const [orders, setOrders] = useState([
    { id: 'RX-20261014-0492', patientName: 'Rahul Agarwal', doctorName: 'Dr. Priya Sharma', items: 'Atorvastatin 20mg (30 tabs), Aspirin 75mg (30 tabs)', status: 'NEW_ORDER', address: 'B-402, Green Glen Heights, Bangalore' },
    { id: 'RX-20261014-0129', patientName: 'Sneha Patel', doctorName: 'Dr. Sunita Rao', items: 'Amoxicillin 500mg (10 caps), Paracetamol 650mg', status: 'DISPENSED', address: 'Flat 12, Sunrise Residency, Mumbai' },
    { id: 'RX-20261013-9821', patientName: 'Aryan Malik', doctorName: 'Dr. Arjun Mehta', items: 'Clotrimazole Cream (20g)', status: 'DELIVERED', address: '44, Defense Colony, New Delhi' },
  ]);

  const handleUpdateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    toast.success(`Prescription order ${id} updated to ${newStatus.replace('_', ' ')}`);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Pharmacy Fulfillment & Dispensing
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Verify digital prescriptions, check batch expiries, pack and dispatch patient orders.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '8px 16px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
            💊 Licensed Pharmacy Partner
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: 'grid', gap: 18 }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0284C7', background: '#F0F9FF', padding: '4px 10px', borderRadius: 6 }}>
                  {o.id}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 99,
                    background:
                      o.status === 'DELIVERED' ? '#DEF7EC' : o.status === 'DISPENSED' ? '#E0F2FE' : '#FEF3C7',
                    color:
                      o.status === 'DELIVERED' ? '#03543F' : o.status === 'DISPENSED' ? '#0369A1' : '#92400E',
                  }}
                >
                  {o.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 2 }}>
                Patient: {o.patientName}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>
                Prescriber: {o.doctorName}
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                📍 {o.address}
              </div>
            </div>

            <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>
                Prescribed Medications
              </div>
              <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 500, lineHeight: 1.5 }}>
                {o.items}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
              {o.status === 'NEW_ORDER' ? (
                <button
                  onClick={() => handleUpdateStatus(o.id, 'DISPENSED')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 700 }}
                >
                  📦 Pack & Dispense Meds
                </button>
              ) : o.status === 'DISPENSED' ? (
                <button
                  onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 700, background: '#10B981', border: 'none' }}
                >
                  🚚 Handover to Courier / Out for Delivery
                </button>
              ) : (
                <div style={{ textAlign: 'center', color: '#16A34A', fontWeight: 700, fontSize: 14 }}>
                  ✓ Successfully Delivered
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
