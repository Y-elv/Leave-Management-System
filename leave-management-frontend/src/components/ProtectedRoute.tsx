import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, user, allowedRoles }: ProtectedRouteProps) => {
  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User's role is not authorized, redirect to appropriate dashboard
    switch (user.role) {
      case 'STAFF':
        return <Navigate to="/dashboard/staff" replace />;
      case 'MANAGER':
        return <Navigate to="/dashboard/manager" replace />;
      case 'ADMIN':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
