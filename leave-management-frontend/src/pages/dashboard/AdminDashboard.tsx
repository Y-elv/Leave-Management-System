import React, { useState, useEffect } from 'react';
import LayoutDashboard from '../../components/LayoutDashboard';
import { User, UserRole } from '../../types/user';
import { API_BASE_URL } from '../../config/api';

interface AdminDashboardProps {
  user: User;
}

interface UserListItem {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
  leaveBalance: number;
  carryOverBalance: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data as UserListItem[]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId: number, newRole: UserRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setAllUsers(allUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error loading user data</div>;
  }

  return (
    <LayoutDashboard role="ADMIN">
      <h1>Welcome, {user?.fullName}</h1>
      <div className="dashboard-container">
        <div className="user-info">
          <img 
            src={user.profilePictureUrl || '/default-avatar.png'} 
            alt={user.fullName} 
            className="profile-picture"
          />
          <div className="user-details">
            <h2>{user.fullName}</h2>
            <p>{user.email}</p>
            <p>Role: Admin</p>
          </div>
        </div>

        <div className="user-management">
          <h3>User Management</h3>
          <div className="users-list">
            {allUsers.map((u) => (
              <div key={u.id} className="user-card">
                <img 
                  src={u.profilePictureUrl || '/default-avatar.png'} 
                  alt={u.fullName} 
                  className="user-avatar"
                />
                <div className="user-info">
                  <h4>{u.fullName}</h4>
                  <p>{u.email}</p>
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleUpdate(u.id, e.target.value as UserRole)}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-stats">
          <h2>Admin Dashboard Overview</h2>
          {/* Add your dashboard widgets and stats here */}
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default AdminDashboard;
