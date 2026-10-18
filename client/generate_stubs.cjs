const fs = require('fs');
const path = require('path');
const files = [
  'src/pages/LandingPage.jsx',
  'src/pages/patient/PatientPrescriptions.jsx',
  'src/pages/patient/PatientDocuments.jsx',
  'src/pages/patient/PatientMessages.jsx',
  'src/pages/patient/PatientProfile.jsx',
  'src/pages/patient/DoctorProfile.jsx',
  'src/pages/doctor/DoctorAppointments.jsx',
  'src/pages/doctor/DoctorAvailability.jsx',
  'src/pages/doctor/DoctorVerification.jsx',
  'src/pages/doctor/NewPrescription.jsx',
  'src/pages/doctor/ConsultationNotes.jsx',
  'src/pages/admin/AdminUsers.jsx',
  'src/pages/admin/AdminDoctors.jsx',
  'src/pages/admin/AdminAuditLogs.jsx'
];

files.forEach(file => {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) {
    const cName = path.basename(file, '.jsx');
    const cnt = `export default function ${cName}() { return <div className="fade-in" style={{padding: 40, textAlign: 'center'}}><div style={{fontSize: 64, marginBottom: 16}}>🚧</div><h2>${cName}</h2><p style={{color: 'var(--color-text-secondary)'}}>This module is under development.</p></div>; }`;
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, cnt);
  }
});
console.log('Stubs generated.');
