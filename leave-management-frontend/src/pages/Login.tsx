import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import ToastContainer, { useToast } from '../components/ToastContainer'
import { API_ENDPOINTS } from '../config/api'
import '../css/Login.css'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleMicrosoftLogin = () => {
    window.location.href = API_ENDPOINTS.MICROSOFT_LOGIN;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
          signal: controller.signal
        });

        const data = await response.json();

        if (!response.ok) {
          addToast(data.message || 'Invalid credentials', 'error');
          return;
        }

        // Store token
        localStorage.setItem('token', data.token);
        
        // Show success toast and redirect
        addToast('Login successful!', 'success');
        
        // Force a page reload to trigger App's useEffect and fetch user data
        const role = data.user.role.toLowerCase();
        window.location.href = `/dashboard/${role}`;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        // Don't show error for aborted requests
        if (error.name !== 'AbortError') {
          addToast('An error occurred during login', 'error');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="title-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1>Leave Management System</h1>
          <p>Streamline your leave requests and approvals</p>
        </motion.div>

        <motion.form
          className="login-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
              disabled={isLoading}
            />
          </div>
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <motion.button
            type="submit"
            className="login-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </motion.form>

        <div className="divider">
          <span>OR</span>
        </div>

        <motion.button
          className="microsoft-login-button"
          onClick={handleMicrosoftLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faMicrosoft} className="microsoft-icon" />
          Sign in with Microsoft
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Login