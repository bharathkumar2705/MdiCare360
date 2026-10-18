import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ROLE_ROUTES = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  LAB: '/lab/dashboard',
  PHARMACY: '/pharmacy/dashboard',
  HOSPITAL_ADMIN: '/hospital/dashboard',
  PLATFORM_ADMIN: '/admin/dashboard',
};

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const dest = ROLE_ROUTES[user?.role] || '/login';
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (isAuthenticated && user) {
    const dest = ROLE_ROUTES[user.role] || '/';
    return <Navigate to={dest} replace />;
  }
  return <Outlet />;
};

export const getRoleDashboard = (role) => ROLE_ROUTES[role] || '/';
