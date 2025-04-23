import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Login from './pages/Login'
import StaffDashboard from './pages/dashboard/StaffDashboard'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { User } from './types/user'

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/users/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <Navigate to={`/dashboard/${user?.role.toLowerCase()}`} replace />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/staff" element={
          <ProtectedRoute user={user} allowedRoles={['STAFF']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/manager" element={
          <ProtectedRoute user={user} allowedRoles={['MANAGER']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/admin" element={
          <ProtectedRoute user={user} allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
