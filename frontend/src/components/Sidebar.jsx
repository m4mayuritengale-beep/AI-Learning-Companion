import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiGrid, 
  FiBookOpen, 
  FiMessageSquare, 
  FiFileText, 
  FiCheckSquare, 
  FiCompass, 
  FiPieChart 
} from 'react-icons/fi';
import '../styles/Sidebar.css';

function Sidebar() {
  const menuItems = [
    { path: '/', label: 'Overview', icon: <FiGrid /> },
    { path: '/courses', label: 'Courses & Modules', icon: <FiBookOpen /> },
    { path: '/ai-tutor', label: 'AI Tutor Chat', icon: <FiMessageSquare />, badge: 'AI' },
    { path: '/pdf-summarizer', label: 'PDF Summarizer', icon: <FiFileText /> },
    { path: '/quiz', label: 'Quiz Engine', icon: <FiCheckSquare /> },
    { path: '/learning-path', label: 'AI Learning Path', icon: <FiCompass /> },
    { path: '/analytics', label: 'Analytics', icon: <FiPieChart /> },
  ];

  return (
    <motion.aside 
      className="sidebar-glass"
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="sidebar-section-label">MAIN NAVIGATION</div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
            >
              <span className="icon-wrapper">{item.icon}</span>
              <span className="label">{item.label}</span>
              {item.badge && <span className="ai-pill">{item.badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer-card">
        <div className="ai-orb-mini"></div>
        <div>
          <h5>Gemini 1.5 Pro Engine</h5>
          <p>Active Socratic Mode</p>
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;