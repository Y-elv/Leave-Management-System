import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

interface LeaveBalance {
  currentBalance: number;
  carryOverBalance: number;
  totalBalance: number;
  monthlyAccrual: number;
  maxCarryOverDays: number;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  documentUrl: string;
  approverComments: string;
  numberOfDays: number;
  submissionDate: string;
}

interface StaffDashboardContentProps {
  user: { fullName: string } | null;
}

const StaffDashboardContent: React.FC<StaffDashboardContentProps> = ({ user }) => {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // New for modal
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Calendar selected date

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found.');
        setLoading(false);
        return;
      }

      try {
        const [balanceRes, requestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/leave/balance`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/leave`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!balanceRes.ok || !requestsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const balanceData = await balanceRes.json();
        const requestsData = await requestsRes.json();

        setLeaveBalance(balanceData);
        setLeaveRequests(requestsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={loadingStyle}>Loading...</div>;
  }

  if (error) {
    return <div style={errorStyle}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>

        <h1 style={headerStyle}>Welcome Staff, {user?.fullName || 'User'}!</h1>
        <button onClick={() => setIsCalendarOpen(true)} style={calendarButtonStyle}>
          View Calendar
        </button>
      </div>

       {/* Calendar Modal */}
       {isCalendarOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <button onClick={() => setIsCalendarOpen(false)} style={modalCloseButtonStyle}>
              Close
            </button>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
            />
          </div>
        </div>
      )}

      {/* Leave Balance Section */}
      {leaveBalance && (
        <div style={balanceGridStyle}>
          <BalanceCard title="Current Balance" value={`${leaveBalance.currentBalance} days`} />
          <BalanceCard title="Carry Over" value={`${leaveBalance.carryOverBalance} days`} />
          <BalanceCard title="Total Balance" value={`${leaveBalance.totalBalance} days`} />
          <BalanceCard title="Monthly Accrual" value={`${leaveBalance.monthlyAccrual} days`} />
          <BalanceCard title="Max Carry Over" value={`${leaveBalance.maxCarryOverDays} days`} />
        </div>
      )}

      {/* Leave Requests Section */}
      <div style={sectionCardStyle}>
        <h2 style={sectionHeaderStyle}>Leave Requests</h2>
        {leaveRequests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Dates</th>
                  <th style={tableHeaderStyle}>Days</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Reason</th>
                  <th style={tableHeaderStyle}>Document</th>
                  <th style={tableHeaderStyle}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={tableCellStyle}>{request.leaveType}</td>
                    <td style={tableCellStyle}>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </td>
                    <td style={tableCellStyle}>{request.numberOfDays}</td>
                    <td style={tableCellStyle}>
                      <StatusBadge status={request.status} />
                    </td>
                    <td style={tableCellStyle}>{request.reason}</td>
                    <td style={tableCellStyle}>
                      <a href={request.documentUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                        View
                      </a>
                    </td>
                    <td style={tableCellStyle}>{request.approverComments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#666' }}>No leave requests found.</p>
        )}
      </div>
    </div>
  );
};

// Helper Components
const BalanceCard = ({ title, value }: { title: string; value: string }) => (
  <div style={cardStyle}>
    <h3 style={{ fontSize: '16px', color: '#555' }}>{title}</h3>
    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colorStyles = {
    APPROVED: { backgroundColor: '#d1fae5', color: '#065f46' },
    PENDING: { backgroundColor: '#fef9c3', color: '#92400e' },
    REJECTED: { backgroundColor: '#fecaca', color: '#991b1b' },
    DEFAULT: { backgroundColor: '#e5e7eb', color: '#374151' }
  };

  const style = colorStyles[status as keyof typeof colorStyles] || colorStyles.DEFAULT;

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: style.backgroundColor,
      color: style.color
    }}>
      {status}
    </span>
  );
};

const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

// Styles
const loadingStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', color: '#666' };
const errorStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', color: '#b91c1c' };
const headerStyle: React.CSSProperties = { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' };
const sectionHeaderStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' };
const balanceGridStyle: React.CSSProperties = { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' };
const cardStyle: React.CSSProperties = {
  flex: '1',
  minWidth: '200px',
  padding: '20px',
  backgroundColor: '#f0f2f5',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
};
const sectionCardStyle: React.CSSProperties = {
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
};
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const tableHeaderStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  fontWeight: 'bold',
  fontSize: '14px'
};
const tableCellStyle: React.CSSProperties = { padding: '10px', fontSize: '14px', color: '#555' };
const linkStyle: React.CSSProperties = { color: '#3b82f6', textDecoration: 'underline' };

export default StaffDashboardContent;


// New Styles for Modal and Calendar Button
const calendarButtonStyle: React.CSSProperties = {
    marginLeft: 'auto',
    padding: '8px 12px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  };
  
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };
  
  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
    textAlign: 'center',
    position: 'relative'
  };
  
  const modalCloseButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#ef4444', // a red close button
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  