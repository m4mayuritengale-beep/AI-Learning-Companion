import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';
import '../styles/CourseCard.css';

function CourseCard({ course, onContinue }) {
  if (!course) return null;

  return (
    <motion.div 
      className="course-card-glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="course-card-header">
        <div className="category-tag">
          <FiBookOpen className="icon" /> {course.category || 'AI & Machine Learning'}
        </div>
        <span className="level-badge">{course.level || 'Intermediate'}</span>
      </div>

      <h2>{course.title}</h2>
      <p>{course.description}</p>

      <div className="progress-container">
        <div className="progress-meta">
          <span>Overall Course Progress</span>
          <span className="pct-text">{course.progress_pct || 0}%</span>
        </div>
        <div className="progress-bar-track">
          <motion.div 
            className="progress-bar-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${course.progress_pct || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          ></motion.div>
        </div>
      </div>

      <div className="course-card-footer">
        <motion.button 
          className="continue-course-btn" 
          onClick={() => onContinue(course.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Continue Lesson</span>
          <FiArrowRight />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default CourseCard;