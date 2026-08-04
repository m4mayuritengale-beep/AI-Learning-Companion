import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BackgroundMesh from '../components/BackgroundMesh';
import { aiService } from '../services/api';
import { FiCompass, FiFlag, FiLayers } from 'react-icons/fi';
import '../styles/LearningPath.css';

function LearningPathGenerator() {
  const [goal, setGoal] = useState('Senior AI Architect & Full Stack Engineer');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [currentPath, setCurrentPath] = useState(null);
  const [savedPaths, setSavedPaths] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyPaths();
  }, []);

  const fetchMyPaths = async () => {
    try {
      const res = await aiService.getMyLearningPaths();
      setSavedPaths(res.data);
      if (res.data.length > 0) {
        setCurrentPath(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching learning paths:', err);
    }
  };

  const handleGeneratePath = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    try {
      const res = await aiService.generateLearningPath(goal, skillLevel);
      setCurrentPath(res.data);
      setSavedPaths((prev) => [res.data, ...prev]);
    } catch (err) {
      alert('Error generating personalized learning roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackgroundMesh />
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <motion.main 
          className="dashboard-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="page-header">
            <h2>🗺️ Personalized AI Learning Path Generator</h2>
            <p>Generate step-by-step master roadmaps tailored to your specific career goals and skill level</p>
          </div>

          <div className="learning-path-layout">
            <div className="generator-card glass-panel">
              <h3><FiCompass /> Build New Roadmap</h3>
              <form onSubmit={handleGeneratePath} className="lp-form">
                <div className="form-group">
                  <label>Target Career Goal or Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Master LLMs & AI Systems"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current Skill Level</label>
                  <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                    <option value="Beginner">Beginner (Starting from scratch)</option>
                    <option value="Intermediate">Intermediate (Have fundamental knowledge)</option>
                    <option value="Advanced">Advanced (Seeking specialization)</option>
                  </select>
                </div>

                <motion.button 
                  type="submit" 
                  className="generate-lp-btn" 
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Designing Roadmap with AI...' : 'Generate AI Learning Roadmap'}
                </motion.button>
              </form>

              <div className="saved-paths-list">
                <h4>My Saved Roadmaps ({savedPaths.length})</h4>
                <ul>
                  {savedPaths.map((p) => (
                    <li 
                      key={p.id} 
                      className={currentPath?.id === p.id ? 'active' : ''}
                      onClick={() => setCurrentPath(p)}
                    >
                      <FiFlag />
                      <span>{p.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="roadmap-display-card glass-panel">
              {currentPath ? (
                <>
                  <div className="roadmap-header">
                    <h3>{currentPath.title}</h3>
                    <p><strong>Goal Target:</strong> {currentPath.goal}</p>
                  </div>

                  <div className="roadmap-timeline">
                    {currentPath.steps.map((step) => (
                      <div key={step.step_number} className="timeline-step">
                        <div className="step-badge">Phase {step.step_number}</div>
                        <div className="step-card-dark">
                          <h4>{step.title}</h4>
                          <p>{step.description}</p>
                          <div className="step-meta">
                            <span>⏱️ Est. Time: {step.estimated_weeks} Weeks</span>
                          </div>
                          <div className="topics-tags">
                            {step.topics.map((t, idx) => (
                              <span key={idx} className="topic-tag">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-roadmap-state">
                  <FiLayers className="empty-icon" />
                  <p>Enter your goal above to generate your customized step-by-step learning roadmap.</p>
                </div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </>
  );
}

export default LearningPathGenerator;
