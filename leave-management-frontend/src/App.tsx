import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import HrDashboard from './pages/dashboard/HrDashboard'
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard'
import OAuthCallback from './pages/OAuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import { User } from './types/user'
import { API_BASE_URL } from './config/api'
import AdminLogin from './pages/AdminLogin'
import { clearAuth, getAuth, getDashboardRouteForRole, saveAuth } from './utils/auth'

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedAuth = getAuth();

        if (!token) {
          setLoading(false);
          return;
        }

        // Fast-path: restore user from local storage to avoid login bounce.
        if (savedAuth?.user) {
          setUser(savedAuth.user);
          setAuthError(false);
          setLoading(false);
          return;
        }

        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
           
          if (response.ok) {
            const data = await response.json();
            // Support response shapes: { ...user }, { user: {...user} }, { data: {...user} }
            const normalizedUser = (data?.data ?? data?.user ?? data) as User;
            setUser(normalizedUser);
            // Keep local auth payload in sync with the most complete user profile from /me.
            saveAuth(token, normalizedUser);
            setAuthError(false);
          } else {
            console.log('Invalid token or session expired');
            clearAuth();
            setAuthError(true);
          }
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        if (error instanceof Error) {
          // Only clear token if it's not an abort error
          if (error.name !== 'AbortError') {
            clearAuth();
            setAuthError(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (authError) {
    return <Navigate to="/login" replace />;
  }

  const userDashboardRoute = getDashboardRouteForRole(user?.role);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to={userDashboardRoute} replace /> : <Login />
        } />

        <Route path="/admin/login" element={
          user ? <Navigate to={userDashboardRoute} replace /> : <AdminLogin />
        } />

        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Legacy route: keep for backward compatibility */}
        <Route path="/dashboard/staff" element={<Navigate to="/dashboard/employee" replace />} />

        <Route path="/dashboard/employee" element={
          <ProtectedRoute user={user} allowedRoles={['EMPLOYEE']} key={user?.id}>
            <EmployeeDashboard user={user!} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/supervisor" element={
          <ProtectedRoute user={user} allowedRoles={['SUPERVISOR']} key={user?.id}>
            <SupervisorDashboard user={user!} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/hr" element={
          <ProtectedRoute user={user} allowedRoles={['HR']} key={user?.id}>
            <HrDashboard user={user!} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/admin" element={
          <ProtectedRoute user={user} allowedRoles={['ADMIN']} key={user?.id}>
            <AdminDashboard user={user!} />
          </ProtectedRoute>
        } />

        <Route path="/" element={
          user ? <Navigate to={userDashboardRoute} replace /> : <Navigate to="/login" replace />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
