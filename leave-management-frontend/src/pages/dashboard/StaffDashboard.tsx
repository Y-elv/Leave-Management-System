import { useEffect, useState } from 'react';
import { User } from '../../types/user';

const StaffDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/users/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
          <p>Role: Staff</p>
        </div>
      </div>

      <div className="leave-balance">
        <h3>Leave Balance</h3>
        <div className="balance-details">
          <div>
            <p>Current Balance</p>
            <h4>{user.leaveBalance} days</h4>
          </div>
          <div>
            <p>Carry Forward</p>
            <h4>{user.carryOverBalance} days</h4>
          </div>
        </div>
      </div>

      {/* Add more staff-specific features here */}
    </div>
  );
};

export default StaffDashboard;
