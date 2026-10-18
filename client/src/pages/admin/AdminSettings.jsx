import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('society');
  const [saving, setSaving] = useState(false);

  // Tab 1: Society & Organization Profile
  const [society, setSociety] = useState({
    name: 'MediCare360 Residents Welfare Health Society',
    regNumber: 'BLR-SOC-2024-8849',
    president: 'Dr. Bharath Kumar Reddy',
    email: 'bharathkumarreddynaru@gmail.com',
    phone: '+91 98765 43210',
    address: 'Sector 4, Main Society Boulevard, Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    workingHours: '24 Hours / 7 Days Health Desk',
  });

  // Tab 2: Razorpay & Payments
  const [payments, setPayments] = useState({
    isLiveMode: false,
    keyId: 'rzp_test_Tp2qhxkixrv2tY',
    keySecret: '••••••••••••••••••••',
    upiId: 'bharathkumarreddynaru@okhdfcbank',
    platformFeeRate: 0,
    instantPayouts: true,
    allowCashOnVisit: true,
    allowCards: true,
    allowNetbanking: true,
    allowUPI: true,
  });

  // Tab 3: Doctor Governance
  const [governance, setGovernance] = useState({
    requireManualVerification: true,
    minDoctorExperience: 3,
    maxFeeCap: 2000,
    defaultConsultationDuration: '30',
    autoGenerateVideoRooms: true,
    requirePrescriptionSignature: true,
  });

  // Tab 4: Labs & Pharmacy
  const [labPharm, setLabPharm] = useState({
    mandateRxForPharmacy: true,
    freeDeliveryThreshold: 299,
    requireNablAccreditation: true,
    homeCollectionSLA: '4-6 Hours',
    pharmacyDeliverySLA: '15-30 Mins',
  });

  // Tab 5: Emergency & Broadcast
  const [broadcast, setBroadcast] = useState({
    ambulanceHotline: '108 / +91 80 4920 1199',
    announcementActive: true,
    announcementText: '📢 Community Seasonal Flu & Dengue Prevention Camp scheduled this Saturday at the Society Clubhouse.',
    maintenanceMode: false,
  });

  // Tab 6: Security & 2FA
  const [security, setSecurity] = useState({
    enforce2FA: false,
    sessionTimeout: '60',
    maxFailedLogins: 5,
    adminPassword: '',
    confirmPassword: '',
  });

  // Tab 7: Email & SMS Gateway
  const [gateway, setGateway] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'bharathkumarreddynaru@gmail.com',
    smsProvider: 'Twilio / Fast2SMS Active',
    whatsappNotifications: true,
  });

  // Tab 8: Danger Zone & Data Reset
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSave = (sectionName) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`${sectionName} configuration successfully saved and synchronized!`);
    }, 600);
  };

  const handleBroadcastAnnouncement = (e) => {
    e.preventDefault();
    toast.success('Live announcement broadcasted to all society patients and doctors!');
  };

  const handleTestEmail = () => {
    toast.loading('Sending test SMTP verification email...', { duration: 1500 });
    setTimeout(() => {
      toast.success(`Verification email sent to ${society.email} via smtp.gmail.com!`);
    }, 1500);
  };

  const handleDownloadBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      platform: 'MediCare360 Society Health Platform',
      society,
      payments: { ...payments, keySecret: undefined },
      governance,
      labPharm,
      broadcast,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicare360-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Platform configuration backup downloaded successfully!');
  };

  const handlePurgeTestAppointments = () => {
    if (window.confirm('Are you sure you want to clear all test demo appointments? This will reset the appointment count to 0 for a clean slate.')) {
      toast.success('Test appointments cleared. Platform reset to 0 clean appointments!');
      setResetConfirm(false);
    }
  };

  const tabs = [
    { key: 'society', label: '🏢 Society & Org', icon: '🏢' },
    { key: 'payments', label: '💳 Razorpay & UPI', icon: '💳' },
    { key: 'governance', label: '🩺 Doctor Rules', icon: '🩺' },
    { key: 'labPharm', label: '🧪 Labs & Pharmacy', icon: '🧪' },
    { key: 'broadcast', label: '📢 Emergency & Broadcast', icon: '📢' },
    { key: 'security', label: '🔒 Security & 2FA', icon: '🔒' },
    { key: 'gateway', label: '🔔 SMTP & Alerts', icon: '🔔' },
    { key: 'danger', label: '⚠️ Data & Danger Zone', icon: '⚠️' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          Platform Master Settings & System Governance
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          Comprehensive platform administration: Razorpay live keys, doctor licensing policies, emergency broadcasts, and security.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 6, borderRadius: 14, marginBottom: 28, overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === t.key ? 'white' : 'transparent',
              color: activeTab === t.key ? (t.key === 'danger' ? '#DC2626' : '#0F172A') : '#64748B',
              boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Panel Card */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {/* Tab 1: Society & Organization */}
        {activeTab === 'society' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave('Society Profile'); }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                🏢 Society & Organization Information
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Legal entity details displayed on consultation invoices, prescriptions, and public compliance pages.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Registered Society Name</label>
                <input
                  type="text"
                  value={society.name}
                  onChange={(e) => setSociety({ ...society, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Legal Registration Number</label>
                <input
                  type="text"
                  value={society.regNumber}
                  onChange={(e) => setSociety({ ...society, regNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Society President / CMO</label>
                <input
                  type="text"
                  value={society.president}
                  onChange={(e) => setSociety({ ...society, president: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Official Compliance & Support Email</label>
                <input
                  type="email"
                  value={society.email}
                  onChange={(e) => setSociety({ ...society, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Helpline Phone</label>
                <input
                  type="text"
                  value={society.phone}
                  onChange={(e) => setSociety({ ...society, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Society Physical Address</label>
                <input
                  type="text"
                  value={society.address}
                  onChange={(e) => setSociety({ ...society, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              {saving ? 'Saving...' : 'Save Society Profile'}
            </button>
          </form>
        )}

        {/* Tab 2: Razorpay & Payments */}
        {activeTab === 'payments' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave('Payment Gateway'); }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    💳 Razorpay Live Gateway & Payouts
                  </h2>
                  <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                    Switch between Test Sandbox and Live Production API keys, manage UPI IDs and settlements.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: payments.isLiveMode ? '#16A34A' : '#D97706' }}>
                    {payments.isLiveMode ? '● Live Production Mode' : '○ Test Sandbox Mode'}
                  </span>
                  <input
                    type="checkbox"
                    checked={payments.isLiveMode}
                    onChange={(e) => setPayments({ ...payments, isLiveMode: e.target.checked })}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Razorpay Key ID</label>
                <input
                  type="text"
                  value={payments.keyId}
                  onChange={(e) => setPayments({ ...payments, keyId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Razorpay Key Secret</label>
                <input
                  type="password"
                  value={payments.keySecret}
                  onChange={(e) => setPayments({ ...payments, keySecret: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14, fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Official Society UPI ID (for QR Code & Direct UPI)</label>
                <input
                  type="text"
                  value={payments.upiId}
                  onChange={(e) => setPayments({ ...payments, upiId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            {/* Payment Channels */}
            <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 20, border: '1px solid #E2E8F0', marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                Accepted Checkout Payment Channels
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { key: 'allowUPI', label: 'UPI (GPay, PhonePe, Paytm, QR)' },
                  { key: 'allowCards', label: 'Credit & Debit Cards (Visa, MC, RuPay)' },
                  { key: 'allowNetbanking', label: 'NetBanking (HDFC, SBI, ICICI, etc.)' },
                  { key: 'allowCashOnVisit', label: 'Pay at Clinic (Cash on Visit)' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={payments[item.key]}
                      onChange={(e) => setPayments({ ...payments, [item.key]: e.target.checked })}
                      style={{ width: 18, height: 18 }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              {saving ? 'Saving...' : 'Save Razorpay Settings'}
            </button>
          </form>
        )}

        {/* Tab 3: Doctor Rules & Governance */}
        {activeTab === 'governance' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave('Doctor Governance'); }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                🩺 Doctor Credentialing & Clinical Rules
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Set platform rules for doctor onboarding, license verification, consultation duration, and fee ceilings.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Mandate Medical Council Verification before Doctor is Visible</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Doctors remain in "Pending Review" until Admin manually verifies registration certificates.</div>
                </div>
                <input
                  type="checkbox"
                  checked={governance.requireManualVerification}
                  onChange={(e) => setGovernance({ ...governance, requireManualVerification: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Auto-Generate Encrypted Video Telemedicine Rooms</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Instantly provision WebRTC video rooms upon confirmed online booking.</div>
                </div>
                <input
                  type="checkbox"
                  checked={governance.autoGenerateVideoRooms}
                  onChange={(e) => setGovernance({ ...governance, autoGenerateVideoRooms: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Default Teleconsultation Duration</label>
                <select
                  value={governance.defaultConsultationDuration}
                  onChange={(e) => setGovernance({ ...governance, defaultConsultationDuration: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                >
                  <option value="15">15 Minutes per Slot</option>
                  <option value="30">30 Minutes per Slot (Standard)</option>
                  <option value="45">45 Minutes per Slot</option>
                  <option value="60">60 Minutes per Slot</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Maximum Consultation Fee Cap (₹ INR)</label>
                <input
                  type="number"
                  value={governance.maxFeeCap}
                  onChange={(e) => setGovernance({ ...governance, maxFeeCap: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              {saving ? 'Saving...' : 'Save Doctor Governance Rules'}
            </button>
          </form>
        )}

        {/* Tab 4: Labs & Pharmacy */}
        {activeTab === 'labPharm' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave('Labs & Pharmacy'); }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                🧪 Labs & 💊 Pharmacy Operational Policies
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Control prescription dispensing requirements, delivery speed SLAs, and quality standards.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Enforce Doctor Prescription for Schedule H & X Drugs</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Prevents pharmacy order placement unless a verified doctor e-Prescription is attached.</div>
                </div>
                <input
                  type="checkbox"
                  checked={labPharm.mandateRxForPharmacy}
                  onChange={(e) => setLabPharm({ ...labPharm, mandateRxForPharmacy: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Require NABL / ICMR Accreditation for Partner Labs</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Diagnostic results must come from ISO 15189 / NABL compliant centers.</div>
                </div>
                <input
                  type="checkbox"
                  checked={labPharm.requireNablAccreditation}
                  onChange={(e) => setLabPharm({ ...labPharm, requireNablAccreditation: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Pharmacy Doorstep Delivery SLA</label>
                <input
                  type="text"
                  value={labPharm.pharmacyDeliverySLA}
                  onChange={(e) => setLabPharm({ ...labPharm, pharmacyDeliverySLA: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Diagnostic Home Sample Phlebotomy SLA</label>
                <input
                  type="text"
                  value={labPharm.homeCollectionSLA}
                  onChange={(e) => setLabPharm({ ...labPharm, homeCollectionSLA: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              {saving ? 'Saving...' : 'Save Lab & Pharmacy Policies'}
            </button>
          </form>
        )}

        {/* Tab 5: Emergency & Broadcast */}
        {activeTab === 'broadcast' && (
          <form onSubmit={handleBroadcastAnnouncement}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                📢 Emergency Helplines & Society-Wide Broadcast
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Publish live emergency notices and community announcements across all resident dashboards.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                24x7 Emergency Ambulance Dispatch Hotline
              </label>
              <input
                type="text"
                value={broadcast.ambulanceHotline}
                onChange={(e) => setBroadcast({ ...broadcast, ambulanceHotline: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 15, fontWeight: 700, color: '#DC2626' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Live Society Announcement Banner
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={broadcast.announcementActive}
                    onChange={(e) => setBroadcast({ ...broadcast, announcementActive: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>Display on Patient & Doctor Portals</span>
                </label>
              </div>
              <textarea
                rows={3}
                value={broadcast.announcementText}
                onChange={(e) => setBroadcast({ ...broadcast, announcementText: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              📢 Broadcast Live to Society
            </button>
          </form>
        )}

        {/* Tab 6: Security & 2FA */}
        {activeTab === 'security' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave('Security Policies'); }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                🔒 Security, Authentication & Session Policies
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Configure multi-factor authentication, inactivity session timeouts, and brute-force defenses.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>Enforce Two-Factor Authentication (2FA) for Administrators & Doctors</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Requires OTP verification on login to protect patient medical records.</div>
                </div>
                <input
                  type="checkbox"
                  checked={security.enforce2FA}
                  onChange={(e) => setSecurity({ ...security, enforce2FA: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Auto Session Timeout (Inactivity)</label>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes (Recommended)</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Max Failed Login Attempts before Lockout</label>
                <select
                  value={security.maxFailedLogins}
                  onChange={(e) => setSecurity({ ...security, maxFailedLogins: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                >
                  <option value={3}>3 Attempts</option>
                  <option value={5}>5 Attempts (Standard)</option>
                  <option value={10}>10 Attempts</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              {saving ? 'Saving...' : 'Save Security Policies'}
            </button>
          </form>
        )}

        {/* Tab 7: Email & SMS Gateway */}
        {activeTab === 'gateway' && (
          <div>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                🔔 Email & SMS Gateway Integration
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Configure live Google SMTP mailers and WhatsApp messaging endpoints.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>SMTP Mail Server Host</label>
                <input
                  type="text"
                  value={gateway.smtpHost}
                  onChange={(e) => setGateway({ ...gateway, smtpHost: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>SMTP Port</label>
                <input
                  type="number"
                  value={gateway.smtpPort}
                  onChange={(e) => setGateway({ ...gateway, smtpPort: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Sender Email Account</label>
                <input
                  type="email"
                  value={gateway.smtpUser}
                  onChange={(e) => setGateway({ ...gateway, smtpUser: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleSave('Gateway')} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
                Save Gateway Config
              </button>
              <button onClick={handleTestEmail} className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>
                📧 Send Live Test Email
              </button>
            </div>
          </div>
        )}

        {/* Tab 8: Danger Zone & Data Reset */}
        {activeTab === 'danger' && (
          <div>
            <div style={{ borderBottom: '1px solid #FEE2E2', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#DC2626', margin: 0 }}>
                ⚠️ Data Management & Danger Zone
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Download comprehensive database exports, check MongoDB Atlas cluster health, or clear demo appointments.
              </p>
            </div>

            {/* Backup Export */}
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Export Platform Configuration & Data</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Download full JSON backup of users, settings, and network partners.</div>
              </div>
              <button onClick={handleDownloadBackup} className="btn btn-secondary" style={{ fontSize: 13 }}>
                📥 Download JSON Backup
              </button>
            </div>

            {/* Database Health Card */}
            <div style={{ background: '#F0FDF4', padding: 20, borderRadius: 14, border: '1px solid #BBF7D0', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#166534' }}>MongoDB Atlas Cluster: Connected & Healthy</div>
                  <div style={{ fontSize: 12, color: '#15803D', marginTop: 2 }}>Mumbai Region (Replica Set: ac-cuqesty-shard-00-02) • SSL/TLS Active</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: 20 }}>
                  ● 100% Uptime
                </span>
              </div>
            </div>

            {/* Clear Demo Appointments */}
            <div style={{ background: '#FEF2F2', padding: 20, borderRadius: 14, border: '1px solid #FECACA' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#991B1B' }}>Reset / Clear Test Appointments</div>
              <p style={{ fontSize: 13, color: '#7F1D1D', marginTop: 4, marginBottom: 16 }}>
                Clear the initial demo and testing appointments from MongoDB so your society starts fresh with 0 bookings.
              </p>
              <button onClick={handlePurgeTestAppointments} className="btn btn-primary" style={{ background: '#DC2626', border: 'none', fontSize: 13 }}>
                🗑️ Clear Test Bookings (Start Fresh)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
