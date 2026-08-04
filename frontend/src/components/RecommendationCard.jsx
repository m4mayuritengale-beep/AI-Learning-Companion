import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCpu, FiArrowRight } from 'react-icons/fi';
import '../styles/RecommendationCard.css';

function RecommendationCard({ recommendations = [] }) {
  const navigate = useNavigate();
  const topRec = recommendations[0] || {
    title: 'Deep Learning & Neural Networks',
    category: 'Artificial Intelligence',
    reason: 'Recommended based on your recent high score in Machine Learning Fundamentals.'
  };

  return (
    <motion.div 
      className="recommendation-card-glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="rec-header">
        <div className="ai-chip">
          <FiCpu className="icon" /> AI Recommendation
        </div>
      </div>

      <h3>{topRec.title}</h3>
      <span className="rec-category-badge">{topRec.category}</span>
      <p>{topRec.reason}</p>

      <motion.button 
        className="explore-course-btn" 
        onClick={() => navigate('/courses')}
        whileHover={{ scale: 1.02, boxShadow: 'var(--glow-blue)' }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Explore Subject</span>
        <FiArrowRight />
      </motion.button>
    </motion.div>
  );
}

export default RecommendationCard;