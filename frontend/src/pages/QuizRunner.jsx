import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BackgroundMesh from '../components/BackgroundMesh';
import { quizService } from '../services/api';
import { FiCheckSquare, FiAward, FiClock, FiRefreshCw, FiZap } from 'react-icons/fi';
import '../styles/QuizRunner.css';

function QuizRunner() {
  const [topic, setTopic] = useState('Machine Learning & Neural Networks');
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await quizService.getQuizHistory();
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching quiz history:', err);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setQuiz(null);
    setQuizResult(null);
    setUserAnswers({});

    try {
      const res = await quizService.generateQuiz(topic);
      setQuiz(res.data);
    } catch (err) {
      alert('Error generating AI quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    const payloadAnswers = Object.entries(userAnswers).map(([qId, opt]) => ({
      question_id: parseInt(qId),
      selected_option: opt,
    }));

    setSubmitting(true);
    try {
      const res = await quizService.submitQuiz(quiz.id, payloadAnswers);
      setQuizResult(res.data);
      fetchHistory();
    } catch (err) {
      alert('Error submitting quiz.');
    } finally {
      setSubmitting(false);
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
            <h2>📝 Dynamic AI Quiz Generator & Assessment Engine</h2>
            <p>Generate custom quizzes on any topic using Google Gemini and test your knowledge</p>
          </div>

          <div className="quiz-container-layout">
            <div className="quiz-generator-bar glass-panel">
              <form onSubmit={handleGenerateQuiz} className="quiz-topic-form">
                <input 
                  type="text" 
                  placeholder="Enter topic e.g. Transformers, Python Data Structures"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <motion.button 
                  type="submit" 
                  className="generate-btn" 
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? <><FiRefreshCw className="spin" /> Generating Quiz...</> : <><FiZap /> Generate AI Quiz</>}
                </motion.button>
              </form>
            </div>

            {quizResult ? (
              <motion.div 
                className="quiz-result-card glass-panel"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className={`result-header ${quizResult.passed ? 'passed' : 'failed'}`}>
                  <FiAward className="award-icon" />
                  <h2>{quizResult.passed ? 'Congratulations! Quiz Passed' : 'Keep Practicing'}</h2>
                  <div className="score-big">{quizResult.score}%</div>
                  <p>Correct: {quizResult.details.filter(d => d.is_correct).length} / {quizResult.total_questions}</p>
                </div>

                <div className="result-details">
                  <h3>Question Review & Detailed Explanations</h3>
                  {quizResult.details.map((d, idx) => (
                    <div key={idx} className={`review-item ${d.is_correct ? 'correct' : 'wrong'}`}>
                      <h4>Q{idx + 1}. {d.question_text}</h4>
                      <p><strong>Your Answer:</strong> {d.selected_option}</p>
                      <p><strong>Correct Answer:</strong> {d.correct_answer}</p>
                      <p className="explanation">💡 <em>{d.explanation}</em></p>
                    </div>
                  ))}
                </div>

                <button className="primary-btn" onClick={() => setQuizResult(null)}>
                  Take Another Quiz
                </button>
              </motion.div>
            ) : quiz ? (
              <motion.div 
                className="active-quiz-card glass-panel"
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="quiz-meta">
                  <h3>{quiz.title}</h3>
                  <span className="q-count-tag">{quiz.questions.length} Questions</span>
                </div>

                <div className="questions-list">
                  {quiz.questions.map((q, qIdx) => (
                    <div key={q.id} className="question-box-dark">
                      <h4>{qIdx + 1}. {q.question_text}</h4>
                      <div className="options-grid">
                        {q.options.map((opt, oIdx) => (
                          <label 
                            key={oIdx} 
                            className={`option-chip-dark ${userAnswers[q.id] === opt ? 'selected' : ''}`}
                          >
                            <input 
                              type="radio" 
                              name={`question-${q.id}`} 
                              value={opt}
                              checked={userAnswers[q.id] === opt}
                              onChange={() => handleSelectOption(q.id, opt)}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="submit-quiz-btn" 
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(userAnswers).length < quiz.questions.length}
                >
                  {submitting ? 'Evaluating Answers...' : 'Submit Quiz for Grading'}
                </button>
              </motion.div>
            ) : (
              <div className="quiz-history-section">
                <h3><FiClock /> Recent Quiz Performance History</h3>
                <div className="history-grid">
                  {history.length === 0 ? (
                    <p className="no-history-text">No quiz history recorded yet. Enter a topic above to generate your first AI quiz!</p>
                  ) : (
                    history.map((h) => (
                      <div key={h.id} className="history-card-dark glass-panel">
                        <h4>{h.quiz_title}</h4>
                        <div className="history-score">{h.score}%</div>
                        <span className="date">{new Date(h.attempted_at).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.main>
      </div>
    </>
  );
}

export default QuizRunner;
