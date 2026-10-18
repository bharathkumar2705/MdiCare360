import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  registerDoctor: (data) => api.post('/auth/register/doctor', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password?token=${token}`, { password }),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const doctorService = {
  search: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getAvailability: (id, params) => api.get(`/doctors/${id}/availability`, { params }),
  getReviews: (id, params) => api.get(`/doctors/${id}/reviews`, { params }),
  getSpecializations: () => api.get('/doctors/specializations'),
  getMyProfile: () => api.get('/doctors/me/profile'),
  updateProfile: (data) => api.patch('/doctors/profile', data),
};

export const appointmentService = {
  book: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
  requestReschedule: (id, data) => api.post(`/appointments/${id}/reschedule`, data),
  pay: (id) => api.post(`/appointments/${id}/pay`),
  joinWaitlist: (data) => api.post('/appointments/waitlist', data),
};

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/all/read'),
};

export const healthMetricService = {
  add: (data) => api.post('/health-metrics', data),
  getAll: (params) => api.get('/health-metrics', { params }),
  delete: (id) => api.delete(`/health-metrics/${id}`),
};

export const availabilityService = {
  get: () => api.get('/availability'),
  update: (data) => api.put('/availability', data),
  addLeave: (data) => api.post('/availability/leave', data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  verifyDoctor: (id, data) => api.patch(`/admin/doctors/${id}/verify`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export const patientService = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.put('/patient/profile', data),
  getMedicalRecords: () => api.get('/patient/medical-records'),
  addMedicalRecord: (data) => api.post('/patient/medical-records', data),
  getLabTests: () => api.get('/patient/labs/tests'),
  getLabBookings: () => api.get('/patient/labs/bookings'),
  bookLabTest: (data) => api.post('/patient/labs/book', data),
  getMedicines: () => api.get('/patient/pharmacy/medicines'),
  getPharmacyOrders: () => api.get('/patient/pharmacy/orders'),
  createPharmacyOrder: (data) => api.post('/patient/pharmacy/order', data),
  getPayments: () => api.get('/patient/payments'),
  getInsurance: () => api.get('/patient/insurance'),
  saveInsurance: (data) => api.post('/patient/insurance', data),
  getConsents: () => api.get('/patient/consents'),
  grantConsent: (data) => api.post('/patient/consents', data),
  revokeConsent: (id) => api.patch(`/patient/consents/${id}/revoke`),
};

export const paymentGatewayService = {
  getKey: () => api.get('/payments/key'),
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

