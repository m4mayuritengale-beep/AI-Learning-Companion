import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BackgroundMesh from '../components/BackgroundMesh';
import { aiService } from '../services/api';
import { FiSend, FiPlus, FiMessageSquare, FiHelpCircle, FiCpu, FiCopy, FiCheck } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import '../styles/AiTutorChat.css';

function AiTutorChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [concept, setConcept] = useState('');
  const [conceptDepth, setConceptDepth] = useState('beginner');
  const [explanationResult, setExplanationResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchSessions = async () => {
    try {
      const res = await aiService.getSessions();
      setSessions(res.data);
      if (res.data.length > 0) {
        selectSession(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const selectSession = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
  };

  const handleNewSession = async () => {
    try {
      const res = await aiService.createSession('New Study Session');
      setSessions((prev) => [res.data, ...prev]);
      selectSession(res.data);
    } catch (err) {
      console.error('Error creating chat session:', err);
    }
  };

  const handleSendMessage = async (e, textToSend = null) => {
    if (e) e.preventDefault();
    const userText = textToSend || inputMessage;
    if (!userText.trim() || loading) return;

    setInputMessage('');
    
    // Optimistic UI update
    const tempUserMsg = { id: Date.now(), sender: 'user', message: userText, created_at: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await aiService.sendMessage(currentSessionId, userText);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', message: 'Sorry, I encountered an error responding to your request.', created_at: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setExplanationResult('Analyzing concept with Socratic Engine...');
    try {
      const res = await aiService.explainConcept(concept, conceptDepth);
      setExplanationResult(res.data.explanation);
    } catch (err) {
      setExplanationResult('Error generating explanation.');
    }
  };

  const suggestedPrompts = [
    "Explain Gradient Descent with an analogy",
    "How does Transformer self-attention work?",
    "What is the difference between CNN and RNN?",
    "Generate a study outline for Neural Networks"
  ];

  return (
    <>
      <BackgroundMesh />
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <motion.main 
          className="dashboard-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="page-header">
            <h2>🤖 Socratic AI Study Companion</h2>
            <p>Interactive multi-turn AI study session powered by Gemini 1.5 Pro</p>
          </div>

          <div className="chat-layout">
            <div className="chat-sessions-sidebar glass-panel">
              <motion.button 
                className="new-chat-btn" 
                onClick={handleNewSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiPlus /> New Study Session
              </motion.button>

              <div className="session-list">
                <h4>Recent Conversations</h4>
                {sessions.map((s) => (
                  <div 
                    key={s.id} 
                    className={`session-card ${currentSessionId === s.id ? 'active' : ''}`}
                    onClick={() => selectSession(s)}
                  >
                    <FiMessageSquare className="icon" />
                    <span>{s.title}</span>
                  </div>
                ))}
              </div>

              <div className="explain-tool-box">
                <h4><FiHelpCircle /> Concept Simplifier</h4>
                <form onSubmit={handleExplainConcept}>
                  <input 
                    type="text" 
                    placeholder="e.g. Backpropagation"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                  />
                  <select value={conceptDepth} onChange={(e) => setConceptDepth(e.target.value)}>
                    <option value="beginner">Beginner Level</option>
                    <option value="intermediate">Intermediate Level</option>
                    <option value="advanced">Advanced Level</option>
                  </select>
                  <button type="submit">Simplify</button>
                </form>
                {explanationResult && (
                  <div className="explain-output">{explanationResult}</div>
                )}
              </div>
            </div>

            <div className="chat-main-window glass-panel">
              <div className="messages-body">
                {messages.length === 0 ? (
                  <div className="empty-chat-state">
                    <div className="ai-chat-orb">
                      <HiOutlineSparkles />
                    </div>
                    <h3>Socratic AI Tutor Ready</h3>
                    <p>Ask a question or select a suggested prompt to begin your personalized study session:</p>
                    
                    <div className="prompt-chips-grid">
                      {suggestedPrompts.map((p, idx) => (
                        <button 
                          key={idx} 
                          className="prompt-chip"
                          onClick={(e) => handleSendMessage(e, p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <motion.div 
                      key={idx} 
                      className={`message-bubble ${m.sender}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bubble-header">
                        <span className="message-sender">
                          {m.sender === 'user' ? 'You' : '🤖 AI Socratic Tutor'}
                        </span>
                        {m.sender === 'ai' && (
                          <button 
                            className="copy-btn" 
                            onClick={() => handleCopy(m.message, idx)} 
                            title="Copy Response"
                          >
                            {copiedId === idx ? <FiCheck style={{ color: '#10b981' }} /> : <FiCopy />}
                          </button>
                        )}
                      </div>
                      <div className="message-text">{m.message}</div>
                    </motion.div>
                  ))
                )}
                {loading && (
                  <div className="message-bubble ai loading">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-bar">
                <input 
                  type="text" 
                  placeholder="Ask AI tutor a question or type a concept..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
                <motion.button 
                  type="submit" 
                  disabled={loading || !inputMessage.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSend /> Send
                </motion.button>
              </form>
            </div>
          </div>
        </motion.main>
      </div>
    </>
  );
}

export default AiTutorChat;
