import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import ToastContainer, { useToast } from "./ToastContainer";
import "../css/LeaveRequest.css";

const LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Maternity Leave",
  "Unpaid Leave",
  "Compassionate Leave",
  "Study Leave",
  "Other",
];

const LeaveRequest: React.FC = () => {
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setDateError("End date cannot be before start date");
      } else {
        setDateError("");
      }
    }
  }, [startDate, endDate]);

  const estimatedDays = useMemo(() => {
    if (!startDate || !endDate || dateError) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
  }, [startDate, endDate, dateError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentFile(null);
      return;
    }
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const maxSize = 8 * 1024 * 1024;
    if (!validTypes.includes(file.type)) {
      addToast("Please upload a PDF or image (JPEG, PNG, WebP)", "error");
      return;
    }
    if (file.size > maxSize) {
      addToast("File must be under 8MB", "error");
      return;
    }
    setDocumentFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      addToast("Please fill in dates and reason.", "error");
      return;
    }
    if (dateError) {
      addToast(dateError, "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      addToast("You must be logged in.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("reason", reason.trim());
      formData.append("leaveType", leaveType);
      if (documentFile) {
        formData.append("document", documentFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/leaves`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || `Request failed (${response.status})`);
      }

      addToast("Leave request submitted successfully!", "success");
      window.dispatchEvent(new CustomEvent("slm-leaves-updated"));
      setLeaveType("Annual Leave");
      setStartDate("");
      setEndDate("");
      setReason("");
      setDocumentFile(null);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to submit leave request",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="leave-request-root">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <motion.div
        className="leave-request-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="leave-request-hero-inner">
          <span className="leave-request-badge">New request</span>
          <h1 className="leave-request-title">Create leave request</h1>
          <p className="leave-request-lead">
            Choose your dates and leave type. Add an optional supporting document — everything
            is sent securely in one step.
          </p>
        </div>
      </motion.div>

      <motion.form
        className="leave-request-form-card"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className="leave-request-form-grid">
          <label className="leave-field">
            <span className="leave-field-label">Leave type</span>
            <select
              className="leave-input leave-select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="leave-field">
            <span className="leave-field-label">Start date</span>
            <input
              className="leave-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
            />
          </label>

          <label className="leave-field">
            <span className="leave-field-label">End date</span>
            <input
              className="leave-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
            />
            {dateError && <span className="leave-field-error">{dateError}</span>}
          </label>

          <label className="leave-field leave-field-full">
            <span className="leave-field-label">Reason</span>
            <textarea
              className="leave-input leave-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Family vacation, medical appointment…"
              rows={4}
            />
          </label>

          <div className="leave-field leave-field-full leave-upload-block">
            <span className="leave-field-label">
              Supporting document <span className="leave-optional">(optional)</span>
            </span>
            <label className="leave-file-drop">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="leave-file-input"
              />
              <div className="leave-file-drop-content">
                {documentFile ? (
                  <>
                    <span className="leave-file-name">{documentFile.name}</span>
                    <span className="leave-file-hint">Tap to replace</span>
                  </>
                ) : (
                  <>
                    <span className="leave-file-placeholder">Drop a file or click to browse</span>
                    <span className="leave-file-hint">PDF or images up to 8MB</span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {estimatedDays > 0 && !dateError && (
          <div className="leave-summary-pill" role="status">
            <span className="leave-summary-label">Estimated working days</span>
            <span className="leave-summary-value">{estimatedDays}</span>
          </div>
        )}

        <motion.button
          type="submit"
          className="leave-submit-btn"
          disabled={isSubmitting || !!dateError || !startDate || !endDate || !reason.trim()}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting ? (
            <>
              <span className="leave-submit-spinner" aria-hidden />
              Submitting…
            </>
          ) : (
            "Submit leave request"
          )}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default LeaveRequest;
