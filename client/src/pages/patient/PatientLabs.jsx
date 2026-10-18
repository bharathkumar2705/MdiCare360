import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { patientService } from '../../services';
import { LoadingSpinner } from '../../components/common/UI';
import PaymentModal from '../../components/common/PaymentModal';
import { format } from 'date-fns';

export default function PatientLabs() {
  const [activeTab, setActiveTab] = useState('PACKAGES'); // PACKAGES | MY_ORDERS
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');

  useEffect(() => {
    fetchLabData();
  }, []);

  const fetchLabData = async () => {
    try {
      setLoading(true);
      const [testRes, bookRes] = await Promise.all([
        patientService.getLabTests(),
        patientService.getLabBookings(),
      ]);
      setTests(testRes.data.data || []);
      setBookings(bookRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load lab diagnostic tests.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTest = (test) => {
    setSelectedTest(test);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      await patientService.bookLabTest({
        testIds: [selectedTest._id],
        collectionType: selectedTest.homeCollectionAvailable ? 'HOME' : 'LAB_VISIT',
        scheduledDate,
        scheduledTime,
        amount: selectedTest.price,
      });
      setShowPayment(false);
      toast.success(`Lab Test Booked! Paid ₹${selectedTest.price} via ${paymentData.method}.`);
      setActiveTab('MY_ORDERS');
      await fetchLabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lab booking failed.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading laboratory tests and packages..." />;

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Diagnostic Lab Tests & Pathology</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            NABL-Accredited laboratory partners, certified home sample phlebotomy, and digital reports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={`btn ${activeTab === 'PACKAGES' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab('PACKAGES')}
          >
            🧪 Available Tests ({tests.length})
          </button>
          <button
            className={`btn ${activeTab === 'MY_ORDERS' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab('MY_ORDERS')}
          >
            📋 My Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'PACKAGES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {tests.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
              No diagnostic tests currently listed in database.
            </div>
          ) : (
            tests.map((test) => (
              <div key={test._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 22 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      {test.category || 'BLOOD TEST'}
                    </span>
                    {test.homeCollectionAvailable && (
                      <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 8px' }}>Home Collection</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: '4px 0 6px' }}>{test.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                    ⏱ Turnaround: <strong>{test.turnaroundTime || '24 hours'}</strong> • Sample: {test.sampleType || 'Blood'}
                  </div>
                  {test.preparationInstructions && (
                    <div style={{ fontSize: 12, color: '#475569', background: 'var(--color-surface-2)', padding: 10, borderRadius: 8, marginBottom: 16 }}>
                      🍵 {test.preparationInstructions}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)' }}>
                    ₹{test.price}
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleBookTest(test)}>
                    Book Test →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'MY_ORDERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🧪</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>No lab tests booked yet</h4>
              <p style={{ margin: 0, fontSize: 13 }}>
                Book a diagnostic test from the Available Tests tab and your sample collection schedule will appear here.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      BOOKING #{b._id.slice(-8).toUpperCase()}
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>
                      {b.tests?.map((t) => t.name).join(', ') || 'Diagnostic Panel'}
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      Lab Partner: {b.labId?.name || 'MediCare Diagnostics'} • Type: {b.collectionType}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success">{b.status}</span>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>₹{b.totalAmount}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-secondary)', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    Scheduled: <strong>{b.scheduledDate ? format(new Date(b.scheduledDate), 'MMM d, yyyy') : '-'} at {b.scheduledTime}</strong>
                  </div>
                  <span className="badge badge-neutral">Paid via Razorpay</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Payment Modal */}
      {selectedTest && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          amount={selectedTest.price}
          serviceType="LAB_BOOKING"
          title={`Lab Test: ${selectedTest.name}`}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
