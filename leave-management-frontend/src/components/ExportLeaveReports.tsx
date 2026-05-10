import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useToast } from "../components/ToastContainer";
import { motion } from "framer-motion";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../css/ExportLeaveReports.css";

const ExportLeaveReports = () => {
  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (leaveType) params.append('leaveType', leaveType);

      const response = await fetch(`${API_BASE_URL}/api/leaves/export?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "text/csv" },
      });

      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_reports_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      addToast('CSV report downloaded successfully!', 'success');
    } catch (error) {
      console.error("Error exporting CSV:", error);
      addToast('An error occurred while exporting the CSV report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      // We fetch all leave requests and filter them client-side for the PDF
      // since there is no native PDF generation backend endpoint currently.
      const response = await fetch(`${API_BASE_URL}/api/leaves/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error('Failed to fetch leave data');

      const data: any[] = await response.json();
      
      const filteredLeaves = data
        .map(r => ({
          id: r._id,
          employeeName: r.requester?.fullName || "Unknown",
          leaveType: r.leaveType,
          startDate: new Date(r.startDate).toLocaleDateString(),
          endDate: new Date(r.endDate).toLocaleDateString(),
          days: r.days,
          reason: r.reason,
          status: r.status
        }))
        .filter(leave => {
        const matchesStatus = status ? leave.status === status : true;
        const matchesType = leaveType ? leave.leaveType === leaveType : true;
        return matchesStatus && matchesType;
      });

      if (filteredLeaves.length === 0) {
        addToast('No records found for the selected filters.', 'warning');
        setLoading(false);
        return;
      }

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text("Leave Management System", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Official Leave Report`, 14, 30);
      
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString();
      doc.text(`Generated on: ${today}`, 14, 36);

      if (status || leaveType) {
        doc.text(`Filters applied - Status: ${status || 'All'}, Type: ${leaveType || 'All'}`, 14, 42);
      }

      const tableData = filteredLeaves.map(leave => [
        leave.employeeName,
        leave.leaveType,
        leave.startDate,
        leave.endDate,
        leave.days !== undefined ? leave.days : 'N/A',
        leave.status
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10, cellPadding: 4 },
        margin: { top: 50 }
      });

      doc.save(`Leave_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      addToast('PDF report generated successfully!', 'success');
    } catch (error) {
      console.error("Error generating PDF:", error);
      addToast('An error occurred while generating the PDF.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-container">
      <motion.div 
        className="export-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="export-header">
          <h2 className="export-title">Export Leave Reports</h2>
          <p className="export-subtitle">Generate custom reports for auditing and payroll.</p>
        </div>

        <div className="export-filters">
          <div className="export-field">
            <label className="export-label">Filter by Status</label>
            <select
              className="export-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="export-field">
            <label className="export-label">Filter by Leave Type</label>
            <select
              className="export-select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="">All Leave Types</option>
              <option value="PTO">PTO</option>
              <option value="SICK">Sick</option>
              <option value="MATERNITY">Maternity</option>
              <option value="UNPAID">Unpaid</option>
              <option value="COMPASSIONATE">Compassionate</option>
            </select>
          </div>
        </div>

        <div className="export-actions">
          <button
            className="export-btn export-btn-csv"
            onClick={handleExportCSV}
            disabled={loading}
          >
            <FaFileCsv size={20} />
            {loading ? 'Processing...' : 'Download CSV'}
          </button>

          <button
            className="export-btn export-btn-pdf"
            onClick={handleExportPDF}
            disabled={loading}
          >
            <FaFilePdf size={20} />
            {loading ? 'Processing...' : 'Download PDF'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportLeaveReports;
