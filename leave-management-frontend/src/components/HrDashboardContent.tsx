import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { FaUsers, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { BiDownload } from 'react-icons/bi';
import '../css/HrDashboard.css';

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
  user: { fullName?: string; name?: string } | null;
  onNavigate: (key: string) => void;
}

const HrDashboardContent: React.FC<DashboardContentProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState({
    employeeCount: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
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
        const statsRes = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!statsRes.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsRes.json();

        const leaveRes = await fetch(`${API_BASE_URL}/api/leaves/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!leaveRes.ok) throw new Error('Failed to fetch leave requests');
        const requestsData: any[] = await leaveRes.json();

        setStats({
          employeeCount: statsData.totalUsers || 0,
          pendingLeaves: statsData.leaveRequests?.pending || 0,
          approvedLeaves: statsData.leaveRequests?.approved || 0,
        });

        setLeaveRequests(requestsData.map(r => ({
          id: r._id,
          employeeName: r.requester?.fullName || "Unknown",
          leaveType: r.leaveType,
          startDate: new Date(r.startDate).toLocaleDateString(),
          endDate: new Date(r.endDate).toLocaleDateString(),
          reason: r.reason,
          status: r.status
        })));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApprovalChange = (id: number, approve: boolean) => {
    // Implement API call for approval
    console.log(`HR Leave request ${id} has been ${approve ? 'approved' : 'rejected'}`);
  };

  const handleCommentChange = (id: number, value: string) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const displayName = user?.fullName || user?.name || "HR Manager";

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <h1 className="hr-title">Welcome back, {displayName}</h1>
        <p className="hr-subtitle">Overview of company leaves and employee metrics.</p>
      </div>

      <motion.div
        className="hr-stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hr-stat-card" variants={itemVariants}>
          <div className="hr-stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FaUsers />
          </div>
          <div className="hr-stat-content">
            <div className="hr-stat-value">{stats.employeeCount}</div>
            <div className="hr-stat-label">Total Employees</div>
          </div>
        </motion.div>

        <motion.div className="hr-stat-card" variants={itemVariants}>
          <div className="hr-stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FaClipboardList />
          </div>
          <div className="hr-stat-content">
            <div className="hr-stat-value">{stats.pendingLeaves}</div>
            <div className="hr-stat-label">Pending HR Approvals</div>
          </div>
        </motion.div>

        <motion.div className="hr-stat-card" variants={itemVariants}>
          <div className="hr-stat-icon-wrapper" style={{ background: '#d1fae5', color: '#059669' }}>
            <FaCheckCircle />
          </div>
          <div className="hr-stat-content">
            <div className="hr-stat-value">{stats.approvedLeaves}</div>
            <div className="hr-stat-label">Total Approved Leaves</div>
          </div>
        </motion.div>

        <motion.div className="hr-actions-card" variants={itemVariants}>
          <h3 className="hr-actions-title">Reports & Exports</h3>
          <p className="hr-actions-subtitle">Generate CSV and PDF documents for company reporting.</p>
          <button className="hr-btn-export" onClick={() => onNavigate('export')}>
            <BiDownload size={18} /> Export Reports
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="hr-requests-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="hr-requests-title">Pending Leave Requests</h2>
        {loading ? (
          <p>Loading leave requests...</p>
        ) : leaveRequests.filter(leave => leave.status === 'PENDING').length === 0 ? (
          <p>No pending leave requests at the moment.</p>
        ) : (
          <div className="hr-request-grid">
            {leaveRequests
              .filter(leave => leave.status === 'PENDING')
              .map((leave) => (
                <div key={leave.id} className="hr-request-card">
                  <div className="hr-request-header">
                    <h4 className="hr-request-name">{leave.employeeName}</h4>
                    <span className="hr-request-type">{leave.leaveType}</span>
                  </div>

                  <div className="hr-request-dates">
                    <strong>Dates:</strong> {leave.startDate} to {leave.endDate}
                  </div>

                  <div className="hr-request-reason">
                    <strong>Reason:</strong> {leave.reason || 'No reason provided.'}
                  </div>

                  <textarea
                    className="hr-textarea"
                    placeholder="Add a comment for the employee (optional)"
                    value={comments[leave.id] || ''}
                    onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                  />

                  <div className="hr-request-actions">
                    <button
                      className="hr-btn hr-btn-approve"
                      onClick={() => handleApprovalChange(leave.id, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="hr-btn hr-btn-reject"
                      onClick={() => handleApprovalChange(leave.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HrDashboardContent;
