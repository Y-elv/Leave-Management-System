import { useEffect, useState } from 'react';
import { User } from '../../types/user';

const ManagerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
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

        // Fetch team leaves (pending approvals)
        const leavesResponse = await fetch('http://localhost:8083/api/leaves/pending', {
          credentials: 'include'
        });
        if (leavesResponse.ok) {
          const leavesData = await leavesResponse.json();
          setTeamLeaves(leavesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (leaveId: number) => {
    try {
      const response = await fetch(`http://localhost:8083/api/leaves/${leaveId}/approve`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        // Refresh the leave requests
        const leavesResponse = await fetch('http://localhost:8083/api/leaves/pending', {
          credentials: 'include'
        });
        if (leavesResponse.ok) {
          const leavesData = await leavesResponse.json();
          setTeamLeaves(leavesData);
        }
      }
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (leaveId: number) => {
    try {
      const response = await fetch(`http://localhost:8083/api/leaves/${leaveId}/reject`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        // Refresh the leave requests
        const leavesResponse = await fetch('http://localhost:8083/api/leaves/pending', {
          credentials: 'include'
        });
        if (leavesResponse.ok) {
          const leavesData = await leavesResponse.json();
          setTeamLeaves(leavesData);
        }
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
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
          <p>Role: Manager</p>
        </div>
      </div>

      <div className="pending-approvals">
        <h3>Pending Leave Approvals</h3>
        {teamLeaves.length === 0 ? (
          <p>No pending leave requests</p>
        ) : (
          <div className="leave-requests">
            {teamLeaves.map((leave) => (
              <div key={leave.id} className="leave-request-card">
                <h4>{leave.user.fullName}</h4>
                <p>Type: {leave.type}</p>
                <p>From: {new Date(leave.startDate).toLocaleDateString()}</p>
                <p>To: {new Date(leave.endDate).toLocaleDateString()}</p>
                <div className="actions">
                  <button onClick={() => handleApprove(leave.id)}>Approve</button>
                  <button onClick={() => handleReject(leave.id)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add more manager-specific features here */}
    </div>
  );
};

export default ManagerDashboard;
