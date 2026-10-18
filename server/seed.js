const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Availability = require('./models/Availability');
const Organization = require('./models/Organization');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Review = require('./models/Review');
const LabTest = require('./models/LabTest');
const LabBooking = require('./models/LabBooking');
const LabReport = require('./models/LabReport');
const Medicine = require('./models/Medicine');
const HealthMetric = require('./models/HealthMetric');
const Notification = require('./models/Notification');
const Consultation = require('./models/Consultation');

const hashPwd = (pwd) => bcrypt.hash(pwd, 12);

const DOCTORS_DATA = [
  { name: 'Dr. Priya Sharma', specialization: 'Cardiology', experience: 12, fee: 800, feeOnline: 600, bio: 'Senior cardiologist with 12 years of experience at Apollo Hospital.' },
  { name: 'Dr. Arjun Mehta', specialization: 'Dermatology', experience: 8, fee: 600, feeOnline: 500, bio: 'Specialist in medical and cosmetic dermatology.' },
  { name: 'Dr. Sunita Rao', specialization: 'Pediatrics', experience: 15, fee: 500, feeOnline: 400, bio: 'Child healthcare specialist with a focus on developmental health.' },
  { name: 'Dr. Rajesh Gupta', specialization: 'Orthopedics', experience: 20, fee: 1000, feeOnline: 800, bio: 'Expert in joint replacement and sports injuries.' },
  { name: 'Dr. Neha Kapoor', specialization: 'Neurology', experience: 10, fee: 900, feeOnline: 750, bio: 'Neurologist specializing in epilepsy and movement disorders.' },
  { name: 'Dr. Vikram Singh', specialization: 'General Medicine', experience: 5, fee: 400, feeOnline: 300, bio: 'General physician providing comprehensive primary care.' },
  { name: 'Dr. Ananya Bose', specialization: 'Gynecology', experience: 18, fee: 700, feeOnline: 600, bio: "Women's health specialist with expertise in maternal care." },
  { name: 'Dr. Rohit Jain', specialization: 'Psychiatry', experience: 9, fee: 800, feeOnline: 700, bio: 'Mental health professional focusing on anxiety and mood disorders.' },
  { name: 'Dr. Kavitha Nair', specialization: 'Endocrinology', experience: 11, fee: 850, feeOnline: 700, bio: 'Specialist in diabetes management and thyroid disorders.' },
  { name: 'Dr. Amit Chandra', specialization: 'Ophthalmology', experience: 14, fee: 600, feeOnline: 500, bio: 'Eye care specialist with expertise in cataract and retinal conditions.' },
  { name: 'Dr. Meera Iyer', specialization: 'Pulmonology', experience: 7, fee: 700, feeOnline: 600, bio: 'Lung disease specialist focused on asthma and COPD management.' },
  { name: 'Dr. Sanjay Verma', specialization: 'Gastroenterology', experience: 16, fee: 900, feeOnline: 750, bio: 'GI specialist with expertise in endoscopy and liver diseases.' },
];

const PATIENTS_DATA = [
  { name: 'Rahul Agarwal', email: 'rahul@demo.com', dob: '1990-05-15', bloodGroup: 'A+', gender: 'MALE' },
  { name: 'Priyanka Desai', email: 'priyanka@demo.com', dob: '1988-11-23', bloodGroup: 'B+', gender: 'FEMALE' },
  { name: 'Mohit Kumar', email: 'mohit@demo.com', dob: '1995-03-08', bloodGroup: 'O+', gender: 'MALE' },
  { name: 'Sneha Patel', email: 'sneha@demo.com', dob: '1992-07-19', bloodGroup: 'AB+', gender: 'FEMALE' },
  { name: 'Aryan Malik', email: 'aryan@demo.com', dob: '1998-12-01', bloodGroup: 'O-', gender: 'MALE' },
  { name: 'Divya Menon', email: 'divya@demo.com', dob: '1985-09-14', bloodGroup: 'A-', gender: 'FEMALE' },
  { name: 'Kiran Reddy', email: 'kiran@demo.com', dob: '1993-04-27', bloodGroup: 'B-', gender: 'MALE' },
  { name: 'Pooja Sharma', email: 'pooja@demo.com', dob: '1991-06-30', bloodGroup: 'AB-', gender: 'FEMALE' },
  { name: 'Suresh Nambiar', email: 'suresh@demo.com', dob: '1980-02-12', bloodGroup: 'O+', gender: 'MALE' },
  { name: 'Ritu Goel', email: 'ritu@demo.com', dob: '1996-08-22', bloodGroup: 'A+', gender: 'FEMALE' },
];

const seedDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  console.log('Clearing existing seed data...');
  await Promise.all([
    User.deleteMany({ email: { $regex: /@demo\.com$/ } }),
    User.deleteMany({ email: { $regex: /@medicare360\.com$/ } }),
  ]);
  await Promise.all([
    Patient.deleteMany({}), Doctor.deleteMany({}), Availability.deleteMany({}),
    Organization.deleteMany({}), Appointment.deleteMany({}), Prescription.deleteMany({}),
    Review.deleteMany({}), LabTest.deleteMany({}), LabBooking.deleteMany({}),
    LabReport.deleteMany({}), Medicine.deleteMany({}), HealthMetric.deleteMany({}),
    Notification.deleteMany({}), Consultation.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ─── Admin ─────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Platform Admin', email: 'admin@medicare360.com',
    password: await hashPwd('Admin@12345'), role: 'PLATFORM_ADMIN', isEmailVerified: true,
  });
  console.log(`Admin created: admin@medicare360.com / Admin@12345`);

  // ─── Organizations ─────────────────────────────────────────
  const [hospitalA, hospitalB, hospitalC, labA, labB, pharmacyA] = await Organization.insertMany([
    { name: 'Apollo Wellness Hospital', type: 'HOSPITAL', description: 'Multi-specialty hospital', address: { street: '12 Apollo Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }, contact: { phone: '022-12345678', email: 'info@apollowellness.demo' }, isVerified: true },
    { name: 'Fortis Care Center', type: 'HOSPITAL', description: 'Premium healthcare center', address: { street: '45 Ring Road', city: 'Delhi', state: 'Delhi', pincode: '110001' }, contact: { phone: '011-98765432', email: 'info@fortiscare.demo' }, isVerified: true },
    { name: 'Manipal City Clinic', type: 'CLINIC', description: 'Urban multi-specialty clinic', address: { street: '8 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }, contact: { phone: '080-44556677', email: 'info@manipalclinic.demo' }, isVerified: true },
    { name: 'PathCare Diagnostics', type: 'LAB', description: 'NABL-accredited diagnostic laboratory', address: { street: '22 Lab Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400002' }, contact: { phone: '022-55667788', email: 'info@pathcare.demo' }, isVerified: true },
    { name: 'HealthMart Labs', type: 'LAB', description: 'Affordable diagnostic services', address: { street: '15 Health Lane', city: 'Delhi', state: 'Delhi', pincode: '110002' }, contact: { phone: '011-66778899', email: 'info@healthmart.demo' }, isVerified: true },
    { name: 'MedPlus Pharmacy', type: 'PHARMACY', description: '24/7 pharmacy with home delivery', address: { street: '5 Pharma Circle', city: 'Mumbai', state: 'Maharashtra', pincode: '400003' }, contact: { phone: '022-33445566', email: 'info@medplus.demo' }, isVerified: true },
  ]);
  console.log('Organizations created');

  // ─── Lab Tests ─────────────────────────────────────────────
  const labTests = await LabTest.insertMany([
    { labId: labA._id, name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'BLOOD', price: 350, homeCollectionAvailable: true, homeCollectionCharge: 100, turnaroundTime: '24 hours', sampleType: 'Blood', preparationInstructions: 'No special preparation required.', isActive: true },
    { labId: labA._id, name: 'Lipid Profile', code: 'LIPID', category: 'BLOOD', price: 600, homeCollectionAvailable: true, homeCollectionCharge: 100, turnaroundTime: '24 hours', sampleType: 'Blood', preparationInstructions: 'Fast for 10-12 hours before the test.', isActive: true },
    { labId: labA._id, name: 'Thyroid Profile (T3, T4, TSH)', code: 'THYROID', category: 'BLOOD', price: 800, homeCollectionAvailable: true, homeCollectionCharge: 100, turnaroundTime: '24-48 hours', sampleType: 'Blood', preparationInstructions: 'Morning sample preferred. No special fasting required.', isActive: true },
    { labId: labA._id, name: 'Blood Glucose Fasting', code: 'FBS', category: 'BLOOD', price: 200, homeCollectionAvailable: true, homeCollectionCharge: 100, turnaroundTime: '4 hours', sampleType: 'Blood', preparationInstructions: 'Fast for 8 hours.', isActive: true },
    { labId: labA._id, name: 'HbA1c', code: 'HBA1C', category: 'BLOOD', price: 500, homeCollectionAvailable: true, homeCollectionCharge: 100, turnaroundTime: '24 hours', sampleType: 'Blood', preparationInstructions: 'No fasting required.', isActive: true },
    { labId: labB._id, name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'BLOOD', price: 300, homeCollectionAvailable: false, turnaroundTime: '24 hours', sampleType: 'Blood', isActive: true },
    { labId: labB._id, name: 'Urine Routine Examination', code: 'URE', category: 'URINE', price: 150, homeCollectionAvailable: false, turnaroundTime: '12 hours', sampleType: 'Urine', preparationInstructions: 'Collect mid-stream urine sample.', isActive: true },
    { labId: labB._id, name: 'Kidney Function Test (KFT)', code: 'KFT', category: 'BLOOD', price: 700, homeCollectionAvailable: true, homeCollectionCharge: 80, turnaroundTime: '24 hours', sampleType: 'Blood', isActive: true },
  ]);
  console.log('Lab tests created');

  // ─── Medicines ─────────────────────────────────────────────
  await Medicine.insertMany([
    { name: 'Paracetamol 500mg', genericName: 'Paracetamol', manufacturer: 'Sun Pharma', category: 'TABLET', strength: '500mg', price: 25, stockQuantity: 500, requiresPrescription: false, pharmacyId: pharmacyA._id, isActive: true },
    { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', manufacturer: 'Cipla', category: 'CAPSULE', strength: '500mg', price: 120, stockQuantity: 200, requiresPrescription: true, pharmacyId: pharmacyA._id, isActive: true },
    { name: 'Metformin 500mg', genericName: 'Metformin HCl', manufacturer: 'Dr. Reddy\'s', category: 'TABLET', strength: '500mg', price: 80, stockQuantity: 300, requiresPrescription: true, pharmacyId: pharmacyA._id, isActive: true },
    { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', manufacturer: 'Pfizer', category: 'TABLET', strength: '10mg', price: 180, stockQuantity: 150, requiresPrescription: true, pharmacyId: pharmacyA._id, isActive: true },
    { name: 'Losartan 50mg', genericName: 'Losartan Potassium', manufacturer: 'Lupin', category: 'TABLET', strength: '50mg', price: 95, stockQuantity: 200, requiresPrescription: true, pharmacyId: pharmacyA._id, isActive: true },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', manufacturer: 'Glenmark', category: 'TABLET', strength: '10mg', price: 35, stockQuantity: 400, requiresPrescription: false, pharmacyId: pharmacyA._id, isActive: true },
  ]);
  console.log('Medicines created');

  // ─── Patients ──────────────────────────────────────────────
  const patientUsers = [];
  for (const p of PATIENTS_DATA) {
    const u = await User.create({ name: p.name, email: p.email, password: await hashPwd('Patient@123'), role: 'PATIENT', isEmailVerified: true });
    await Patient.create({ userId: u._id, dateOfBirth: new Date(p.dob), bloodGroup: p.bloodGroup, gender: p.gender, address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' } });
    patientUsers.push(u);
  }
  console.log(`${patientUsers.length} patients created`);

  // ─── Doctors ───────────────────────────────────────────────
  const doctorDocs = [];
  const specialtyHospital = [hospitalA._id, hospitalB._id, hospitalC._id, hospitalA._id, hospitalB._id, hospitalC._id, hospitalA._id, hospitalB._id, hospitalA._id, hospitalC._id, hospitalB._id, hospitalA._id];

  for (let i = 0; i < DOCTORS_DATA.length; i++) {
    const d = DOCTORS_DATA[i];
    const email = `${d.name.toLowerCase().replace(/\s+/g, '.').replace('dr.', 'dr')}@demo.com`;
    const u = await User.create({ name: d.name, email, password: await hashPwd('Doctor@123'), role: 'DOCTOR', isEmailVerified: true });

    const doctor = await Doctor.create({
      userId: u._id,
      specialization: d.specialization,
      experience: d.experience,
      bio: d.bio,
      qualifications: [{ degree: 'MBBS', institution: 'AIIMS Delhi', year: 2005 }, { degree: 'MD', institution: 'PGI Chandigarh', year: 2010 }],
      languages: ['English', 'Hindi'],
      consultationFeeInPerson: d.fee,
      consultationFeeOnline: d.feeOnline,
      isOnlineConsultationAvailable: true,
      isInPersonAvailable: true,
      hospitalAffiliations: [specialtyHospital[i]],
      rating: (4.0 + Math.random() * 1.0).toFixed(1),
      reviewCount: Math.floor(Math.random() * 200) + 20,
      totalPatients: Math.floor(Math.random() * 1000) + 100,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      profileComplete: true,
    });

    await Availability.create({
      doctorId: doctor._id,
      consultationDuration: 30,
      bufferTime: 5,
      workingHours: {
        MON: { enabled: true, start: '09:00', end: '13:00' },
        TUE: { enabled: true, start: '09:00', end: '13:00' },
        WED: { enabled: false },
        THU: { enabled: true, start: '14:00', end: '18:00' },
        FRI: { enabled: true, start: '14:00', end: '18:00' },
        SAT: { enabled: true, start: '10:00', end: '13:00' },
        SUN: { enabled: false },
      },
      onlineHours: {
        MON: { enabled: true, start: '18:00', end: '21:00' },
        TUE: { enabled: true, start: '18:00', end: '21:00' },
        WED: { enabled: true, start: '10:00', end: '14:00' },
        THU: { enabled: false },
        FRI: { enabled: false },
        SAT: { enabled: false },
        SUN: { enabled: true, start: '10:00', end: '14:00' },
      },
    });

    doctorDocs.push({ user: u, doctor });
  }
  console.log(`${doctorDocs.length} doctors created`);

  // ─── Appointments ──────────────────────────────────────────
  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'CONFIRMED', 'PENDING', 'CANCELLED'];
  const appointmentDocs = [];
  for (let i = 0; i < 20; i++) {
    const patient = patientUsers[i % patientUsers.length];
    const docPair = doctorDocs[i % doctorDocs.length];
    const daysAgo = i < 12 ? -(i + 1) : (i - 11);
    const apptDate = new Date();
    apptDate.setDate(apptDate.getDate() + daysAgo);
    apptDate.setHours(0, 0, 0, 0);

    try {
      const appt = await Appointment.create({
        patientId: patient._id,
        doctorId: docPair.doctor._id,
        doctorUserId: docPair.user._id,
        consultationType: i % 2 === 0 ? 'IN_PERSON' : 'ONLINE',
        date: apptDate,
        slotTime: `${9 + (i % 4)}:00`,
        slotEnd: `${9 + (i % 4)}:30`,
        status: statuses[i % statuses.length],
        symptoms: 'General check-up and routine health assessment.',
        paymentStatus: 'PAID',
        videoRoomId: i % 2 === 1 ? `room-${i}-${Date.now()}` : undefined,
      });
      appointmentDocs.push({ appt, patient, docPair });
    } catch {}
  }
  console.log(`${appointmentDocs.length} appointments created`);

  // ─── Consultations + Prescriptions + Reviews ────────────────
  let prescriptionCount = 0;
  let reviewCount = 0;
  for (const { appt, patient, docPair } of appointmentDocs) {
    if (appt.status === 'COMPLETED') {
      const consultation = await Consultation.create({
        appointmentId: appt._id, patientId: patient._id, doctorId: docPair.doctor._id,
        chiefConcern: 'Patient presented for routine check-up.',
        observations: 'Vitals within normal range. No acute distress.',
        assessment: 'Generally healthy. Mild hypertension noted.',
        plan: 'Lifestyle modification advised. Follow-up in 3 months.',
        status: 'COMPLETED',
        startTime: new Date(appt.date.getTime() + 9 * 3600000),
        endTime: new Date(appt.date.getTime() + 9.5 * 3600000),
        duration: 30,
      });

      appt.consultationId = consultation._id;
      await appt.save();

      if (prescriptionCount < 8) {
        await Prescription.create({
          patientId: patient._id, doctorId: docPair.doctor._id,
          consultationId: consultation._id, appointmentId: appt._id,
          diagnosis: 'Hypertension, Vitamin D deficiency',
          medicines: [
            { name: 'Losartan 50mg', dosage: '50mg', frequency: 'Once daily', duration: '30 days', route: 'ORAL', instructions: 'Take with or without food' },
            { name: 'Vitamin D3 60K IU', dosage: '60K IU', frequency: 'Once weekly', duration: '12 weeks', route: 'ORAL', instructions: 'Take after meals' },
          ],
          notes: 'Monitor BP weekly. Return if readings consistently > 140/90.',
          followUpDate: new Date(Date.now() + 90 * 24 * 3600000),
        });
        prescriptionCount++;
      }

      if (reviewCount < 10) {
        await Review.create({
          patientId: patient._id, doctorId: docPair.doctor._id, appointmentId: appt._id,
          rating: 4 + Math.round(Math.random()),
          comment: ['Excellent doctor, very thorough and caring.', 'Great experience. Explained everything clearly.', 'Very professional and knowledgeable.', 'Highly recommend!', 'Spent enough time to understand my concerns.'][reviewCount % 5],
          isVisible: true,
        });
        reviewCount++;
      }
    }
  }
  console.log(`${prescriptionCount} prescriptions, ${reviewCount} reviews created`);

  // ─── Health Metrics ────────────────────────────────────────
  const metricTypes = ['BLOOD_PRESSURE', 'WEIGHT', 'HEART_RATE', 'BLOOD_GLUCOSE', 'SPO2'];
  const metricPatient = patientUsers[0];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await HealthMetric.create({
      patientId: metricPatient._id,
      type: metricTypes[i % metricTypes.length],
      value: metricTypes[i % metricTypes.length] === 'BLOOD_PRESSURE' ? { systolic: 120 + Math.floor(Math.random() * 20), diastolic: 80 + Math.floor(Math.random() * 10) } : Math.floor(Math.random() * 30) + 70,
      unit: metricTypes[i % metricTypes.length] === 'WEIGHT' ? 'kg' : metricTypes[i % metricTypes.length] === 'BLOOD_PRESSURE' ? 'mmHg' : 'bpm',
      recordedAt: date,
    });
  }
  console.log('Health metrics created');

  // ─── Notifications ─────────────────────────────────────────
  await Notification.insertMany(patientUsers.slice(0, 3).map((u) => ({
    userId: u._id, type: 'APPOINTMENT_CONFIRMED', title: 'Appointment Confirmed', isRead: false,
    message: 'Your appointment has been confirmed. Check your upcoming appointments.',
    link: '/patient/appointments',
  })));
  console.log('Sample notifications created');

  console.log('\n✅ Seed complete!');
  console.log('\n── Demo Credentials ──────────────────────────────');
  console.log('Admin: admin@medicare360.com / Admin@12345');
  console.log('Patient: rahul@demo.com / Patient@123');
  console.log(`Doctor: ${DOCTORS_DATA[0].name.toLowerCase().replace(/\s+/g, '.').replace('dr.', 'dr')}@demo.com / Doctor@123`);
  console.log('─────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
