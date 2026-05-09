import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { LEAVE_STATUS, normalizeLeaveStatus } from '../constants/leaveStatus';
import '../css/employeeDashboard.css';

interface LeaveBalance {
  currentBalance: number;
  carryOverBalance: number;
  totalBalance: number;
  monthlyAccrual: number;
  maxCarryOverDays: number;
}

/** Normalized leave row (from GET /api/leaves/my) */
interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  documentUrl: string;
  numberOfDays: number;
  submissionDate: string;
}

interface ApiLeaveRow {
  _id?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: string;
  documentUrl?: string | null;
  days?: number;
  daysRequested?: number;
  createdAt?: string;
}

function normalizeLeavesFromApi(rows: ApiLeaveRow[]): LeaveRequest[] {
  return rows.map((row) => ({
    id: row._id ?? '',
    leaveType: row.leaveType ?? '',
    startDate: row.startDate ?? '',
    endDate: row.endDate ?? '',
    reason: row.reason ?? '',
    status: normalizeLeaveStatus(row.status),
    documentUrl: row.documentUrl ?? '',
    numberOfDays: row.days ?? row.daysRequested ?? 0,
    submissionDate: row.createdAt ?? '',
  }));
}

interface EmployeeProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  departmentId: string | null;
  employmentType: string | null;
  annualEntitlement: number;
  carryForwardCap: number;
  leaveBalance: number;
  carryOverBalance: number;
  annualLeaveEntitlement: number;
  leaveYear: number;
  academicYear?: string | null;
}

interface StaffDashboardContentProps {
  user: { fullName: string } | null;
}

const StaffDashboardContent: React.FC<StaffDashboardContentProps> = ({ user }) => {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialNotice, setPartialNotice] = useState<string | null>(null);

  const fetchMyLeaves = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaves/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setLeaveRequests([]);
        return;
      }
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data?.data ?? []);
      setLeaveRequests(normalizeLeavesFromApi(Array.isArray(raw) ? raw : []));
    } catch {
      setLeaveRequests([]);
    }
  }, []);

  useEffect(() => {
    const onLeavesUpdated = () => {
      void fetchMyLeaves();
    };
    window.addEventListener('slm-leaves-updated', onLeavesUpdated);
    return () => window.removeEventListener('slm-leaves-updated', onLeavesUpdated);
  }, [fetchMyLeaves]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found.');
        setLoading(false);
        return;
      }

      try {
        const [balanceRes, requestsRes, meRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/leave/balance`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/leaves/my`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (meRes.status !== "fulfilled" || !meRes.value.ok) {
          throw new Error('Failed to load employee profile');
        }

        const meData = await meRes.value.json();
        const normalizedProfile = (meData?.data ?? meData?.user ?? meData) as EmployeeProfile;
        setProfile(normalizedProfile);

        if (balanceRes.status === "fulfilled" && balanceRes.value.ok) {
          const balanceData = await balanceRes.value.json();
          const normalizedBalance = (balanceData?.data ?? balanceData) as LeaveBalance;
          setLeaveBalance(normalizedBalance);
        } else {
          setLeaveBalance({
            currentBalance: normalizedProfile.leaveBalance ?? 0,
            carryOverBalance: normalizedProfile.carryOverBalance ?? 0,
            totalBalance:
              (normalizedProfile.leaveBalance ?? 0) + (normalizedProfile.carryOverBalance ?? 0),
            monthlyAccrual: 0,
            maxCarryOverDays: normalizedProfile.carryForwardCap ?? 0,
          });
        }

        if (requestsRes.status === "fulfilled" && requestsRes.value.ok) {
          const requestsData = await requestsRes.value.json();
          const raw = Array.isArray(requestsData) ? requestsData : (requestsData?.data ?? []);
          setLeaveRequests(normalizeLeavesFromApi(Array.isArray(raw) ? raw : []));
        } else {
          setLeaveRequests([]);
        }

        if (
          balanceRes.status !== "fulfilled" ||
          !balanceRes.value.ok ||
          requestsRes.status !== "fulfilled" ||
          !requestsRes.value.ok
        ) {
          setPartialNotice("Some leave widgets are temporarily unavailable, but your profile is loaded.");
        } else {
          setPartialNotice(null);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusCounts = useMemo(() => {
    return leaveRequests.reduce(
      (acc, request) => {
        const status = normalizeLeaveStatus(request.status);
        if (status === LEAVE_STATUS.APPROVED) acc.approved += 1;
        else if (status === LEAVE_STATUS.REJECTED) acc.rejected += 1;
        else if (status === LEAVE_STATUS.CANCELLED) acc.cancelled += 1;
        else acc.pending += 1;
        return acc;
      },
      { approved: 0, pending: 0, rejected: 0, cancelled: 0 }
    );
  }, [leaveRequests]);

  const leavesApplied = leaveRequests.length;
  const acceptedLeaves = statusCounts.approved;
  const pendingLeaves = statusCounts.pending;

  const upcomingLeave = useMemo(() => {
    const now = new Date();
    return leaveRequests
      .filter((request) => new Date(request.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  }, [leaveRequests]);

  const recentRequests = useMemo(() => {
    return [...leaveRequests]
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
      .slice(0, 5);
  }, [leaveRequests]);

  if (loading) {
    return <div style={loadingStyle}>Loading...</div>;
  }

  if (error) {
    return <div style={errorStyle}>{error}</div>;
  }

  return (
    <div className="employee-dashboard">
      <div style={heroStyle} className="employee-dashboard-hero">
        <div className="employee-dashboard-hero-main">
          <h1 className="employee-dashboard-h1" style={headerStyle}>
            Welcome, {profile?.fullName || user?.fullName || 'Employee'}
          </h1>
          <p className="employee-dashboard-lead" style={subHeaderStyle}>
            Track your leave balance, view approval progress, and plan time off from one place.
          </p>
        </div>
        <div style={heroRightStyle} className="employee-dashboard-hero-aside">
          <p style={heroLabelStyle}>Leave Year</p>
          <p style={heroValueStyle}>{profile?.leaveYear ?? new Date().getFullYear()}</p>
        </div>
      </div>

      {partialNotice && <div style={noticeStyle}>{partialNotice}</div>}

      {leaveBalance && (
        <div className="employee-dashboard-cards">
          <InfoCard title="Leaves Applied" value={`${leavesApplied}`} accent="#7c3aed" />
          <InfoCard title="Pending Leaves" value={`${pendingLeaves}`} accent="#f59e0b" />
          <InfoCard title="Accepted Leaves" value={`${acceptedLeaves}`} accent="#10b981" />
          <InfoCard title="Available Leave" value={`${leaveBalance.currentBalance} days`} accent="#4f46e5" />
          <InfoCard title="Carry Over" value={`${leaveBalance.carryOverBalance} days`} accent="#0ea5e9" />
          <InfoCard title="Monthly Accrual" value={`${leaveBalance.monthlyAccrual} days`} accent="#14b8a6" />
          <InfoCard title="Annual Total" value={`${leaveBalance.totalBalance} days`} accent="#f59e0b" />
        </div>
      )}

      <div className="employee-dashboard-insights">
        <div style={sectionCardStyle} className="employee-dashboard-section">
          <h2 style={sectionHeaderStyle}>Employee Profile</h2>
          <div className="employee-dashboard-profile-grid">
            <ProfileItem label="Email" value={profile?.email || "-"} />
            <ProfileItem label="Role" value={profile?.role || "EMPLOYEE"} />
            <ProfileItem label="Employment Type" value={profile?.employmentType || "-"} />
            <ProfileItem label="Department" value={profile?.departmentId || "-"} />
            <ProfileItem label="Annual Entitlement" value={`${profile?.annualEntitlement ?? 0} days`} />
            <ProfileItem label="Carry Forward Cap" value={`${profile?.carryForwardCap ?? 0} days`} />
          </div>
        </div>

        <div style={sectionCardStyle} className="employee-dashboard-section">
          <h2 style={sectionHeaderStyle}>Leave status</h2>
          <div className="employee-dashboard-status-grid">
            <StatusCounter label="Pending" value={statusCounts.pending} color="#f59e0b" />
            <StatusCounter label="Approved" value={statusCounts.approved} color="#10b981" />
            <StatusCounter label="Rejected" value={statusCounts.rejected} color="#ef4444" />
            <StatusCounter label="Cancelled" value={statusCounts.cancelled} color="#6b7280" />
          </div>
        </div>

        <div style={sectionCardStyle} className="employee-dashboard-section">
          <h2 style={sectionHeaderStyle}>Upcoming Leave</h2>
          {upcomingLeave ? (
            <div>
              <p style={upcomingTitleStyle}>{upcomingLeave.leaveType}</p>
              <p style={upcomingTextStyle}>
                {formatDate(upcomingLeave.startDate)} - {formatDate(upcomingLeave.endDate)}
              </p>
              <p style={upcomingTextStyle}>Duration: {upcomingLeave.numberOfDays} day(s)</p>
              <StatusBadge status={upcomingLeave.status} />
            </div>
          ) : (
            <p style={emptyTextStyle}>No upcoming leave scheduled.</p>
          )}
        </div>
      </div>

      <div style={sectionCardStyle} className="employee-dashboard-section">
        <h2 style={sectionHeaderStyle}>Recent Leave Requests</h2>
        {recentRequests.length > 0 ? (
          <div className="employee-dashboard-table-wrap">
            <table className="employee-dashboard-table" style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Period</th>
                  <th style={tableHeaderStyle}>Days</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Submitted</th>
                  <th style={tableHeaderStyle}>Document</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr key={request.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={tableCellStyle}>{request.leaveType}</td>
                    <td style={tableCellStyle}>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </td>
                    <td style={tableCellStyle}>{request.numberOfDays}</td>
                    <td style={tableCellStyle}>
                      <StatusBadge status={request.status} />
                    </td>
                    <td style={tableCellStyle}>
                      {request.submissionDate ? formatDate(request.submissionDate) : '—'}
                    </td>
                    <td style={tableCellStyle}>
                      {request.documentUrl ? (
                        <a href={request.documentUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                          View
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={emptyTextStyle}>No leave requests found.</p>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ title, value, accent }: { title: string; value: string; accent: string }) => (
  <div
    className="employee-dashboard-card"
    style={{ ...cardStyle, borderTop: `4px solid ${accent}` }}
  >
    <h3 className="employee-dashboard-card-title" style={cardTitleStyle}>
      {title}
    </h3>
    <p className="employee-dashboard-card-value" style={{ ...cardValueStyle, color: accent }}>
      {value}
    </p>
  </div>
);

const StatusCounter = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="employee-dashboard-status-cell" style={statusCardStyle}>
    <p style={{ ...statusValueStyle, color }}>{value}</p>
    <p style={statusLabelStyle}>{label}</p>
  </div>
);

const ProfileItem = ({ label, value }: { label: string; value: string }) => (
  <div style={profileItemStyle}>
    <p style={profileLabelStyle}>{label}</p>
    <p style={profileValueStyle}>{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const s = normalizeLeaveStatus(status);
  const colorStyles: Record<string, { backgroundColor: string; color: string }> = {
    [LEAVE_STATUS.APPROVED]: { backgroundColor: '#d1fae5', color: '#065f46' },
    [LEAVE_STATUS.PENDING]: { backgroundColor: '#fef9c3', color: '#92400e' },
    [LEAVE_STATUS.REJECTED]: { backgroundColor: '#fecaca', color: '#991b1b' },
    [LEAVE_STATUS.CANCELLED]: { backgroundColor: '#e5e7eb', color: '#374151' },
  };

  const style =
    colorStyles[s as keyof typeof colorStyles] ??
    { backgroundColor: '#e5e7eb', color: '#374151' };

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: style.backgroundColor,
      color: style.color
    }}>
      {s}
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
const noticeStyle: React.CSSProperties = {
  padding: '10px 14px',
  backgroundColor: '#fffbeb',
  color: '#92400e',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  fontSize: '14px',
};
const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #312e81, #4f46e5)',
  color: '#fff',
  borderRadius: '14px',
  padding: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
};
const heroRightStyle: React.CSSProperties = { textAlign: 'right' };
const heroLabelStyle: React.CSSProperties = { margin: 0, opacity: 0.85, fontSize: '13px' };
const heroValueStyle: React.CSSProperties = { margin: 0, fontSize: '30px', fontWeight: 700 };
const headerStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 700, margin: 0 };
const subHeaderStyle: React.CSSProperties = { margin: '8px 0 0', opacity: 0.9, maxWidth: '560px' };
const sectionHeaderStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' };
const cardStyle: React.CSSProperties = {
  padding: '18px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
};
const cardTitleStyle: React.CSSProperties = { margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 500 };
const cardValueStyle: React.CSSProperties = { margin: '8px 0 0', fontSize: '24px', fontWeight: 700 };
const statusCardStyle: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '10px',
  textAlign: 'center',
  padding: '14px 10px',
};
const statusValueStyle: React.CSSProperties = { margin: 0, fontSize: '24px', fontWeight: 700 };
const statusLabelStyle: React.CSSProperties = { margin: '4px 0 0', color: '#6b7280', fontSize: '13px' };
const profileItemStyle: React.CSSProperties = { backgroundColor: '#f9fafb', borderRadius: '10px', padding: '12px', minWidth: 0 };
const profileLabelStyle: React.CSSProperties = { margin: 0, fontSize: '12px', color: '#6b7280' };
const profileValueStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: '14px',
  fontWeight: 600,
  color: '#1f2937',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
};
const sectionCardStyle: React.CSSProperties = {
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
};
const upcomingTitleStyle: React.CSSProperties = { margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937' };
const upcomingTextStyle: React.CSSProperties = { margin: '8px 0 0', color: '#4b5563' };
const emptyTextStyle: React.CSSProperties = { color: '#6b7280' };
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
const linkStyle: React.CSSProperties = { color: '#4f46e5', textDecoration: 'underline' };

export default StaffDashboardContent;
