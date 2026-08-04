import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import BackgroundMesh from '../components/BackgroundMesh';
import { FiZap } from 'react-icons/fi';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your email & password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <BackgroundMesh />
      <div className="auth-container">
        <motion.div 
          className="auth-card-glass"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-header">
            <div className="auth-logo-icon">
              <FiZap />
            </div>
            <h2>AI Learn<span className="gradient-text">.companion</span></h2>
            <p>Sign in to access your Socratic AI companion & study paths</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button 
              type="submit" 
              className="auth-btn" 
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Login;
