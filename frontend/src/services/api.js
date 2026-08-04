import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, full_name) => api.post('/auth/register', { email, password, full_name }),
  getMe: () => api.get('/auth/me'),
};

// Course Service Endpoints
export const courseService = {
  getCourses: () => api.get('/courses/'),
  getCourseDetails: (id) => api.get(`/courses/${id}`),
  completeLesson: (lessonId) => api.post(`/courses/lessons/${lessonId}/complete`),
};

// AI Companion Chat Service Endpoints
export const aiService = {
  getSessions: () => api.get('/chat/sessions'),
  createSession: (title) => api.post('/chat/sessions', null, { params: { title } }),
  sendMessage: (sessionId, message) => api.post('/chat/message', { session_id: sessionId, message }),
  explainConcept: (concept, depth) => api.post('/chat/explain-concept', { concept, depth }),
  uploadPdf: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getDocuments: () => api.get('/upload/documents'),
  generateLearningPath: (goal, skillLevel) => api.post('/progress/learning-path', { goal, current_skill_level: skillLevel }),
  getMyLearningPaths: () => api.get('/progress/my-paths'),
};

// Quiz Service Endpoints
export const quizService = {
  generateQuiz: (topic, courseId = null) => api.post('/quizzes/generate', null, { params: { topic, course_id: courseId } }),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  submitQuiz: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
  getQuizHistory: () => api.get('/quizzes/history/me'),
};

// Analytics Service Endpoints
export const analyticsService = {
  getStats: () => api.get('/analytics/stats'),
  getProgressChart: () => api.get('/analytics/progress-chart'),
  getRecommendations: () => api.get('/analytics/recommendations'),
};

// User Service Endpoints
export const userService = {
  getGoals: () => api.get('/user/goals'),
  createGoal: (goalData) => api.post('/user/goals', goalData),
  toggleGoal: (goalId) => api.post(`/user/goals/${goalId}/toggle`),
};

export default api;
