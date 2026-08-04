import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiBell, FiLogOut, FiUser, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <motion.nav 
      className="navbar-glass"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="nav-logo">
        <div className="logo-spark-icon">
          <FiZap />
        </div>
        <h2>AI Learn<span className="gradient-text">.companion</span></h2>
      </div>

      <div className="nav-search">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Ask AI or search courses, notes, topics... (Ctrl + K)"
          />
        </div>
      </div>

      <div className="nav-right">
        <motion.button 
          className="notification-btn" 
          title="Notifications"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiBell />
          <span className="badge-dot"></span>
        </motion.button>

        <div className="profile-chip">
          <div className="avatar-circle">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <FiUser />}
          </div>
          <div className="profile-info">
            <h4>{user?.full_name || 'Student'}</h4>
            <span className="role-tag">Pro Plan</span>
          </div>
        </div>

        <motion.button 
          className="logout-btn" 
          onClick={logout} 
          title="Sign Out"
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
          whileTap={{ scale: 0.95 }}
        >
          <FiLogOut />
        </motion.button>
      </div>
    </motion.nav>
  );
}

export default Navbar;