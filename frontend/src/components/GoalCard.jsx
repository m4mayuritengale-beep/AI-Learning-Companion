import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiPlus, FiCheck } from 'react-icons/fi';
import '../styles/GoalCard.css';

function GoalCard({ goals = [], onToggleGoal, onAddGoal }) {
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newGoalTitle.trim()) {
      onAddGoal(newGoalTitle);
      setNewGoalTitle('');
    }
  };

  const completedCount = goals.filter(g => g.is_completed).length;

  return (
    <motion.div 
      className="goal-card-glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="goal-card-header">
        <div className="title-with-icon">
          <FiTarget className="target-icon" />
          <h2>Daily Study Goals</h2>
        </div>
        <span className="goal-status-badge">{completedCount} / {goals.length} Done</span>
      </div>

      <form onSubmit={handleSubmit} className="add-goal-input-group">
        <input 
          type="text"
          placeholder="Set a new study target..."
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
        />
        <button type="submit" disabled={!newGoalTitle.trim()}>
          <FiPlus />
        </button>
      </form>

      <ul className="goal-items-list">
        <AnimatePresence>
          {goals.length === 0 ? (
            <li className="empty-goal-item">No active goals. Add your target above!</li>
          ) : (
            goals.map((g) => (
              <motion.li 
                key={g.id} 
                className={`goal-checkbox-item ${g.is_completed ? 'completed' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => onToggleGoal(g.id)}
              >
                <div className={`checkbox-custom ${g.is_completed ? 'checked' : ''}`}>
                  {g.is_completed && <FiCheck />}
                </div>
                <span>{g.title}</span>
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}

export default GoalCard;