import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { patientService, authService } from '../../services';
import { logout } from '../../store/slices/authSlice';
import { LoadingSpinner } from '../../components/common/UI';

export default function PatientSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState('PROFILE');

  // User & Patient form state
  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '' });
  const [patientProfile, setPatientProfile] = useState({
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    allergies: '',
    smokingStatus: 'NEVER',
    alcoholUse: 'NONE',
    height: { value: '', unit: 'cm' },
    weight: { value: '', unit: 'kg' },
  });

  // Password & Security
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // App & Regional Preferences
  const [preferences, setPreferences] = useState({
    language: 'English',
    theme: 'Light',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR (₹)',
    autoDownloadReports: true,
  });

  // Billing & GST
  const [billing, setBilling] = useState({
    defaultPayment: 'UPI',
    gstin: '',
    panNumber: '',
  });

  // Family Members / Dependents
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'Ananya Reddy', relationship: 'Spouse', age: 28, bloodGroup: 'B+' },
    { id: 2, name: 'Aarav Reddy', relationship: 'Child', age: 5, bloodGroup: 'O+' },
  ]);
  const [newFamily, setNewFamily] = useState({ name: '', relationship: 'Child', age: '', bloodGroup: 'O+' });
  const [showAddFamily, setShowAddFamily] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailAppointment: true,
    emailPrescription: true,
    smsAlerts: true,
    whatsappUpdates: true,
    refillReminders: true,
    promotional: false,
  });

  // Security preferences
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionAlerts: true,
  });

  // Active sessions mock list
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Windows PC • Chrome Browser', location: 'Hyderabad, India', ip: '115.243.91.113', current: true },
    { id: 2, device: 'Android Phone • Chrome Mobile', location: 'Hyderabad, India', ip: '14.139.187.130', current: false },
  ]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await patientService.getProfile();
      const u = res.data.data.user || {};
      const p = res.data.data.patient || {};

      setUserProfile({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
      });

      setPatientProfile({
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        gender: p.gender || 'MALE',
        bloodGroup: p.bloodGroup || 'O+',
        address: {
          street: p.address?.street || '',
          city: p.address?.city || '',
          state: p.address?.state || '',
          pincode: p.address?.pincode || '',
          country: p.address?.country || 'India',
        },
        emergencyContact: {
          name: p.emergencyContact?.name || '',
          relationship: p.emergencyContact?.relationship || '',
          phone: p.emergencyContact?.phone || '',
        },
        allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : '',
        smokingStatus: p.smokingStatus || 'NEVER',
        alcoholUse: p.alcoholUse || 'NONE',
        height: { value: p.height?.value || '', unit: p.height?.unit || 'cm' },
        weight: { value: p.weight?.value || '', unit: p.weight?.unit || 'kg' },
      });
    } catch (err) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name: userProfile.name,
        phone: userProfile.phone,
        dateOfBirth: patientProfile.dateOfBirth || undefined,
        gender: patientProfile.gender,
        bloodGroup: patientProfile.bloodGroup,
        address: patientProfile.address,
        emergencyContact: patientProfile.emergencyContact,
        allergies: patientProfile.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        smokingStatus: patientProfile.smokingStatus,
        alcoholUse: patientProfile.alcoholUse,
        height: patientProfile.height,
        weight: patientProfile.weight,
      };

      await patientService.updateProfile(payload);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    }
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleAddFamilyMember = (e) => {
    e.preventDefault();
    if (!newFamily.name || !newFamily.age) {
      toast.error('Please enter name and age');
      return;
    }
    setFamilyMembers([...familyMembers, { ...newFamily, id: Date.now() }]);
    setNewFamily({ name: '', relationship: 'Child', age: '', bloodGroup: 'O+' });
    setShowAddFamily(false);
    toast.success('Family member added successfully!');
  };

  const handleRemoveFamily = (id) => {
    setFamilyMembers(familyMembers.filter((f) => f.id !== id));
    toast.success('Family member profile removed');
  };

  const exportPersonalHealthData = () => {
    const data = {
      user: userProfile,
      medicalProfile: patientProfile,
      dependents: familyMembers,
      preferences,
      exportedAt: new Date().toISOString(),
      platform: 'MediCare360 National EHR Portal',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `medicare360_health_record_${userProfile.name?.replace(/\s+/g, '_') || 'patient'}.json`);
    dlAnchorElem.click();
    toast.success('Your complete health dataset downloaded!');
  };

  if (loading) return <LoadingSpinner text="Loading your account settings..." />;

  const tabs = [
    { id: 'PROFILE', label: 'Personal & Contact', icon: '👤' },
    { id: 'MEDICAL', label: 'Vitals & Emergency', icon: '🩺' },
    { id: 'PREFERENCES', label: 'App & Language', icon: '🌐' },
    { id: 'FAMILY', label: 'Family & Dependents', icon: '👨‍👩‍👧' },
    { id: 'BILLING', label: 'Billing & GST', icon: '💳' },
    { id: 'SECURITY', label: 'Password & Sessions', icon: '🔒' },
    { id: 'NOTIFICATIONS', label: 'Alerts & WhatsApp', icon: '🔔' },
    { id: 'PRIVACY', label: 'Data & Account Actions', icon: '🛡️' },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 980, margin: '0 auto', paddingBottom: 60 }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Comprehensive Settings</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
            Manage identity, medical vitals, family members, payment preferences, language, and security.
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleLogout}
          style={{ borderColor: '#fca5a5', color: '#dc2626', background: '#fff5f5', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 150ms ease',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE & PERSONAL DETAILS */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px', color: 'var(--color-text)' }}>Personal & Identity Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>FULL NAME</label>
              <input
                type="text"
                className="input"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>REGISTERED EMAIL (VERIFIED)</label>
              <input
                type="email"
                className="input"
                value={userProfile.email}
                disabled
                style={{ width: '100%', background: 'var(--color-surface-2)', cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>MOBILE NUMBER</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 98765 43210"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>DATE OF BIRTH</label>
              <input
                type="date"
                className="input"
                value={patientProfile.dateOfBirth}
                onChange={(e) => setPatientProfile({ ...patientProfile, dateOfBirth: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>GENDER</label>
              <select
                className="input"
                value={patientProfile.gender}
                onChange={(e) => setPatientProfile({ ...patientProfile, gender: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>BLOOD GROUP</label>
              <select
                className="input"
                value={patientProfile.bloodGroup}
                onChange={(e) => setPatientProfile({ ...patientProfile, bloodGroup: e.target.value })}
                style={{ width: '100%' }}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '24px 0 16px', color: 'var(--color-text)', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
            Permanent Residential Address
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>STREET ADDRESS</label>
              <input
                type="text"
                className="input"
                placeholder="House / Flat No., Society / Apartment Name, Street"
                value={patientProfile.address.street}
                onChange={(e) => setPatientProfile({ ...patientProfile, address: { ...patientProfile.address, street: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>CITY</label>
              <input
                type="text"
                className="input"
                placeholder="City (e.g. Hyderabad)"
                value={patientProfile.address.city}
                onChange={(e) => setPatientProfile({ ...patientProfile, address: { ...patientProfile.address, city: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>STATE</label>
              <input
                type="text"
                className="input"
                placeholder="State (e.g. Telangana)"
                value={patientProfile.address.state}
                onChange={(e) => setPatientProfile({ ...patientProfile, address: { ...patientProfile.address, state: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>PIN CODE</label>
              <input
                type="text"
                className="input"
                placeholder="6-digit PIN"
                value={patientProfile.address.pincode}
                onChange={(e) => setPatientProfile({ ...patientProfile, address: { ...patientProfile.address, pincode: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving Details...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MEDICAL, VITALS & EMERGENCY */}
      {activeTab === 'MEDICAL' && (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px', color: 'var(--color-text)' }}>Medical Profile & Emergency Contact</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>HEIGHT (CM)</label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 175"
                value={patientProfile.height.value}
                onChange={(e) => setPatientProfile({ ...patientProfile, height: { ...patientProfile.height, value: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>WEIGHT (KG)</label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 70"
                value={patientProfile.weight.value}
                onChange={(e) => setPatientProfile({ ...patientProfile, weight: { ...patientProfile.weight, value: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>SMOKING STATUS</label>
              <select
                className="input"
                value={patientProfile.smokingStatus}
                onChange={(e) => setPatientProfile({ ...patientProfile, smokingStatus: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="NEVER">Non-Smoker</option>
                <option value="FORMER">Former Smoker</option>
                <option value="CURRENT">Current Smoker</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>ALCOHOL CONSUMPTION</label>
              <select
                className="input"
                value={patientProfile.alcoholUse}
                onChange={(e) => setPatientProfile({ ...patientProfile, alcoholUse: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="NONE">None</option>
                <option value="OCCASIONAL">Occasional</option>
                <option value="MODERATE">Moderate</option>
                <option value="HEAVY">Frequent</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              DRUG & SUBSTANCE ALLERGIES (COMMA SEPARATED)
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Dust"
              value={patientProfile.allergies}
              onChange={(e) => setPatientProfile({ ...patientProfile, allergies: e.target.value })}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Alerts doctors automatically whenever e-prescriptions or lab tests are ordered.
            </p>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '24px 0 16px', color: 'var(--color-text)', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
            Emergency Contact Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>CONTACT NAME</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. S. Reddy"
                value={patientProfile.emergencyContact.name}
                onChange={(e) => setPatientProfile({ ...patientProfile, emergencyContact: { ...patientProfile.emergencyContact, name: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>RELATIONSHIP</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Spouse / Parent / Sibling"
                value={patientProfile.emergencyContact.relationship}
                onChange={(e) => setPatientProfile({ ...patientProfile, emergencyContact: { ...patientProfile.emergencyContact, relationship: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>EMERGENCY PHONE</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 98765 00000"
                value={patientProfile.emergencyContact.phone}
                onChange={(e) => setPatientProfile({ ...patientProfile, emergencyContact: { ...patientProfile.emergencyContact, phone: e.target.value } })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Medical Vitals'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: APP & LANGUAGE PREFERENCES */}
      {activeTab === 'PREFERENCES' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px', color: 'var(--color-text)' }}>App Language & Regional Settings</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>INTERFACE LANGUAGE</label>
              <select
                className="input"
                value={preferences.language}
                onChange={(e) => {
                  setPreferences({ ...preferences, language: e.target.value });
                  toast.success(`Language set to ${e.target.value}`);
                }}
                style={{ width: '100%' }}
              >
                <option value="English">English (Default)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>APPEARANCE & THEME</label>
              <select
                className="input"
                value={preferences.theme}
                onChange={(e) => {
                  setPreferences({ ...preferences, theme: e.target.value });
                  toast.success(`Theme updated to ${e.target.value}`);
                }}
                style={{ width: '100%' }}
              >
                <option value="Light">☀️ Light Theme (Default)</option>
                <option value="Dark">🌙 Dark Modern Mode</option>
                <option value="System">🖥️ Follow System Setting</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>DATE FORMAT</label>
              <select
                className="input"
                value={preferences.dateFormat}
                onChange={(e) => {
                  setPreferences({ ...preferences, dateFormat: e.target.value });
                  toast.success('Date format saved');
                }}
                style={{ width: '100%' }}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 20/10/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/20/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>CURRENCY</label>
              <select className="input" value={preferences.currency} disabled style={{ width: '100%', background: 'var(--color-surface-2)' }}>
                <option value="INR (₹)">Indian Rupee - INR (₹)</option>
              </select>
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: 'var(--color-surface-2)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Auto-Download Signed Prescriptions</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Automatically save doctor PDF prescriptions to downloads after consult</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoDownloadReports}
              onChange={(e) => {
                setPreferences({ ...preferences, autoDownloadReports: e.target.checked });
                toast.success('Preference updated');
              }}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>
        </div>
      )}

      {/* TAB 4: FAMILY MEMBERS & DEPENDENTS */}
      {activeTab === 'FAMILY' && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Family Members & Dependents</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '4px 0 0' }}>
                Book appointments and store prescriptions for your spouse, children, or elderly parents under one account.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddFamily(!showAddFamily)}>
              {showAddFamily ? 'Cancel' : '+ Add Family Member'}
            </button>
          </div>

          {showAddFamily && (
            <form onSubmit={handleAddFamilyMember} style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Add Dependent Profile</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Name"
                    value={newFamily.name}
                    onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Relationship</label>
                  <select
                    className="input"
                    value={newFamily.relationship}
                    onChange={(e) => setNewFamily({ ...newFamily, relationship: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child / Dependent</option>
                    <option value="Parent">Parent (Mother / Father)</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Age</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="Age"
                    value={newFamily.age}
                    onChange={(e) => setNewFamily({ ...newFamily, age: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Blood Group</label>
                  <select
                    className="input"
                    value={newFamily.bloodGroup}
                    onChange={(e) => setNewFamily({ ...newFamily, bloodGroup: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Save Family Member</button>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {familyMembers.map((m) => (
              <div key={m.id} style={{ padding: 18, background: 'white', borderRadius: 14, border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>{m.relationship} • {m.age} yrs</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>Blood Group: <strong style={{ color: '#dc2626' }}>{m.bloodGroup}</strong></div>
                </div>
                <button
                  onClick={() => handleRemoveFamily(m.id)}
                  style={{ background: '#fee2e2', border: 'none', color: '#dc2626', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove family member"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BILLING & GST */}
      {activeTab === 'BILLING' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px', color: 'var(--color-text)' }}>Billing & Payment Preferences</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>DEFAULT PAYMENT METHOD</label>
              <select
                className="input"
                value={billing.defaultPayment}
                onChange={(e) => {
                  setBilling({ ...billing, defaultPayment: e.target.value });
                  toast.success('Default payment mode updated');
                }}
                style={{ width: '100%' }}
              >
                <option value="UPI">📱 UPI & Instant QR (PhonePe / GPay)</option>
                <option value="CARD">💳 Credit / Debit Card</option>
                <option value="NETBANKING">🏦 Net Banking</option>
                <option value="PAY_AT_CLINIC">🏥 Pay at Clinic (Cash on Visit)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>GSTIN NUMBER (OPTIONAL)</label>
              <input
                type="text"
                className="input"
                placeholder="22AAAAA0000A1Z5"
                value={billing.gstin}
                onChange={(e) => setBilling({ ...billing, gstin: e.target.value.toUpperCase() })}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2, display: 'block' }}>
                Used on tax invoices for society / company reimbursement claims.
              </span>
            </div>
          </div>

          <div style={{ padding: 18, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Saved Billing Invoices</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              Download consolidated tax statements for all doctor visits and medicine orders.
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/patient/payments')}>
              View Billing & Receipts Ledger →
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: PASSWORD & ACTIVE SESSIONS */}
      {activeTab === 'SECURITY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: 'var(--color-text)' }}>Update Password</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>CURRENT PASSWORD</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>NEW PASSWORD</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Min 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>

          {/* Active Sessions */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: 'var(--color-text)' }}>Active Login Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessions.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: s.current ? '#f0fdf4' : 'var(--color-surface-2)', borderRadius: 10, border: `1px solid ${s.current ? '#bbf7d0' : 'var(--color-border)'}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.device} {s.current && <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 800 }}>(This Device)</span>}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.location} • IP: {s.ip}</div>
                  </div>
                  {!s.current && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setSessions(sessions.filter((x) => x.id !== s.id));
                        toast.success('Session terminated');
                      }}
                      style={{ color: '#dc2626' }}
                    >
                      Log Out
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSessions(sessions.filter((x) => x.current));
                  toast.success('All other sessions logged out');
                }}
              >
                Log Out of All Other Devices
              </button>
              <button className="btn btn-outline" onClick={handleLogout} style={{ borderColor: '#fca5a5', color: '#dc2626' }}>
                Log Out of This Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: NOTIFICATIONS & WHATSAPP */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px' }}>Communication Channels & WhatsApp Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { id: 'emailAppointment', label: 'Doctor Appointment Reminders', desc: 'Email alerts 24 hours and 1 hour before scheduled video/in-person slots' },
              { id: 'emailPrescription', label: 'Digital Prescriptions & Lab Results', desc: 'Direct PDF attachments delivered to your registered inbox' },
              { id: 'whatsappUpdates', label: 'WhatsApp Real-Time Health Alerts', desc: 'Receive instant medicine delivery tracking and doctor updates on WhatsApp' },
              { id: 'refillReminders', label: 'Chronic Medicine Refill Reminders', desc: 'Automated 5-day warning before your regular medications run out' },
              { id: 'smsAlerts', label: 'Critical SMS Notifications', desc: 'Urgent schedule changes, cancellation notices, and emergency alerts' },
            ].map((n) => (
              <label key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{n.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[n.id]}
                  onChange={(e) => {
                    setNotifications({ ...notifications, [n.id]: e.target.checked });
                    toast.success('Channel preference saved!');
                  }}
                  style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: DATA PRIVACY & DANGER ZONE */}
      {activeTab === 'PRIVACY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* ABHA */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Ayushman Bharat Health Account (ABHA ID)</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              MediCare360 is integrated with the National Health Authority (NHA) ABDM ecosystem. Your 14-digit ABHA number links your medical history across all registered hospitals in India.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', marginTop: 16 }}>
              <div style={{ fontSize: 28 }}>🇮🇳</div>
              <div>
                <div style={{ fontWeight: 800, color: '#166534', fontSize: 15 }}>ABHA ID: 91-8821-4902-8812</div>
                <div style={{ fontSize: 12, color: '#15803d' }}>Address: {userProfile.name?.toLowerCase().replace(/\s+/g, '') || 'patient'}@abdm</div>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Your Data Rights & Portability</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Under DPDP 2023 and ABDM standards, you can download a complete offline export of all your electronic health records, prescriptions, and billing receipts at any time.
            </p>
            <button className="btn btn-outline" onClick={exportPersonalHealthData}>
              📥 Download My Complete Health Data (JSON)
            </button>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ padding: 28, borderColor: '#fca5a5', background: '#fffafa' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#dc2626' }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Permanently sign out of all active sessions or delete your patient account.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                className="btn"
                onClick={handleLogout}
                style={{ background: '#dc2626', color: 'white', fontWeight: 700 }}
              >
                🚪 Log Out of MediCare360
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to request account deletion? All records will be archived as per medical statutory compliance.')) {
                    toast.success('Account deletion request submitted for compliance review.');
                  }
                }}
                style={{ borderColor: '#fca5a5', color: '#dc2626' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
