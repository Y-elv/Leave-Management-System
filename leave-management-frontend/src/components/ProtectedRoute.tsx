import { Navigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, user, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!user || !localStorage.getItem('token')) {
    // Not logged in or no valid token, redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    // User's role is not authorized, redirect to their appropriate dashboard
    return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />;
  }

  // Render children only if user exists and has correct role
  return <>{children}</>;
};

export default ProtectedRoute;
