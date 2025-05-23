import React, { useState, useEffect } from 'react';
import LayoutDashboard from '../../components/LayoutDashboard';
import { User } from '../../types/user';
import { API_BASE_URL } from '../../config/api';

interface ManagerDashboardProps {
  user: User;
}

interface TeamMember {
  id: number;
  fullName: string;
  email: string;
  leaveBalance: number;
  profilePictureUrl?: string;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log("am in manager dashboard"); 
        console.log(token); 
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LayoutDashboard role="MANAGER">
      <div className="dashboard-container">
        <h1>Welcome, {user.fullName}</h1>
        
        <div className="team-management">
          <h2>Team Management</h2>
          <div className="team-members-list">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-member-card">
                <img 
                  src={member.profilePictureUrl || '/default-avatar.png'} 
                  alt={member.fullName} 
                  className="member-avatar"
                />
                <div className="member-info">
                  <h4>{member.fullName}</h4>
                  <p>{member.email}</p>
                  <p>Leave Balance: {member.leaveBalance} days</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leave-requests">
          <h2>Pending Leave Requests</h2>
          {/* Add leave requests component here */}
        </div>

        <div className="team-calendar">
          <h2>Team Calendar</h2>
          {/* Add team calendar component here */}
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default ManagerDashboard;
