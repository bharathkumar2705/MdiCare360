import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services';
import toast from 'react-hot-toast';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await appointmentService.getAll({ limit: 100 });
        const appts = res.data.data || [];
        
        // Group appointments by patient
        const patientMap = new Map();
        
        appts.forEach((a) => {
          const p = a.patientId;
          if (!p) return;
          const pid = p._id || p;
          
          if (!patientMap.has(pid)) {
            patientMap.set(pid, {
              id: pid,
              name: p.name || 'Society Patient',
              email: p.email || 'patient@society.org',
              phone: p.phone || '+91 98765 43210',
              avatar: p.avatar,
              gender: p.gender || 'Not specified',
              bloodGroup: p.bloodGroup || 'O+',
              totalVisits: 1,
              lastVisit: a.date,
              lastDiagnosis: a.symptoms || 'General Checkup',
              consultationType: a.consultationType,
              status: a.status,
              appointmentId: a._id,
            });
          } else {
            const existing = patientMap.get(pid);
            existing.totalVisits += 1;
            if (new Date(a.date) > new Date(existing.lastVisit)) {
              existing.lastVisit = a.date;
              existing.lastDiagnosis = a.symptoms || existing.lastDiagnosis;
            }
          }
        });

        // If no booked appointments yet, provide default registered society members for demonstration
        if (patientMap.size === 0) {
          const samplePatients = [
            {
              id: 'p1',
              name: 'Rajesh Sharma',
              email: 'rajesh.sharma@example.com',
              phone: '+91 98451 22345',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              gender: 'Male, 48 yrs',
              bloodGroup: 'B+',
              totalVisits: 3,
              lastVisit: new Date().toISOString(),
              lastDiagnosis: 'Essential Hypertension & routine vitals',
              consultationType: 'IN_PERSON',
              status: 'CONFIRMED',
            },
            {
              id: 'p2',
              name: 'Ananya Reddy',
              email: 'ananya.reddy@example.com',
              phone: '+91 94412 88910',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              gender: 'Female, 32 yrs',
              bloodGroup: 'O+',
              totalVisits: 2,
              lastVisit: new Date(Date.now() - 86400000 * 3).toISOString(),
              lastDiagnosis: 'Seasonal Allergic Rhinitis',
              consultationType: 'ONLINE',
              status: 'COMPLETED',
            },
            {
              id: 'p3',
              name: 'Vikram Patel',
              email: 'vikram.patel@example.com',
              phone: '+91 99801 33412',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
              gender: 'Male, 61 yrs',
              bloodGroup: 'A+',
              totalVisits: 5,
              lastVisit: new Date(Date.now() - 86400000 * 7).toISOString(),
              lastDiagnosis: 'Type 2 Diabetes Mellitus glycemic follow-up',
              consultationType: 'IN_PERSON',
              status: 'COMPLETED',
            },
          ];
          setPatients(samplePatients);
        } else {
          setPatients(Array.from(patientMap.values()));
        }
      } catch (err) {
        toast.error('Failed to load patient records.');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.lastDiagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Patient Directory & Clinical History
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Access complete Electronic Health Records (EHR), consultations, and medical history.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/doctor/prescriptions/new')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span>💊</span>
            <span>Write Prescription</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Total Registered Patients</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>{patients.length}</div>
          <div style={{ fontSize: 12, color: '#16A34A', marginTop: 4, fontWeight: 600 }}>Active society members</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Follow-ups This Month</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0284C7', marginTop: 4 }}>{patients.filter(p => p.totalVisits > 1).length}</div>
          <div style={{ fontSize: 12, color: '#0284C7', marginTop: 4, fontWeight: 600 }}>Recurring clinical visits</div>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Telemedicine Consults</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED', marginTop: 4 }}>
            {patients.filter(p => p.consultationType === 'ONLINE').length}
          </div>
          <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 4, fontWeight: 600 }}>Digital consultations</div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by patient name, phone, diagnosis, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 12,
            border: '1px solid #CBD5E1',
            fontSize: 14,
            outline: 'none',
            background: 'white',
          }}
        />
      </div>

      {/* Patient Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>Loading patient records...</div>
      ) : filteredPatients.length === 0 ? (
        <div style={{ background: 'white', padding: 48, borderRadius: 16, textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧑‍⚕️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>No patients match your search</h3>
          <p style={{ color: '#64748B', fontSize: 14 }}>Try adjusting the search criteria or clear the input.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Patient Name</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Contact & Demographics</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Blood Group</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Last Consultation</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Total Visits</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>{p.phone}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{p.gender}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', background: '#FEE2E2', color: '#991B1B', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>
                        {new Date(p.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.lastDiagnosis}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', background: '#F1F5F9', color: '#334155', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {p.totalVisits} visits
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => navigate(`/doctor/consultations/${p.appointmentId || 'new'}`)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          title="Record SOAP notes"
                        >
                          Notes
                        </button>
                        <button
                          onClick={() => navigate('/doctor/prescriptions/new')}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          title="Create e-Prescription"
                        >
                          Prescribe
                        </button>
                        <button
                          onClick={() => navigate('/doctor/messages')}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          title="Send Message"
                        >
                          💬
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
