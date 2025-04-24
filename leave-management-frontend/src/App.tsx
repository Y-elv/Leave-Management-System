import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import StaffDashboard from './pages/dashboard/StaffDashboard'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import OAuthCallback from './pages/OAuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import { User } from './types/user'
import { API_ENDPOINTS, getAuthHeaders } from './config/api'

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setLoading(false);
          return;
        }

        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(API_ENDPOINTS.ME, {
            headers: getAuthHeaders(token),
            credentials: 'include',
            signal: controller.signal
          });
           
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setAuthError(false);
          } else {
            console.log('Invalid token or session expired');
            localStorage.removeItem('token');
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
            localStorage.removeItem('token');
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

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace /> : <Login />
        } />

        <Route path="/oauth/callback" element={<OAuthCallback />} />

        <Route path="/dashboard/staff" element={
          <ProtectedRoute user={user} allowedRoles={['STAFF']} key={user?.id}>
            <StaffDashboard user={user!} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/manager" element={
          <ProtectedRoute user={user} allowedRoles={['MANAGER']} key={user?.id}>
            <ManagerDashboard user={user!} />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/admin" element={
          <ProtectedRoute user={user} allowedRoles={['ADMIN']} key={user?.id}>
            <AdminDashboard user={user!} />
          </ProtectedRoute>
        } />

        <Route path="/" element={
          user ? <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace /> : <Navigate to="/login" replace />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
