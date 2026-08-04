import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import BackgroundMesh from '../components/BackgroundMesh';
import { FiZap } from 'react-icons/fi';
import '../styles/Auth.css';

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, password, fullName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different email.');
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
            <h2>Create Pro Account</h2>
            <p>Start your personalized AI learning journey</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mayuri Student"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 digit, 1 uppercase"
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
              {submitting ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Register;
