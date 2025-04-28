import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';

interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  profilePictureUrl: string;
  leaveBalance: number;
  carryOverBalance: number;
}

interface DashboardContentProps {
  user: { fullName: string } | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [stats, setStats] = useState({
    staffCount: 0,
    managerCount: 0,
    adminCount: 0,
  });

  useEffect(() => {
    const authToken = localStorage.getItem('token'); // Get token from local storage

    if (!authToken) {
      console.error('No authentication token found in localStorage');
      return; // Exit early if token is not found
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`, // Pass the token in the Authorization header
            'Content-Type': 'application/json',
          },
        });

        console.log("users",response);

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const users: UserData[] = await response.json();

        const staffCount = users.filter(user => user.role === "STAFF").length;
        const managerCount = users.filter(user => user.role === "MANAGER").length;
        const adminCount = users.filter(user => user.role === "ADMIN").length;

        setStats({ staffCount, managerCount, adminCount });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDashboardData();
  }, []); // Only run once, no dependency on `authToken` as it’s fetched from localStorage each time

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {user?.fullName || 'User'}!</h1>

      <div style={{ marginTop: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <h2>{stats.staffCount}</h2>
          <p>Staff Members</p>
        </div>
        <div style={cardStyle}>
          <h2>{stats.managerCount}</h2>
          <p>Managers</p>
        </div>
        <div style={cardStyle}>
          <h2>{stats.adminCount}</h2>
          <p>Admins</p>
        </div>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  flex: '1',
  minWidth: '200px',
  padding: '20px',
  backgroundColor: '#f0f2f5',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

export default DashboardContent;
