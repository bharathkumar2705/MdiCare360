import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { patientService } from '../../services';
import { LoadingSpinner } from '../../components/common/UI';
import PaymentModal from '../../components/common/PaymentModal';
import { format } from 'date-fns';

export default function PatientPharmacy() {
  const [activeTab, setActiveTab] = useState('CATALOG'); // CATALOG | CART | ORDERS
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      setLoading(true);
      const [medRes, ordRes] = await Promise.all([
        patientService.getMedicines(),
        patientService.getPharmacyOrders(),
      ]);
      setMedicines(medRes.data.data || []);
      setOrders(ordRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load pharmacy medicines.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (med) => {
    const existing = cart.find((i) => i._id === med._id);
    if (existing) {
      setCart(cart.map((i) => (i._id === med._id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...med, qty: 1 }]);
    }
    toast.success(`${med.name} added to cart`);
  };

  const updateQty = (id, delta) => {
    setCart(
      cart
        .map((i) => {
          if (i._id === id) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  const handlePaymentSuccess = async (paymentData) => {
    try {
      await patientService.createPharmacyOrder({
        items: cart.map((i) => ({
          medicineId: i._id,
          name: i.name,
          quantity: i.qty,
          price: i.price,
        })),
        deliveryAddress: { street: 'Main Address', city: 'City', state: 'State', pincode: '500001' },
        subtotal: cartTotal,
        deliveryCharge: 40,
        totalAmount: cartTotal + 40,
      });
      setShowPayment(false);
      setCart([]);
      setActiveTab('ORDERS');
      toast.success(`Medicine order placed! Paid ₹${cartTotal + 40} via ${paymentData.method}.`);
      await fetchPharmacyData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order placement failed.');
    }
  };

  const filteredMeds = medicines.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(search.toLowerCase())) ||
      (m.genericName && m.genericName.toLowerCase().includes(search.toLowerCase()))
    );
  });

  if (loading) return <LoadingSpinner text="Connecting to 24/7 central pharmacy..." />;

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>MediCare Central Pharmacy</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            Direct inventory from verified pharmaceutical suppliers with batch tracking and home delivery.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={`btn ${activeTab === 'CATALOG' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab('CATALOG')}
          >
            💊 Medicines ({medicines.length})
          </button>
          <button
            className={`btn ${activeTab === 'CART' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab('CART')}
          >
            🛒 Cart ({cart.reduce((a, b) => a + b.qty, 0)})
          </button>
          <button
            className={`btn ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab('ORDERS')}
          >
            📦 My Orders ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === 'CATALOG' && (
        <>
          <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
            <input
              type="text"
              className="input"
              placeholder="Search medicines by brand, salt name, or manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', fontSize: 14 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {filteredMeds.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
                No medicines found matching "{search}".
              </div>
            ) : (
              filteredMeds.map((med) => (
                <div key={med._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 20 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                        {med.manufacturer || 'PHARMA'}
                      </span>
                      {med.requiresPrescription && (
                        <span className="badge badge-warning" style={{ fontSize: 10, padding: '2px 6px' }}>Rx Required</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', lineHeight: 1.4 }}>{med.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                      Salt: {med.genericName || med.name} • {med.category || 'TABLET'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-text)' }}>
                      ₹{med.price}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(med)}>
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'CART' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Cart Items ({cart.length})</h3>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary)' }}>
                Your cart is empty. Add medicines from the store.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {cart.map((item) => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>₹{item.price} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface-2)', borderRadius: 8, padding: '4px 8px' }}>
                        <button onClick={() => updateQty(item._id, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800 }}>-</button>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                        <button onClick={() => updateQty(item._id, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800 }}>+</button>
                      </div>
                      <div style={{ fontWeight: 800, minWidth: 60, textAlign: 'right' }}>₹{item.price * item.qty}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Items Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Standard Delivery:</span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>₹40</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 14, marginTop: 14 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Total Payable:</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: 'var(--color-primary)' }}>₹{cart.length > 0 ? cartTotal + 40 : 0}</span>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                className="btn btn-primary"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
                style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 800 }}
              >
                Proceed to Pay ₹{cart.length > 0 ? cartTotal + 40 : 0} →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No medicine orders placed yet</h4>
              <p style={{ margin: 0, fontSize: 13 }}>
                Order medicines from the store and track delivery status right here.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      ORDER #{ord._id.slice(-8).toUpperCase()}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>
                      {ord.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ') || 'Prescription Items'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success">{ord.status}</span>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>₹{ord.totalAmount}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  <span>Placed on: <strong>{ord.createdAt ? format(new Date(ord.createdAt), 'MMM d, yyyy, h:mm a') : '-'}</strong></span>
                  <span className="badge badge-neutral">Paid via Razorpay</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={cartTotal + 40}
        serviceType="PHARMACY_ORDER"
        title="Pharmacy Checkout"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
