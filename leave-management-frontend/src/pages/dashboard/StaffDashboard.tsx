import React, { useState, useEffect } from 'react';
import LayoutDashboard from '../../components/LayoutDashboard';
import { User } from '../../types/user';
import '../../css/StaffDashboard.css';
import { API_BASE_URL } from '../../config/api';

interface StaffDashboardProps {
  user: User;
}

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/leave`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          console.log('Leave requests response:', response);
          const data = await response.json();
          setLeaveRequests(data);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LayoutDashboard role="STAFF">
      <div className="dashboard-container">
        <h1>Welcome, {user.fullName}</h1>

        <div className="leave-balance-section">
          <div className="balance-card">
            <h3>Annual Leave Balance</h3>
            <p className="balance-number">{user.leaveBalance} days</p>
          </div>
          <div className="balance-card">
            <h3>Carry Over Balance</h3>
            <p className="balance-number">{user.carryOverBalance} days</p>
          </div>
        </div>

        <div className="leave-history">
          <h2>Leave History</h2>
          <div className="leave-requests-list">
            {leaveRequests.length === 0 ? (
              <p>No leave requests found</p>
            ) : (
              leaveRequests.map((request) => (
                <div key={request.id} className="leave-request-card">
                  <div className="leave-request-header">
                    <h4>{request.type}</h4>
                    <span className={`status-badge ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="leave-request-details">
                    <p>From: {new Date(request.startDate).toLocaleDateString()}</p>
                    <p>To: {new Date(request.endDate).toLocaleDateString()}</p>
                    <p>Reason: {request.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button">
              Request Leave
            </button>
            <button className="action-button">
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default StaffDashboard;
