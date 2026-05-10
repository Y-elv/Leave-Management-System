import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { FaUsers, FaUserTie, FaUserCog, FaUserShield } from 'react-icons/fa';
import '../css/AdminDashboard.css';


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
  onNavigate?: (key: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [stats, setStats] = useState({
    employeeCount: 0,
    supervisorCount: 0,
    hrCount: 0,
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
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        // The API returns { totalUsers, leaveRequests: { pending, approved, rejected, total } }
        setStats({ 
          employeeCount: data.totalUsers || 0, 
          supervisorCount: data.leaveRequests?.pending || 0, 
          hrCount: data.leaveRequests?.approved || 0, 
          adminCount: data.leaveRequests?.rejected || 0 
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaves/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leave requests');
        }

        const data = await response.json();
        // Map API response to our local LeaveRequest interface
        const mappedRequests = data.map((r: any) => ({
          id: r._id,
          employeeName: r.requester?.fullName || "Unknown",
          leaveType: r.leaveType,
          startDate: new Date(r.startDate).toLocaleDateString(),
          endDate: new Date(r.endDate).toLocaleDateString(),
          reason: r.reason,
          status: r.status
        }));
        setLeaveRequests(mappedRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchDashboardData();
    fetchLeaveRequests();
  }, []);

  const handleApprovalChange = (id: number, approve: boolean) => {
    // Implement API call for approval
    console.log(`Leave request ${id} has been ${approve ? 'approved' : 'rejected'}`);
  };

  const handleCommentChange = (id: number, value: string) => {
    setComments(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const roleData = [
    { name: 'Employees', value: stats.employeeCount },
    { name: 'Supervisors', value: stats.supervisorCount },
    { name: 'HR', value: stats.hrCount },
    { name: 'Admins', value: stats.adminCount },
  ];

  const leavesByType = leaveRequests.reduce((acc: any, curr) => {
    acc[curr.leaveType] = (acc[curr.leaveType] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(leavesByType).map(key => ({
    name: key,
    count: leavesByType[key]
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const displayName = user?.fullName || user?.name || "Admin";

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Welcome back, {displayName}</h1>
        <p className="admin-subtitle">Here's what's happening in your organization today.</p>
      </div>

      <motion.div
        className="admin-stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="admin-stat-card" variants={itemVariants}>
          <div className="admin-stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FaUsers />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{stats.employeeCount}</div>
            <div className="admin-stat-label">Total Employees</div>
          </div>
        </motion.div>
        
        <motion.div className="admin-stat-card" variants={itemVariants}>
          <div className="admin-stat-icon-wrapper" style={{ background: '#d1fae5', color: '#059669' }}>
            <FaUserTie />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{stats.supervisorCount}</div>
            <div className="admin-stat-label">Supervisors</div>
          </div>
        </motion.div>

        <motion.div className="admin-stat-card" variants={itemVariants}>
          <div className="admin-stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FaUserCog />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{stats.hrCount}</div>
            <div className="admin-stat-label">HR Personnel</div>
          </div>
        </motion.div>

        <motion.div className="admin-stat-card" variants={itemVariants}>
          <div className="admin-stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <FaUserShield />
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{stats.adminCount}</div>
            <div className="admin-stat-label">System Admins</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="admin-charts-grid">
        <motion.div className="admin-chart-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="admin-chart-title">System Roles Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="admin-chart-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="admin-chart-title">Leave Requests by Type</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {barChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="admin-requests-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="admin-requests-title">Pending Leave Requests</h2>
        {loading ? (
          <p>Loading leave requests...</p>
        ) : leaveRequests.filter(leave => leave.status === 'PENDING').length === 0 ? (
          <p>No pending leave requests at the moment.</p>
        ) : (
          <div className="admin-request-grid">
            {leaveRequests
              .filter(leave => leave.status === 'PENDING')
              .map((leave) => (
                <div key={leave.id} className="admin-request-card">
                  <div className="admin-request-header">
                    <h4 className="admin-request-name">{leave.employeeName}</h4>
                    <span className="admin-request-type">{leave.leaveType}</span>
                  </div>
                  
                  <div className="admin-request-dates">
                    <strong>Dates:</strong> {leave.startDate} to {leave.endDate}
                  </div>
                  
                  <div className="admin-request-reason">
                    <strong>Reason:</strong> {leave.reason || 'No reason provided.'}
                  </div>

                  <textarea
                    className="admin-textarea"
                    placeholder="Add a comment (optional)"
                    value={comments[leave.id] || ''}
                    onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                  />

                  <div className="admin-request-actions">
                    <button
                      className="admin-btn admin-btn-approve"
                      onClick={() => handleApprovalChange(leave.id, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="admin-btn admin-btn-reject"
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

export default AdminDashboardContent;
