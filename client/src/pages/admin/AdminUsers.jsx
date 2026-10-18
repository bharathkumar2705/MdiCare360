import { useState, useEffect } from 'react';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
    phone: '',
    specialization: 'General Medicine',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ role: roleFilter, search, page, limit: 15 });
      setUsers(res.data.users || res.data.data || []);
      setTotal(res.data.total || (res.data.pagination?.total) || 0);
    } catch (err) {
      toast.error('Failed to load users directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await adminService.toggleUser(id);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      toast.error('Failed to update user account status.');
    }
  };

  const handleDeleteUser = async (id, name, email) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${name}" (${email})? This action cannot be undone.`)) {
      try {
        await adminService.deleteUser(id);
        toast.success(`User "${name}" has been permanently deleted.`);
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Name, email, and password are required.');
      return;
    }
    try {
      await adminService.createUser(newUser);
      toast.success(`User "${newUser.name}" successfully created with role ${newUser.role}!`);
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'PATIENT',
        phone: '',
        specialization: 'General Medicine',
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
      toast.success(`User "${editingUser.name}" updated successfully!`);
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? editingUser : u))
      );
      setEditingUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const ROLE_COLORS = {
    PATIENT: { bg: '#E0F2FE', color: '#0369A1' },
    DOCTOR: { bg: '#DCFCE7', color: '#15803D' },
    PLATFORM_ADMIN: { bg: '#F3E8FF', color: '#7E22CE' },
    HOSPITAL_ADMIN: { bg: '#FEF3C7', color: '#B45309' },
    PHARMACY: { bg: '#FFE4E6', color: '#BE123C' },
    LAB: { bg: '#E0E7FF', color: '#4338CA' },
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0F172A)', margin: 0 }}>
            Master User Management & Controls
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #64748B)', fontSize: 14, marginTop: 4 }}>
            Full administrative control: Add new accounts, modify permissions, reset status, or delete users.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>➕</span>
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: 'white', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: 260, display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
            Search
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="form-input"
          style={{ width: 180, padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1' }}
        >
          <option value="">All Roles</option>
          <option value="PATIENT">Patients</option>
          <option value="DOCTOR">Doctors</option>
          <option value="PLATFORM_ADMIN">Admins</option>
          <option value="PHARMACY">Pharmacies</option>
          <option value="LAB">Laboratories</option>
        </select>
      </div>

      {/* User Directory Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Loading user directory...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>No users found</h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>Try adjusting your search criteria or add a new user.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: 600 }}>User / Email</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: 600 }}>Platform Role</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: 600 }}>Email Status</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: 600 }}>Account Status</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleStyle = ROLE_COLORS[u.role] || { bg: '#F1F5F9', color: '#475569' };
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: '#E2E8F0',
                              color: '#475569',
                              fontWeight: 700,
                              fontSize: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {u.name?.[0] || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.name}</div>
                            <div style={{ fontSize: 13, color: '#64748B' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#0F172A', fontWeight: 600 }}>
                        {u.phone || '—'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {u.isEmailVerified ? (
                          <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            ✅ Verified
                          </span>
                        ) : (
                          <span style={{ color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            background: u.isActive !== false ? '#DCFCE7' : '#FEE2E2',
                            color: u.isActive !== false ? '#166534' : '#991B1B',
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: 12 }}
                            title="Edit User Details"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive !== false)}
                            className="btn btn-outline"
                            style={{
                              padding: '6px 10px',
                              fontSize: 12,
                              color: u.isActive !== false ? '#D97706' : '#16A34A',
                              borderColor: u.isActive !== false ? '#FDE68A' : '#86EFAC',
                            }}
                            title={u.isActive !== false ? 'Suspend User' : 'Activate User'}
                          >
                            {u.isActive !== false ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name, u.email)}
                            className="btn btn-outline"
                            style={{
                              padding: '6px 10px',
                              fontSize: 12,
                              color: '#DC2626',
                              borderColor: '#FCA5A5',
                            }}
                            title="Delete User Permanently"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Create New Platform User</h2>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>Directly provision patient, doctor, staff, or admin accounts.</p>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Platform Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  >
                    <option value="PATIENT">PATIENT</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                    <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
                    <option value="LAB">LAB</option>
                    <option value="PHARMACY">PHARMACY</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              {newUser.role === 'DOCTOR' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Medical Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, Pediatrics"
                    value={newUser.specialization}
                    onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Edit User Information</h2>
            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Contact Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                  >
                    <option value="PATIENT">PATIENT</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                    <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
                    <option value="LAB">LAB</option>
                    <option value="PHARMACY">PHARMACY</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Account Status</label>
                <select
                  value={editingUser.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'ACTIVE' })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}
                >
                  <option value="ACTIVE">Active (Normal Access)</option>
                  <option value="SUSPENDED">Suspended (Blocked Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}