import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import ToastContainer, { useToast } from '../components/ToastContainer';
import '../css/LeaveRequest.css';

const LeaveRequest: React.FC = () => {
  const [leaveType, setLeaveType] = useState('SICK');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');
  const { toasts, addToast, removeToast } = useToast();
  
  // Define leave types that require documentation
  const requiresDocumentation = ['SICK', 'MATERNITY', 'COMPASSIONATE'];
  const documentRequired = requiresDocumentation.includes(leaveType);
  
  // Validate dates whenever they change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        setDateError('End date cannot be before start date');
      } else {
        setDateError('');
      }
    }
  }, [startDate, endDate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        addToast('Please upload a PDF or image file (JPEG, PNG)', 'error');
        return;
      }
      
      if (file.size > maxSize) {
        addToast('File size should be less than 5MB', 'error');
        return;
      }
      
      setDocumentFile(file);
      console.log('[FileChange] Selected file:', file);
    }
  };

  const uploadDocument = async () => {
    if (!documentFile) {
      addToast('Please select a file first', 'error');
      return;
    }
  
    try {
      console.log('[Upload] Starting upload...');
      setUploading(true);
  
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('upload_preset', 'leave-request-management');
      formData.append('api_key', '924411373142168');
      formData.append('api_secret', 'Xp9BDEbMZNLMeyf-Hpi8ABwM3k8');
  
      const response = await fetch('https://api.cloudinary.com/v1_1/dmzieqsir/upload', {
        method: 'POST',
        body: formData,
      });
  
      console.log('[Upload] Cloudinary response status:', response.status);
  
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
  
      const data = await response.json();
      console.log('[Upload] Cloudinary response data:', data);
      console.log('[Upload] Document URL:', data.secure_url);
      setDocumentUrl(data.secure_url);
      console.log('[Upload] Document URL:', documentUrl);
      addToast('Document uploaded successfully!', 'success');
    } catch (error) {
      console.error('[Upload] Upload failed:', error);
      addToast('Failed to upload document', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    console.log('[Submit] Starting submission');

    // Validate required fields
    if (!startDate || !endDate || !reason) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    
    // Validate dates
    if (dateError) {
      addToast(dateError, 'error');
      return;
    }
    
    // Validate document upload for leave types that require it
    if (documentRequired && !documentUrl) {
      addToast(`Document is required for ${leaveType} leave type`, 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        addToast('You must be logged in to submit a leave request.', 'error');
        return;
      }

      setIsSubmitting(true);
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const numberOfDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

      const payload = {
        leaveType,
        startDate,
        endDate,
        reason,
        documentUrl: documentUrl || null, // Allow null for non-required documents
        numberOfDays,
      };

      console.log('[Submit] Payload:', payload);

      const response = await fetch(`${API_BASE_URL}/api/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('[Submit] Error response:', errorData);
        throw new Error(errorData?.message || 'Failed to create leave request');
      }

      const successData = await response.json();
      console.log('[Submit] Success response:', successData);
      
      addToast('Leave request created successfully!', 'success');
      resetForm();
    } catch (error) {
      console.error('[Submit] Leave request creation failed:', error);
      addToast(error instanceof Error ? error.message : 'Failed to create leave request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    console.log('[Reset] Resetting form');
    setLeaveType('SICK');
    setStartDate('');
    setEndDate('');
    setReason('');
    setDocumentFile(null);
    setDocumentUrl('');
    setDateError('');
  };

  return (
    <div className="leave-request-container">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <motion.div
        className="leave-request-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Create Leave Request</h2>

        <div className="form-group">
          <label>Leave Type</label>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
            <option value="PTO">PTO</option>
            <option value="SICK">SICK</option>
            <option value="MATERNITY">MATERNITY</option>
            <option value="UNPAID">UNPAID</option>
            <option value="COMPASSIONATE">COMPASSIONATE</option>
          </select>
          {documentRequired && (
            <small className="requirement-note">This leave type requires supporting documentation</small>
          )}
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]} // Ensure end date is after start date
          />
          {dateError && <small className="error-message">{dateError}</small>}
        </div>

        <div className="form-group">
          <label>Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide details about your leave request"
          />
        </div>

        <div className="form-group">
          <label>{documentRequired ? 'Upload Document (Required)' : 'Upload Document (Optional)'}</label>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".pdf,.jpg,.jpeg,.png"
          />
          
          {documentFile && (
            <div className="file-info">
              <span>Selected: {documentFile.name}</span>
              <motion.button
                onClick={uploadDocument}
                disabled={uploading}
                className="upload-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </motion.button>
            </div>
          )}

          {documentUrl && (
            <div className="uploaded-url">
              <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                View Uploaded Document
              </a>
            </div>
          )}
        </div>

        <motion.button
          onClick={handleSubmit}
          className="submit-button"
          disabled={
            isSubmitting || 
            (documentRequired && !documentUrl) || 
            !!dateError || 
            !startDate || 
            !endDate || 
            !reason
          }
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LeaveRequest;
