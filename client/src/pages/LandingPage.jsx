import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'var(--font-family)' }}>
      {/* Navbar */}
      <nav className="landing-navbar" style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
            🏥 MediCare360
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to={`/${user.role.split('_')[0].toLowerCase()}/dashboard`} className="btn btn-primary">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: 14, fontWeight: 700, color: '#334155', textDecoration: 'none', padding: '8px 12px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-outline" style={{ fontSize: 13, padding: '8px 14px', borderRadius: 8 }}>
                🧑‍🦱 Patient Sign Up
              </Link>
              <Link to="/register/doctor" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 14px', borderRadius: 8 }}>
                👨‍⚕️ Doctor Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{ padding: '60px 24px 80px' }}>
        <div className="hero-content">
          <div>
            <div className="hero-tag">🌟 Comprehensive Society Healthcare</div>
            <h1 className="hero-title">
              Your Health, <br />
              <span className="gradient-text">Connected</span> & <br />
              Simplified.
            </h1>
            <p className="hero-sub">
              MediCare360 brings society members, verified doctors, diagnostic labs, and pharmacies into one unified ecosystem.
            </p>

            {/* Quick Role Selection Cards */}
            <div style={{ marginTop: 32, marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Get Started — Choose Your Role:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {/* Patient Card */}
                <Link
                  to="/register"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '20px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    color: '#0f172a',
                    border: '2px solid transparent',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#0052cc'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🧑‍🦱</div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: '#0052cc' }}>I am a Patient / Member</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                      Book appointments, access health records, order medicines & diagnostic tests.
                    </div>
                  </div>
                  <div style={{ marginTop: 14, fontWeight: 700, fontSize: 13, color: '#0052cc' }}>
                    Create Patient Account →
                  </div>
                </Link>

                {/* Doctor Card */}
                <Link
                  to="/register/doctor"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    padding: '20px',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    color: 'white',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                >
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍⚕️</div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: '#93c5fd' }}>I am a Doctor / Specialist</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6, lineHeight: 1.5 }}>
                      Join verified doctor panel, manage patient slots, consult via video, and issue e-prescriptions.
                    </div>
                  </div>
                  <div style={{ marginTop: 14, fontWeight: 700, fontSize: 13, color: '#93c5fd' }}>
                    Register as Doctor →
                  </div>
                </Link>
              </div>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">50k+</div>
                <div className="hero-stat-label">Happy Patients</div>
              </div>
              <div>
                <div className="hero-stat-value">12+</div>
                <div className="hero-stat-label">Verified Doctors</div>
              </div>
              <div>
                <div className="hero-stat-value">24/7</div>
                <div className="hero-stat-label">Emergency Care</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div style={{
              width: 480, height: 480, background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', position: 'relative'
            }}>
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: 72, marginBottom: 16 }}>🏥</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>MediCare360</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Complete Digital Healthcare</div>
                <div style={{ display: 'inline-flex', gap: 8, marginTop: 16, background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 20, fontSize: 12 }}>
                  <span>🔒 ABDM Compliant</span> • <span>256-bit Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title">Everything You Need for Total Health</h2>
          <p className="section-subtitle">A unified platform connecting all aspects of your healthcare journey for a seamless experience.</p>
        </div>
        <div className="grid-3">
          {[
            { icon: '🩺', title: 'Find Expert Doctors', desc: 'Book in-person or online consultations with verified specialists near you.' },
            { icon: '📹', title: 'Telemedicine', desc: 'Consult doctors from the comfort of your home via secure, high-quality video calls.' },
            { icon: '💊', title: 'E-Prescriptions & Pharmacy', desc: 'Get digital prescriptions instantly and order medicines from partner pharmacies.' },
            { icon: '🧪', title: 'Lab Diagnostics', desc: 'Book tests with home collection and receive digital reports directly in your account.' },
            { icon: '📊', title: 'Health Tracking', desc: 'Monitor vitals and health metrics over time with interactive charts and insights.' },
            { icon: '🤖', title: 'AI Health Assistant', desc: 'Analyze reports and get intelligent insights powered by advanced AI.' },
          ].map((s) => (
            <div key={s.title} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #0A1628 0%, #0052cc 100%)', color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Ready to get started?</h2>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          Create an account in less than 2 minutes. Choose your profile below:
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link
            to="/register"
            className="btn btn-xl"
            style={{ background: 'white', color: '#0052cc', fontWeight: 800, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '16px 28px', borderRadius: 12 }}
          >
            🧑‍🦱 Create Patient Account
          </Link>
          <Link
            to="/register/doctor"
            className="btn btn-xl"
            style={{ background: '#0284c7', color: 'white', fontWeight: 800, border: '2px solid white', padding: '16px 28px', borderRadius: 12 }}
          >
            👨‍⚕️ Register as Doctor
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0A1628', color: 'rgba(255,255,255,0.7)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 12 }}>MediCare360</div>
        <p style={{ fontSize: 14, marginBottom: 24 }}>© 2026 MediCare360. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 14, flexWrap: 'wrap' }}>
          <Link to="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: 'inherit' }}>Terms of Service</Link>
          <Link to="/refund-policy" style={{ color: 'inherit' }}>Refund Policy</Link>
          <Link to="/contact" style={{ color: 'inherit' }}>Contact & Support</Link>
        </div>
      </footer>
    </div>
  );
}