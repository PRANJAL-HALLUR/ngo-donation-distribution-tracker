import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, userData, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-slate-400 mx-auto"
            viewBox="0 0 50 50"
          >
            <circle
              className="opacity-30"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            />
            <circle
              className="text-slate-600"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset="75"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // Bypass complete-profile check for demo account ngo@careandhope.org
  if (
    location.pathname === '/complete-profile' &&
    (user.email === 'ngo@careandhope.org' || userData?.email === 'ngo@careandhope.org')
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
