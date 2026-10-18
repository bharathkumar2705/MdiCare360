import { Link, useLocation } from 'react-router-dom';

export default function LegalPolicies() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      {/* Header */}
      <nav style={{ background: '#0a1628', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 20 }}>
          🏥 MediCare360
        </Link>
        <Link to="/" style={{ color: '#93c5fd', textDecoration: 'none', fontSize: 14 }}>
          ← Back to Home
        </Link>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 20px', paddingBottom: 60 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, flexWrap: 'wrap' }}>
          <Link
            to="/privacy"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              background: currentPath === '/privacy' ? '#0052cc' : '#ffffff',
              color: currentPath === '/privacy' ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
            }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              background: currentPath === '/terms' ? '#0052cc' : '#ffffff',
              color: currentPath === '/terms' ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
            }}
          >
            Terms of Service
          </Link>
          <Link
            to="/refund-policy"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              background: currentPath === '/refund-policy' ? '#0052cc' : '#ffffff',
              color: currentPath === '/refund-policy' ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
            }}
          >
            Refund & Cancellation
          </Link>
          <Link
            to="/contact"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
              background: currentPath === '/contact' ? '#0052cc' : '#ffffff',
              color: currentPath === '/contact' ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
            }}
          >
            Contact & Support
          </Link>
        </div>

        {/* Content Box */}
        <div style={{ background: 'white', padding: '36px 40px', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', lineHeight: 1.7 }}>
          
          {/* Privacy Policy */}
          {currentPath === '/privacy' && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Privacy Policy</h1>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Last Updated: October 2026</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>1. Information We Collect</h3>
              <p>
                MediCare360 collects personal details necessary to facilitate healthcare consultations, appointments, diagnostic bookings, and medical record management. This includes names, email addresses, phone numbers, appointment logs, and encrypted payment transaction identifiers.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>2. Medical Data & Health Privacy</h3>
              <p>
                Your electronic health records (EHR), prescriptions, and diagnostic lab reports are strictly confidential. We adhere to the Ayushman Bharat Digital Mission (ABDM) standards for patient data privacy. Your records are never sold, rented, or shared with third-party advertisers.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>3. Payment Security</h3>
              <p>
                All digital transactions are processed securely through certified PCI-DSS compliant payment gateways (such as Razorpay). We never store raw debit/credit card numbers or CVVs on our servers.
              </p>
            </div>
          )}

          {/* Terms of Service */}
          {currentPath === '/terms' && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Terms & Conditions</h1>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Last Updated: October 2026</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>1. Service Overview</h3>
              <p>
                MediCare360 is a unified healthcare platform that connects society members with qualified medical professionals, registered diagnostic pathology laboratories, and licensed pharmacies.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>2. Consultations & Telemedicine</h3>
              <p>
                Consultations provided through the platform represent professional medical advice. Patients are responsible for providing accurate medical history, allergies, and symptom descriptions. In cases of acute life-threatening medical emergencies, please visit the nearest hospital emergency room immediately.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>3. User Conduct</h3>
              <p>
                Users agree to use the platform in good faith, respect appointment times, and maintain accurate personal and contact details.
              </p>
            </div>
          )}

          {/* Refund & Cancellation Policy */}
          {currentPath === '/refund-policy' && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Cancellation & Refund Policy</h1>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Last Updated: October 2026</p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>1. Appointment Cancellation by Patient</h3>
              <p>
                Patients may cancel or reschedule their consultation up to <strong>2 hours</strong> before the scheduled slot time for a <strong>100% full refund</strong>. Cancellations made within 2 hours of the appointment time are subject to a nominal doctor slot reservation fee.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>2. Cancellation by Doctor or Clinic</h3>
              <p>
                If a consultation is cancelled or rescheduled by the doctor due to an emergency, the patient will receive an automatic 100% refund or the option to reschedule at no additional cost.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>3. Diagnostic Labs & Pharmacy Orders</h3>
              <p>
                Diagnostic lab appointments can be cancelled anytime before sample collection for a full refund. Pharmacy orders may be cancelled prior to dispatch.
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 24 }}>4. Refund Processing Timeline</h3>
              <p>
                Approved refunds are credited back to the original source of payment (UPI / Bank Account / Card) within <strong>5 to 7 business days</strong> as per banking and RBI standard turnaround guidelines.
              </p>
            </div>
          )}

          {/* Contact & Support */}
          {currentPath === '/contact' && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Contact & Customer Support</h1>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>We are here to assist you 24/7</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
                <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📧</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Official Support Email</div>
                  <div style={{ color: '#0052cc', fontSize: 14, marginTop: 4 }}>
                    <a href="mailto:bharathkumarreddynaru@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                      bharathkumarreddynaru@gmail.com
                    </a>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Response within 2-4 hours</div>
                </div>

                <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🏥</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Platform Name</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 4 }}>MediCare360 Healthcare</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Registered Society Health Portal</div>
                </div>

                <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🕒</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Operating Hours</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 4 }}>Monday - Sunday (24/7)</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Online Appointments & Digital EHR</div>
                </div>
              </div>

              <div style={{ marginTop: 32, padding: 20, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>Grievance & Compliance Officer</div>
                <div style={{ fontSize: 13, color: '#1e3a8a' }}>
                  Bharath Kumar Reddy Naru • Contact: bharathkumarreddynaru@gmail.com
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
