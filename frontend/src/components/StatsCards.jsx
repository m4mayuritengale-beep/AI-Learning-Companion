import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiTrendingUp, FiCheckCircle, FiZap, FiActivity } from 'react-icons/fi';
import '../styles/StatsCards.css';

function StatsCards({ stats }) {
  const cards = [
    { title: 'Courses Enrolled', value: stats?.total_courses || 4, unit: 'Active Subjects', color: '#3b82f6', icon: <FiBookOpen /> },
    { title: 'Learning Progress', value: `${stats?.avg_progress || 72}%`, unit: 'Overall Completion', color: '#10b981', icon: <FiTrendingUp /> },
    { title: 'Avg Quiz Accuracy', value: `${stats?.avg_quiz_score || 88.5}%`, unit: 'Mastery Level', color: '#f59e0b', icon: <FiCheckCircle /> },
    { title: 'AI Mastery Score', value: stats?.ai_score || 94, unit: 'Out of 100', color: '#8b5cf6', icon: <FiZap /> },
  ];

  return (
    <div className="stats-cards-wrapper">
      <div className="ai-system-status-bar">
        <div className="status-indicator">
          <span className="live-dot"></span>
          <span className="status-text">AI Companion Engine Operational</span>
        </div>
        <div className="momentum-indicator">
          <FiActivity className="icon" /> High Learning Momentum (+14% this week)
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card, idx) => (
          <motion.div 
            className="stat-card-glass" 
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, boxShadow: `0 12px 30px ${card.color}25` }}
          >
            <div className="stat-card-top">
              <div className="stat-icon-badge" style={{ background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
              <span className="stat-metric-pill" style={{ color: card.color }}>Live Sync</span>
            </div>

            <h2 style={{ color: card.color }}>{card.value}</h2>
            <h3>{card.title}</h3>
            <p>{card.unit}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default StatsCards;