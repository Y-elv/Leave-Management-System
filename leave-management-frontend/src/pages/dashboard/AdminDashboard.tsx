import { useEffect, useState } from 'react';
import { User } from '../../types/user';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('http://localhost:8083/api/users/me', {
          credentials: 'include'
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Fetch all users (admin only)
        const usersResponse = await fetch('http://localhost:8083/api/users', {
          credentials: 'include'
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setAllUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleUpdate = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:8083/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        // Refresh user list
        const usersResponse = await fetch('http://localhost:8083/api/users', {
          credentials: 'include'
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setAllUsers(usersData);
        }
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
                  onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
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

      {/* Add more admin-specific features here */}
    </div>
  );
};

export default AdminDashboard;
