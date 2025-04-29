import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';

interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  profilePictureUrl: string;
  leaveBalance: number;
  carryOverBalance: number;
}

interface LeaveRequest {
  id: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
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

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      console.error('No authentication token found in localStorage');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

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

    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leave/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leave requests');
        }

        const requests: LeaveRequest[] = await response.json();
        setLeaveRequests(requests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchDashboardData();
    fetchLeaveRequests();
  }, []); 

  const handleApprovalChange = (id: number, approve: boolean) => {
    console.log(`Leave request ${id} has been ${approve ? 'approved' : 'rejected'}`);
  };

  const handleCommentChange = (id: number, value: string) => {
    setComments(prevComments => ({
      ...prevComments,
      [id]: value,
    }));
  };

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

      {/* Leave Requests */}
      <h2 style={{ marginTop: '40px' }}>Pending Leave Requests</h2>

      {loading ? (
        <p>Loading leave requests...</p>
      ) : leaveRequests.filter(leave => leave.status === 'PENDING').length === 0 ? (
        <p>No pending leave requests.</p>
      ) : (
        leaveRequests
          .filter(leave => leave.status === 'PENDING')
          .map((leave) => (
            <motion.div
              key={leave.id}
              className="leave-request-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f2f5', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
            >
              <h4>{leave.employeeName}</h4>
              <p><strong>Type:</strong> {leave.leaveType}</p>
              <p><strong>Dates:</strong> {leave.startDate} to {leave.endDate}</p>
              <p><strong>Reason:</strong> {leave.reason}</p>

              <div style={{ marginTop: '10px' }}>
                <textarea
                  placeholder="Add a comment (optional)"
                  value={comments[leave.id] || ''}
                  onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                  style={{ width: '100%', minHeight: '60px', borderRadius: '6px', padding: '8px' }}
                />
              </div>

              <div className="action-buttons" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  className="approve-button"
                  onClick={() => handleApprovalChange(leave.id, true)}
                  style={{ backgroundColor: '#1890ff' }}
                >
                  Approve
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleApprovalChange(leave.id, false)}
                  style={{ backgroundColor: '#1890ff' }}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          ))
      )}
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
