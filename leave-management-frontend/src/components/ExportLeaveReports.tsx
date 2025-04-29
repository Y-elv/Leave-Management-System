import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useToast } from "../components/ToastContainer"; // Importing useToast

const ExportLeaveReports = () => {
  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const { addToast } = useToast(); // Destructuring addToast function

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (leaveType) params.append('leaveType', leaveType);

      const response = await fetch(`${API_BASE_URL}/api/leave/export?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leave_reports.csv';
      a.click();
      window.URL.revokeObjectURL(url);

      // Show success toast
      addToast('Leave reports exported successfully!', 'success');
    } catch (error) {
      console.error("Error exporting CSV:", error);
      // Show error toast
      addToast('An error occurred while exporting reports.', 'error');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Export Leave Reports
      </h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Status (optional)
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid gray' }}
        >
          <option value="">Select Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Leave Type (optional)
        </label>
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid gray' }}
        >
          <option value="">Select Leave Type</option>
          <option value="PTO">PTO</option>
          <option value="SICK">Sick</option>
          <option value="MATERNITY">Maternity</option>
          <option value="UNPAID">Unpaid</option>
          <option value="COMPASSIONATE">Compassionate</option>
        </select>
      </div>

      <button
        onClick={handleExport}
        style={{
          padding: '10px 16px',
          backgroundColor: '#1890ff',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Download CSV
      </button>
    </div>
  );
};

export default ExportLeaveReports;
