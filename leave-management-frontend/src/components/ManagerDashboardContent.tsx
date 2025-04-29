import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import ToastContainer, { useToast } from '../components/ToastContainer';
import '../css/ManagerDashboard.css'; // Assume you have basic styling

interface LeaveRequest {
  id: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
}

interface ManagerDashboardContentProps {
  user: { fullName: string } | null;
}

const ManagerDashboardContent: React.FC<ManagerDashboardContentProps> = ({ user }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<{ [key: number]: string }>({});

  const [stats, setStats] = useState({
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        addToast('You must be logged in.', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/leave/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }

      const data: LeaveRequest[] = await response.json();
      setLeaveRequests(data);

      // Calculate stats
      const approved = data.filter(l => l.status === 'APPROVED').length;
      const rejected = data.filter(l => l.status === 'REJECTED').length;
      const pending = data.filter(l => l.status === 'PENDING').length;

      setStats({ approved, rejected, pending });
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      addToast('Failed to fetch leave requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (leaveId: number, approved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addToast('You must be logged in.', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/leave/${leaveId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved,
          approverComments: comments[leaveId] || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${approved ? 'approve' : 'reject'} leave`);
      }

      addToast(`Leave ${approved ? 'approved' : 'rejected'} successfully!`, 'success');
      fetchLeaveRequests();
    } catch (error) {
      console.error(`${approved ? 'Approval' : 'Rejection'} failed:`, error);
      addToast(`Failed to ${approved ? 'approve' : 'reject'} leave.`, 'error');
    }
  };

  const handleCommentChange = (leaveId: number, value: string) => {
    setComments(prev => ({ ...prev, [leaveId]: value }));
  };

  return (
    <div className="manager-dashboard-container">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <motion.div
        className="manager-dashboard-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Welcome Message */}
        <h1>Welcome, {user?.fullName || 'Manager'}!</h1>

        {/* Cards */}
        <div style={{ marginTop: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <h2>{stats.approved}</h2>
            <p>Approved Leaves</p>
          </div>
          <div style={cardStyle}>
            <h2>{stats.rejected}</h2>
            <p>Rejected Leaves</p>
          </div>
          <div style={cardStyle}>
            <h2>{stats.pending}</h2>
            <p>Pending Leaves</p>
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
      </motion.div>
    </div>
  );
};

// Reused card style
const cardStyle: React.CSSProperties = {
  flex: '1',
  minWidth: '200px',
  padding: '20px',
  backgroundColor: '#f0f2f5',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

export default ManagerDashboardContent;
