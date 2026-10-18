// Stub pages — will be fully implemented
const stub = (name) => () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center' }}>
    <div style={{ fontSize: 56, marginBottom: 12 }}>🚧</div>
    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{name}</h2>
    <p style={{ color: 'var(--color-text-secondary)' }}>This section is under active development.</p>
  </div>
);

export const PatientPrescriptions = stub('Prescriptions');
export const PatientDocuments = stub('Medical Documents');
export const PatientMessages = stub('Messages');
export const PatientProfile = stub('Profile Settings');
export const DoctorProfile = stub('Doctor Profile');
export const DoctorVerification = stub('Doctor Verification');
export const NewPrescription = stub('New Prescription');
export const ConsultationNotes = stub('Consultation Notes');
export const AdminAuditLogs = stub('Audit Logs');
export const ForgotPasswordPage = stub('Forgot Password');
