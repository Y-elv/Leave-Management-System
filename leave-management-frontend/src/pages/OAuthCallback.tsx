import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastContainer, { useToast } from '../components/ToastContainer';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const error = searchParams.get('error');

    if (error) {
      addToast(error, 'error');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    if (!token || !role) {
      addToast('Invalid authentication response', 'error');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    try {
      // Store token
      localStorage.setItem('token', token);
      addToast('Login successful!', 'success');
      
      // Force a page reload to trigger App's useEffect and fetch user data
      window.location.href = `/dashboard/${role}`;
    } catch (error) {
      console.error('OAuth callback error:', error);
      addToast('An error occurred during login', 'error');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [navigate, searchParams, addToast]);

  return (
    <div className="oauth-callback">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <LoadingSpinner />
    </div>
  );
};

export default OAuthCallback;
