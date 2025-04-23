import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons'
import '../css/Login.css'

const Login = () => {

  const handleMicrosoftLogin = () => {
    // Direct to the Spring Security OAuth2 endpoint
    window.location.href = 'http://localhost:8083/oauth2/authorization/azure-dev';
  }
  

  return (
    <div className="login-container">
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

        <motion.button
          className="microsoft-login-button"
          onClick={handleMicrosoftLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <FontAwesomeIcon icon={faMicrosoft} className="microsoft-icon" />
          Sign in with Microsoft
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Login