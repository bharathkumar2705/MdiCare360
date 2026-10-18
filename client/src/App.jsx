import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Landing & Legal
import LandingPage from './pages/LandingPage';
import LegalPolicies from './pages/LegalPolicies';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/PatientAppointments';
import AppointmentDetail from './pages/patient/AppointmentDetail';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import HealthTracking from './pages/patient/HealthTracking';
import PatientDocuments from './pages/patient/PatientDocuments';
import TelemedicineRoom from './pages/patient/TelemedicineRoom';
import PatientMessages from './pages/patient/PatientMessages';
import PatientProfile from './pages/patient/PatientProfile';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientLabs from './pages/patient/PatientLabs';
import PatientPharmacy from './pages/patient/PatientPharmacy';
import PatientPayments from './pages/patient/PatientPayments';
import PatientInsurance from './pages/patient/PatientInsurance';
import PatientConsent from './pages/patient/PatientConsent';
import PatientSettings from './pages/patient/PatientSettings';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAppointmentDetail from './pages/doctor/DoctorAppointmentDetail';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorVerification from './pages/doctor/DoctorVerification';
import NewPrescription from './pages/doctor/NewPrescription';
import ConsultationNotes from './pages/doctor/ConsultationNotes';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorConsultations from './pages/doctor/DoctorConsultations';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorReports from './pages/doctor/DoctorReports';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminLabs from './pages/admin/AdminLabs';
import AdminPharmacies from './pages/admin/AdminPharmacies';

// Lab & Pharmacy pages
import LabDashboard from './pages/lab/LabDashboard';
import LabTests from './pages/lab/LabTests';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';

// Placeholder pages for future modules
const ComingSoon = ({ name }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
    <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{name}</h2>
    <p style={{ color: 'var(--color-text-secondary)' }}>This feature is coming soon.</p>
  </div>
);

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 14 },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/privacy" element={<LegalPolicies />} />
          <Route path="/terms" element={<LegalPolicies />} />
          <Route path="/refund-policy" element={<LegalPolicies />} />
          <Route path="/contact" element={<LegalPolicies />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/doctor" element={<RegisterPage isDoctor />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Patient routes */}
          <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/doctors" element={<FindDoctors />} />
              <Route path="/patient/doctors/:id" element={<DoctorProfile />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/appointments/:id" element={<AppointmentDetail />} />
              <Route path="/patient/appointments/book/:doctorId" element={<BookAppointment />} />
              <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/patient/medical-records" element={<PatientMedicalRecords />} />
              <Route path="/patient/documents" element={<PatientDocuments />} />
              <Route path="/patient/labs" element={<PatientLabs />} />
              <Route path="/patient/pharmacy" element={<PatientPharmacy />} />
              <Route path="/patient/payments" element={<PatientPayments />} />
              <Route path="/patient/health" element={<HealthTracking />} />
              <Route path="/patient/messages" element={<PatientMessages />} />
              <Route path="/patient/insurance" element={<PatientInsurance />} />
              <Route path="/patient/consent" element={<PatientConsent />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              <Route path="/patient/settings" element={<PatientSettings />} />
            </Route>
            {/* Video call - full screen, no dashboard layout */}
            <Route path="/patient/telemedicine/:appointmentId" element={<TelemedicineRoom />} />
          </Route>

          {/* Doctor routes */}
          <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/appointments/:id" element={<DoctorAppointmentDetail />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/consultations" element={<DoctorConsultations />} />
              <Route path="/doctor/consultations/:id" element={<ConsultationNotes />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/prescriptions/new" element={<NewPrescription />} />
              <Route path="/doctor/reports" element={<DoctorReports />} />
              <Route path="/doctor/availability" element={<DoctorAvailability />} />
              <Route path="/doctor/messages" element={<DoctorMessages />} />
              <Route path="/doctor/earnings" element={<DoctorEarnings />} />
              <Route path="/doctor/analytics" element={<DoctorAnalytics />} />
              <Route path="/doctor/verification" element={<DoctorVerification />} />
              <Route path="/doctor/settings" element={<DoctorSettings />} />
              <Route path="/doctor/profile" element={<DoctorProfilePage />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/doctors" element={<AdminDoctors />} />
              <Route path="/admin/hospitals" element={<AdminHospitals />} />
              <Route path="/admin/labs" element={<AdminLabs />} />
              <Route path="/admin/pharmacies" element={<AdminPharmacies />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/profile" element={<AdminSettings />} />
              <Route path="/platform/settings" element={<AdminSettings />} />
              <Route path="/platform/profile" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Lab routes */}
          <Route element={<ProtectedRoute allowedRoles={['LAB']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/lab/dashboard" element={<LabDashboard />} />
              <Route path="/lab/bookings" element={<LabDashboard />} />
              <Route path="/lab/tests" element={<LabTests />} />
              <Route path="/lab/reports" element={<LabDashboard />} />
            </Route>
          </Route>

          {/* Pharmacy routes */}
          <Route element={<ProtectedRoute allowedRoles={['PHARMACY']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/orders" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

function VerifyEmail() {
  const [status, setStatus] = useState('loading');
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    import('./services').then(({ authService }) =>
      authService
        .verifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'))
    );
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A1628, #003380)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 48, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        {status === 'loading' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p>Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Email Verified!</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Your account is now active.</p>
            <a href="/login" className="btn btn-primary" style={{ display: 'block' }}>Sign In</a>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 72, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Verification Failed</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>The link is invalid or has expired.</p>
            <a href="/login" className="btn btn-primary" style={{ display: 'block' }}>Back to Login</a>
          </>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  );
}
