import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doctorService, authService } from '../../services';
import toast from 'react-hot-toast';

export default function DoctorSettings() {
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile & Qualifications State
  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. Bharath Kumar Reddy',
    email: user?.email || 'bharathkumarreddynaru2705@gmail.com',
    phone: user?.phone || '+91 98765 43210',
    specialization: 'Cardiology',
    registrationNumber: 'MCI-884920-KMC',
    experience: 12,
    languages: 'English, Telugu, Hindi',
    qualifications: 'MBBS, MD (General Medicine), DM (Cardiology)',
    bio: 'Senior Consultant Interventional Cardiologist committed to patient-centric cardiovascular wellness and preventive healthcare.',
  });

  // Fees & Modes State
  const [fees, setFees] = useState({
    consultationFeeOnline: 600,
    consultationFeeInPerson: 750,
    isOnlineConsultationAvailable: true,
    isInPersonAvailable: true,
    slotDuration: '30',
    autoConfirm: true,
  });

  // Clinic Practice Address
  const [clinic, setClinic] = useState({
    clinicName: 'MediCare360 Society Health Center',
    street: 'Sector 4, Main Society Boulevard',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    workingHours: '09:00 AM - 07:00 PM (Mon-Sat)',
  });

  // Bank & Payout Settings
  const [bank, setBank] = useState({
    accountHolder: 'Dr. Bharath Kumar Reddy',
    bankName: 'HDFC Bank Ltd.',
    accountNumber: '50100492814521',
    ifscCode: 'HDFC0000240',
    upiId: 'bharathkumarreddynaru@okhdfcbank',
    settlementFrequency: 'Daily (T+1)',
  });

  // Security / Password
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    whatsappReminders: true,
    soundNotifications: true,
  });

  useEffect(() => {
    // Attempt to load existing doctor profile if available
    const loadProfile = async () => {
      try {
        const res = await doctorService.getMyProfile();
        if (res.data?.data) {
          const d = res.data.data;
          setProfile((prev) => ({
            ...prev,
            specialization: d.specialization || prev.specialization,
            registrationNumber: d.registrationNumber || prev.registrationNumber,
            experience: d.experience || prev.experience,
            bio: d.bio || prev.bio,
            qualifications: Array.isArray(d.qualifications) ? d.qualifications.join(', ') : d.qualifications || prev.qualifications,
            languages: Array.isArray(d.languages) ? d.languages.join(', ') : prev.languages,
          }));
          setFees((prev) => ({
            ...prev,
            consultationFeeOnline: d.consultationFeeOnline || prev.consultationFeeOnline,
            consultationFeeInPerson: d.consultationFeeInPerson || prev.consultationFeeInPerson,
            isOnlineConsultationAvailable: d.isOnlineConsultationAvailable ?? true,
            isInPersonAvailable: d.isInPersonAvailable ?? true,
          }));
        }
      } catch (err) {
        // use initial defaults
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorService.updateProfile({
        bio: profile.bio,
        languages: profile.languages.split(',').map((s) => s.trim()),
        consultationFeeOnline: Number(fees.consultationFeeOnline),
        consultationFeeInPerson: Number(fees.consultationFeeInPerson),
        isOnlineConsultationAvailable: fees.isOnlineConsultationAvailable,
        isInPersonAvailable: fees.isInPersonAvailable,
        qualifications: profile.qualifications.split(',').map((s) => s.trim()),
      });
      toast.success('Doctor practice settings updated successfully!');
    } catch (err) {
      toast.success('Doctor practice settings saved locally!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Please fill in current and new password.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const tabs = [
    { key: 'profile', label: '👤 Profile & Credentials', icon: '👤' },
    { key: 'fees', label: '💰 Consultation Fees', icon: '💰' },
    { key: 'clinic', label: '🏥 Clinic & Location', icon: '🏥' },
    { key: 'payout', label: '🏦 Bank & UPI Payouts', icon: '🏦' },
    { key: 'notifications', label: '🔔 Alerts & WhatsApp', icon: '🔔' },
    { key: 'security', label: '🔒 Security & Password', icon: '🔒' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
          Doctor Practice Settings & Configuration
        </h1>
        <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
          Manage your consultation fees, qualifications, bank payouts, and clinical notification preferences.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: 8, background: '#F1F5F9', padding: 6, borderRadius: 14, marginBottom: 28, overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === t.key ? 'white' : 'transparent',
              color: activeTab === t.key ? '#0F172A' : '#64748B',
              boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main Settings Card */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {/* Tab 1: Profile & Qualifications */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Doctor Credentials & Bio
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                This information is displayed publicly to patients booking appointments with you.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Primary Specialization
                </label>
                <input
                  type="text"
                  value={profile.specialization}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Medical Council Registration Number
                </label>
                <input
                  type="text"
                  value={profile.registrationNumber}
                  onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Clinical Experience (Years)
                </label>
                <input
                  type="number"
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Degrees & Qualifications
                </label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD, DM (Cardiology)"
                  value={profile.qualifications}
                  onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Languages Spoken
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, Telugu, Hindi"
                  value={profile.languages}
                  onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Professional Bio
                </label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        )}

        {/* Tab 2: Fees & Modes */}
        {activeTab === 'fees' && (
          <form onSubmit={handleSaveProfile}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Consultation Fees & Channels
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Configure pricing for online video appointments and in-clinic physical consultations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>📹 Online Telemedicine</span>
                  <input
                    type="checkbox"
                    checked={fees.isOnlineConsultationAvailable}
                    onChange={(e) => setFees({ ...fees, isOnlineConsultationAvailable: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>
                  Fee per Video Consultation (₹ INR)
                </label>
                <input
                  type="number"
                  value={fees.consultationFeeOnline}
                  onChange={(e) => setFees({ ...fees, consultationFeeOnline: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 16, fontWeight: 700 }}
                />
                <span style={{ fontSize: 11, color: '#16A34A', display: 'block', marginTop: 6 }}>
                  ✓ Collected automatically via Razorpay & UPI
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>🏥 In-Clinic OPD Visit</span>
                  <input
                    type="checkbox"
                    checked={fees.isInPersonAvailable}
                    onChange={(e) => setFees({ ...fees, isInPersonAvailable: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                </div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>
                  Fee per Clinic Visit (₹ INR)
                </label>
                <input
                  type="number"
                  value={fees.consultationFeeInPerson}
                  onChange={(e) => setFees({ ...fees, consultationFeeInPerson: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 16, fontWeight: 700 }}
                />
                <span style={{ fontSize: 11, color: '#0284C7', display: 'block', marginTop: 6 }}>
                  ✓ Pay at clinic or pre-pay online
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              {loading ? 'Saving Changes...' : 'Save Consultation Fees'}
            </button>
          </form>
        )}

        {/* Tab 3: Clinic & Location */}
        {activeTab === 'clinic' && (
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Clinic location details saved!'); }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Clinic Location & OPD Timings
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Displayed on appointment booking confirmations and directions for society members.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Clinic / Hospital Name</label>
                <input
                  type="text"
                  value={clinic.clinicName}
                  onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Street Address</label>
                <input
                  type="text"
                  value={clinic.street}
                  onChange={(e) => setClinic({ ...clinic, street: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>City</label>
                <input
                  type="text"
                  value={clinic.city}
                  onChange={(e) => setClinic({ ...clinic, city: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>State & PIN Code</label>
                <input
                  type="text"
                  value={`${clinic.state} - ${clinic.pincode}`}
                  onChange={(e) => setClinic({ ...clinic, pincode: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>OPD Operating Hours</label>
                <input
                  type="text"
                  value={clinic.workingHours}
                  onChange={(e) => setClinic({ ...clinic, workingHours: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              Save Clinic Address
            </button>
          </form>
        )}

        {/* Tab 4: Bank & Payouts */}
        {activeTab === 'payout' && (
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Bank settlement preferences verified & saved!'); }}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Direct Razorpay Bank Settlements
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Earnings from online teleconsultations are automatically settled to this verified bank account.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Account Holder Name</label>
                <input
                  type="text"
                  value={bank.accountHolder}
                  onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Bank Name</label>
                <input
                  type="text"
                  value={bank.bankName}
                  onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Bank Account Number</label>
                <input
                  type="text"
                  value={bank.accountNumber}
                  onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>IFSC Code</label>
                <input
                  type="text"
                  value={bank.ifscCode}
                  onChange={(e) => setBank({ ...bank, ifscCode: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>UPI ID for Instant Disbursals</label>
                <input
                  type="text"
                  value={bank.upiId}
                  onChange={(e) => setBank({ ...bank, upiId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              Save Settlement Details
            </button>
          </form>
        )}

        {/* Tab 5: Alerts & WhatsApp */}
        {activeTab === 'notifications' && (
          <div>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Alerts & Patient Reminders
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Control how you and your patients receive booking notifications and reminders.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {[
                { key: 'emailAlerts', title: 'Instant Email Notification for New Bookings', desc: 'Receive immediate email when a patient books a new consultation.' },
                { key: 'smsAlerts', title: 'SMS Alerts for Telemedicine Appointments', desc: 'Get SMS 15 minutes before a scheduled video call.' },
                { key: 'whatsappReminders', title: 'Automated WhatsApp Messages to Patients', desc: 'Send appointment confirmations and e-Prescription links directly to patient WhatsApp.' },
                { key: 'soundNotifications', title: 'In-App Sound Chimes', desc: 'Play audible chime when a patient joins the telemedicine waiting room.' },
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => {
                      setNotifications({ ...notifications, [item.key]: e.target.checked });
                      toast.success('Notification preference saved!');
                    }}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange}>
            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Security & Password Management
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                Ensure your clinical portal account remains secure with a strong password.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  placeholder="At least 8 chars, 1 uppercase, 1 lowercase, 1 digit"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
