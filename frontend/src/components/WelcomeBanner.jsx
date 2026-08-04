import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiCompass } from 'react-icons/fi';
import { HiOutlineFire, HiOutlineSparkles } from 'react-icons/hi2';
import '../styles/WelcomeBanner.css';

function WelcomeBanner({ userName = 'Student', streakDays = 5 }) {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="welcome-banner-hero"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="hero-content">
        <div className="streak-pill">
          <HiOutlineFire className="streak-icon" />
          <span>{streakDays} Day Study Streak</span>
        </div>

        <h1>
          Welcome back, <span className="highlight-text">{userName}</span> 👋
        </h1>

        <p>
          Your personalized AI study companion is ready. Resume your Machine Learning roadmap or start a new interactive study session.
        </p>

        <div className="hero-actions">
          <motion.button 
            className="action-btn primary" 
            onClick={() => navigate('/ai-tutor')}
            whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.96 }}
          >
            <FiMessageSquare /> Ask AI Tutor
          </motion.button>

          <motion.button 
            className="action-btn secondary" 
            onClick={() => navigate('/learning-path')}
            whileHover={{ scale: 1.04, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.96 }}
          >
            <FiCompass /> View AI Roadmap
          </motion.button>
        </div>
      </div>

      <div className="hero-graphic">
        <div className="ai-brain-orb">
          <HiOutlineSparkles className="sparkle-icon" />
        </div>
      </div>
    </motion.div>
  );
}

export default WelcomeBanner;