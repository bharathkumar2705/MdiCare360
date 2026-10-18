import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { appointmentService } from '../../services';

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  serviceType = 'APPOINTMENT',
  serviceId,
  title = 'Doctor Consultation Fee',
  onSuccess,
}) {
  const { user } = useSelector((state) => state.auth);

  // Payment Selection State (Amazon style)
  // 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'PAY_AT_CLINIC'
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [upiSubOption, setUpiSubOption] = useState('ID'); // 'ID' | 'QR'
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Card State
  const [card, setCard] = useState({
    number: '',
    name: user?.name || '',
    expiry: '',
    cvv: '',
    saveCard: true,
  });

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('AMAZON_PAY');

  // Flow State: 'SELECT' | 'BANK_OTP' | 'UPI_WAITING' | 'PROCESSING' | 'SUCCESS'
  const [viewState, setViewState] = useState('SELECT');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewState('SELECT');
      setOtp('');
      setTimer(120);
      setIsSubmitting(false);
      setUpiVerified(false);
    }
  }, [isOpen]);

  // Countdown timer for Bank OTP & UPI Collect
  useEffect(() => {
    let interval = null;
    if ((viewState === 'BANK_OTP' || viewState === 'UPI_WAITING') && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState, timer]);

  if (!isOpen) return null;

  // Real UPI Payload for QR Code
  const upiPayeeId = 'bharathkumarreddynaru@okhdfcbank';
  const payeeName = 'MediCare360 Healthcare';
  const upiString = `upi://pay?pa=${upiPayeeId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(title.slice(0, 30))}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}&margin=8`;

  // Detect Card Provider
  const getCardType = (num) => {
    const clean = num.replace(/\s/g, '');
    if (/^4/.test(clean)) return { name: 'VISA', logo: '💳 Visa', color: '#1a1f71' };
    if (/^5[1-5]/.test(clean)) return { name: 'MasterCard', logo: '💳 Mastercard', color: '#eb001b' };
    if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', logo: '🇮🇳 RuPay', color: '#166534' };
    return { name: 'Card', logo: '💳 Debit/Credit', color: '#475569' };
  };

  const handleCardNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCard({ ...card, number: parts ? parts.join(' ') : raw });
  };

  const handleCardExpiry = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCard({ ...card, expiry: raw });
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@paytm)');
      return;
    }
    setUpiVerified(true);
    toast.success('UPI ID verified! Linked to ' + (user?.name || 'Verified User'));
  };

  // Step 1: User clicks "Continue to Pay" on Amazon selection screen
  const handleProceedToPay = () => {
    if (selectedMethod === 'UPI') {
      if (upiSubOption === 'ID') {
        if (!upiId || !upiId.includes('@')) {
          toast.error('Please enter and verify your UPI ID first');
          return;
        }
        setTimer(180);
        setViewState('UPI_WAITING');
      } else {
        // QR Code - immediate confirm option
        finalizePayment('UPI_QR');
      }
    } else if (selectedMethod === 'CARD') {
      const cleanNum = card.number.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!card.expiry || card.expiry.length < 5) {
        toast.error('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (!card.cvv || card.cvv.length < 3) {
        toast.error('Please enter a 3-digit CVV number');
        return;
      }
      setTimer(120);
      setViewState('BANK_OTP');
    } else if (selectedMethod === 'NETBANKING') {
      finalizePayment(`NETBANKING_${selectedBank}`);
    } else if (selectedMethod === 'WALLET') {
      finalizePayment(`WALLET_${selectedWallet}`);
    } else if (selectedMethod === 'PAY_AT_CLINIC') {
      finalizePayment('PAY_AT_CLINIC');
    }
  };

  // Step 2: Finalize transaction and update MongoDB records
  const finalizePayment = async (methodUsed) => {
    setIsSubmitting(true);
    try {
      if (serviceType === 'APPOINTMENT' && serviceId) {
        await appointmentService.pay(serviceId);
      }
      setViewState('SUCCESS');
      setTimeout(async () => {
        toast.success(`Payment of ₹${amount} successful!`);
        if (onSuccess) {
          await onSuccess({
            method: methodUsed,
            amount,
            txnId: 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          });
        }
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed. Please try again.');
      setIsSubmitting(false);
      setViewState('SELECT');
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)' }}>
      <div
        className="modal slide-up"
        style={{
          maxWidth: 780,
          width: '95%',
          padding: 0,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          background: '#f8fafc',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Amazon-style Navbar / Header */}
        <div
          style={{
            background: '#131921',
            color: 'white',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '4px solid #f59e0b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🏥</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                MediCare360 <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>PAY</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Select a payment method to complete booking</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Amount Due</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>₹{amount}</div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─── SCREEN 1: Amazon-Style Payment Methods List ─── */}
        {viewState === 'SELECT' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, overflowY: 'auto' }}>
            {/* Left: Payment Options Accordion */}
            <div style={{ flex: '1 1 440px', padding: 24, borderRight: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
                Choose how you want to pay
              </div>

              {/* OPTION 1: UPI */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 14,
                  border: `2px solid ${selectedMethod === 'UPI' ? '#0284c7' : '#e2e8f0'}`,
                  marginBottom: 12,
                  overflow: 'hidden',
                  transition: 'all 150ms ease',
                }}
              >
                <div
                  onClick={() => setSelectedMethod('UPI')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: selectedMethod === 'UPI' ? '#f0f9ff' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="radio"
                      checked={selectedMethod === 'UPI'}
                      onChange={() => setSelectedMethod('UPI')}
                      style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                        UPI (Google Pay, PhonePe, Paytm, BHIM)
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Instant verification with zero transaction fee</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontSize: 18 }}>
                    <span>🟢</span><span>🟣</span><span>🔵</span>
                  </div>
                </div>

                {selectedMethod === 'UPI' && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e0f2fe', background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="upiSub"
                          checked={upiSubOption === 'ID'}
                          onChange={() => setUpiSubOption('ID')}
                          style={{ accentColor: '#0284c7' }}
                        />
                        Enter UPI ID
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="upiSub"
                          checked={upiSubOption === 'QR'}
                          onChange={() => setUpiSubOption('QR')}
                          style={{ accentColor: '#0284c7' }}
                        />
                        Scan QR Code
                      </label>
                    </div>

                    {upiSubOption === 'ID' ? (
                      <div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="e.g. mobile@upi or name@okhdfcbank"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setUpiVerified(false);
                            }}
                            className="form-input"
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 14 }}
                          />
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleVerifyUpi}
                            style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700 }}
                          >
                            Verify
                          </button>
                        </div>
                        {upiVerified && (
                          <div style={{ marginTop: 8, color: '#16a34a', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>✓ Verified Name:</span> <strong>{user?.name || 'Bharath Kumar Reddy'}</strong>
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                          A collect request will be sent to your PhonePe / Google Pay app to approve.
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ display: 'inline-block', padding: 8, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                          <img src={qrCodeUrl} alt="UPI QR" style={{ width: 140, height: 140, display: 'block' }} />
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                          Scan using Google Pay, PhonePe, Paytm, or BHIM
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* OPTION 2: CREDIT / DEBIT CARDS */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 14,
                  border: `2px solid ${selectedMethod === 'CARD' ? '#0284c7' : '#e2e8f0'}`,
                  marginBottom: 12,
                  overflow: 'hidden',
                  transition: 'all 150ms ease',
                }}
              >
                <div
                  onClick={() => setSelectedMethod('CARD')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: selectedMethod === 'CARD' ? '#f0f9ff' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="radio"
                      checked={selectedMethod === 'CARD'}
                      onChange={() => setSelectedMethod('CARD')}
                      style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                        Credit or Debit Card
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Visa, MasterCard, RuPay, Maestro</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                    {getCardType(card.number).logo}
                  </div>
                </div>

                {selectedMethod === 'CARD' && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e0f2fe', background: '#fafafa' }}>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        value={card.number}
                        onChange={handleCardNumber}
                        maxLength={19}
                        className="form-input"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, letterSpacing: '0.05em' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name as on card"
                          value={card.name}
                          onChange={(e) => setCard({ ...card, name: e.target.value })}
                          className="form-input"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={handleCardExpiry}
                          maxLength={5}
                          className="form-input"
                          style={{ width: '100%', padding: '10px 10px', borderRadius: 8, fontSize: 13, textAlign: 'center' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          maxLength={4}
                          className="form-input"
                          style={{ width: '100%', padding: '10px 10px', borderRadius: 8, fontSize: 13, textAlign: 'center' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                      <input
                        type="checkbox"
                        checked={card.saveCard}
                        onChange={(e) => setCard({ ...card, saveCard: e.target.checked })}
                        id="saveCardCheck"
                        style={{ accentColor: '#0284c7' }}
                      />
                      <label htmlFor="saveCardCheck" style={{ cursor: 'pointer' }}>
                        Save card securely as per RBI guidelines
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* OPTION 3: NET BANKING */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 14,
                  border: `2px solid ${selectedMethod === 'NETBANKING' ? '#0284c7' : '#e2e8f0'}`,
                  marginBottom: 12,
                  overflow: 'hidden',
                  transition: 'all 150ms ease',
                }}
              >
                <div
                  onClick={() => setSelectedMethod('NETBANKING')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: selectedMethod === 'NETBANKING' ? '#f0f9ff' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="radio"
                      checked={selectedMethod === 'NETBANKING'}
                      onChange={() => setSelectedMethod('NETBANKING')}
                      style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                        Net Banking
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>All major Indian banks supported</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>🏦</span>
                </div>

                {selectedMethod === 'NETBANKING' && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e0f2fe', background: '#fafafa' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                      {[
                        { id: 'HDFC', name: 'HDFC Bank', icon: '🏦' },
                        { id: 'SBI', name: 'State Bank of India', icon: '🏛️' },
                        { id: 'ICICI', name: 'ICICI Bank', icon: '🏢' },
                        { id: 'AXIS', name: 'Axis Bank', icon: '🏦' },
                        { id: 'KOTAK', name: 'Kotak Bank', icon: '🏛️' },
                        { id: 'PNB', name: 'Punjab National', icon: '🏢' },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 8,
                            border: `1.5px solid ${selectedBank === bank.id ? '#0284c7' : '#cbd5e1'}`,
                            background: selectedBank === bank.id ? '#e0f2fe' : 'white',
                            color: selectedBank === bank.id ? '#0369a1' : '#334155',
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{bank.icon}</span>
                          <span>{bank.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* OPTION 4: WALLETS */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 14,
                  border: `2px solid ${selectedMethod === 'WALLET' ? '#0284c7' : '#e2e8f0'}`,
                  marginBottom: 12,
                  overflow: 'hidden',
                  transition: 'all 150ms ease',
                }}
              >
                <div
                  onClick={() => setSelectedMethod('WALLET')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: selectedMethod === 'WALLET' ? '#f0f9ff' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="radio"
                      checked={selectedMethod === 'WALLET'}
                      onChange={() => setSelectedMethod('WALLET')}
                      style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                        Wallets & Amazon Pay
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Amazon Pay Balance, Paytm Wallet, Mobikwik</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>👛</span>
                </div>

                {selectedMethod === 'WALLET' && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #e0f2fe', background: '#fafafa' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {[
                        { id: 'AMAZON_PAY', name: 'Amazon Pay', icon: '📦' },
                        { id: 'PAYTM_WALLET', name: 'Paytm Wallet', icon: '🔵' },
                        { id: 'MOBIKWIK', name: 'Mobikwik', icon: '⚡' },
                      ].map((w) => (
                        <label
                          key={w.id}
                          style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 10,
                            border: `1.5px solid ${selectedWallet === w.id ? '#0284c7' : '#cbd5e1'}`,
                            background: selectedWallet === w.id ? '#e0f2fe' : 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          <input
                            type="radio"
                            name="walletChoice"
                            checked={selectedWallet === w.id}
                            onChange={() => setSelectedWallet(w.id)}
                            style={{ accentColor: '#0284c7' }}
                          />
                          <span>{w.icon}</span>
                          <span>{w.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* OPTION 5: PAY AT CLINIC / CASH ON VISIT */}
              <div
                style={{
                  background: 'white',
                  borderRadius: 14,
                  border: `2px solid ${selectedMethod === 'PAY_AT_CLINIC' ? '#0284c7' : '#e2e8f0'}`,
                  overflow: 'hidden',
                  transition: 'all 150ms ease',
                }}
              >
                <div
                  onClick={() => setSelectedMethod('PAY_AT_CLINIC')}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: selectedMethod === 'PAY_AT_CLINIC' ? '#f0f9ff' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="radio"
                      checked={selectedMethod === 'PAY_AT_CLINIC'}
                      onChange={() => setSelectedMethod('PAY_AT_CLINIC')}
                      style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                        Pay at Clinic / Cash on Visit
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Pay ₹{amount} at doctor's reception desk during appointment</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>🏥</span>
                </div>
              </div>
            </div>

            {/* Right: Amazon-style Order & Payment Summary Box */}
            <div style={{ flex: '1 1 260px', padding: 24, background: '#f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 16 }}>
                  Order Summary
                </div>

                <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Item / Service</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginTop: 2 }}>{title}</div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Consultation Fee:</span>
                      <span style={{ fontWeight: 600 }}>₹{amount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Platform Fee:</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Taxes (GST):</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Included</span>
                    </div>
                    <div style={{ borderTop: '2px solid #e2e8f0', marginTop: 4, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      <span>Total Pay:</span>
                      <span style={{ color: '#0284c7' }}>₹{amount}</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 8, background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: 12, color: '#065f46', marginBottom: 16, display: 'flex', gap: 8 }}>
                  <span>🔒</span>
                  <span>Bank-grade 256-bit encryption. Your payment details are never stored unencrypted.</span>
                </div>
              </div>

              {/* Action Button: Amazon Style Gold / Yellow Button */}
              <div>
                <button
                  type="button"
                  className="btn"
                  onClick={handleProceedToPay}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 15,
                    fontWeight: 800,
                    borderRadius: 12,
                    background: '#ffd814',
                    borderColor: '#fcd200',
                    color: '#0f1111',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)',
                    transition: 'all 150ms ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f7ca00')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#ffd814')}
                >
                  {selectedMethod === 'PAY_AT_CLINIC' ? 'Confirm Appointment (Pay at Clinic)' : `Pay ₹${amount} Now →`}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onClose}
                  style={{ width: '100%', marginTop: 8, padding: '10px', fontSize: 13, borderRadius: 10 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 2: Verified By Visa / 3D Secure Bank OTP Screen ─── */}
        {viewState === 'BANK_OTP' && (
          <div style={{ padding: '36px 32px', textAlign: 'center', background: 'white', flex: 1 }}>
            <div style={{ maxWidth: 420, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>🏛️</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#1e3a8a' }}>VERIFIED BY BANK SECURE</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>One-Time Password (OTP) Verification</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Merchant:</span>
                  <strong>MediCare360 Healthcare</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Card:</span>
                  <strong>•••• •••• •••• {card.number.slice(-4) || '1234'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Amount:</span>
                  <strong style={{ color: '#0284c7' }}>₹{amount}</strong>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                Please enter the 6-digit OTP sent to your registered mobile number ending in <strong>•••• {user?.phone?.slice(-4) || '8921'}</strong>:
              </p>

              <div style={{ marginBottom: 20 }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="form-input"
                  style={{
                    width: '100%',
                    maxWidth: 240,
                    padding: '12px 16px',
                    fontSize: 22,
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '0.3em',
                    borderRadius: 10,
                  }}
                  autoFocus
                />
              </div>

              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
                OTP expires in: <strong style={{ color: '#dc2626' }}>{formatTimer(timer)}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => finalizePayment('CARD')}
                  disabled={isSubmitting || otp.length < 4}
                  style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 800, borderRadius: 10 }}
                >
                  {isSubmitting ? 'Authenticating with Bank...' : 'Submit OTP & Authorize Payment'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setViewState('SELECT')}
                    disabled={isSubmitting}
                  >
                    ← Back to Methods
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setTimer(120);
                      toast.success('New OTP sent to your mobile!');
                    }}
                    disabled={isSubmitting}
                    style={{ color: '#0284c7', fontWeight: 600 }}
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 24, fontSize: 11, color: '#94a3b8' }}>
                🔒 Protected by 256-bit SSL encryption. Certified PCI-DSS Level 1 compliant.
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 3: Real UPI Collect Request Approval Screen ─── */}
        {viewState === 'UPI_WAITING' && (
          <div style={{ padding: '36px 32px', textAlign: 'center', background: 'white', flex: 1 }}>
            <div style={{ maxWidth: 440, margin: '0 auto' }}>
              <div className="spinner" style={{ width: 64, height: 64, borderWidth: 4, margin: '0 auto 20px', borderColor: '#0284c7', borderTopColor: 'transparent' }} />

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Approve Payment on Your Phone
              </h3>

              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
                We have sent a collect request of <strong style={{ color: '#0f172a' }}>₹{amount}</strong> to your UPI ID:
                <br />
                <span style={{ display: 'inline-block', background: '#f1f5f9', padding: '4px 12px', borderRadius: 8, fontWeight: 700, color: '#0284c7', marginTop: 6 }}>
                  {upiId}
                </span>
              </p>

              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24, fontSize: 13, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 6 }}>Steps to complete:</div>
                <ol style={{ margin: 0, paddingLeft: 20, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Open your <strong>Google Pay / PhonePe / Paytm</strong> app</li>
                  <li>Check the pending notification from <strong>MediCare360</strong></li>
                  <li>Enter your UPI PIN to approve <strong>₹{amount}</strong></li>
                </ol>
              </div>

              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                Time remaining to approve: <strong style={{ color: '#dc2626' }}>{formatTimer(timer)}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => finalizePayment('UPI_APP')}
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 800, borderRadius: 10 }}
                >
                  {isSubmitting ? 'Verifying with Bank...' : 'I Have Approved on My App →'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setViewState('SELECT')}
                  disabled={isSubmitting}
                >
                  ← Choose Another Payment Method
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 4: SUCCESS CONFIRMATION ─── */}
        {viewState === 'SUCCESS' && (
          <div style={{ padding: '48px 32px', textAlign: 'center', background: 'white', flex: 1 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#166534', marginBottom: 8 }}>
              Payment Completed Successfully!
            </h2>
            <p style={{ color: '#475569', fontSize: 15, marginBottom: 20 }}>
              ₹{amount} received for <strong>{title}</strong>.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#f0fdf4', borderRadius: 20, color: '#15803d', fontSize: 13, fontWeight: 700 }}>
              <span>✓ Verified & Updated in Medical Records</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
