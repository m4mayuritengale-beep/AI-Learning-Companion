import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import AiTutorChat from './pages/AiTutorChat';
import PdfSummarizer from './pages/PdfSummarizer';
import QuizRunner from './pages/QuizRunner';
import LearningPathGenerator from './pages/LearningPathGenerator';
import AnalyticsView from './pages/AnalyticsView';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading application...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/ai-tutor" element={<ProtectedRoute><AiTutorChat /></ProtectedRoute>} />
            <Route path="/pdf-summarizer" element={<ProtectedRoute><PdfSummarizer /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizRunner /></ProtectedRoute>} />
            <Route path="/learning-path" element={<ProtectedRoute><LearningPathGenerator /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsView /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;