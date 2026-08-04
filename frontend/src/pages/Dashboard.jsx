import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import WelcomeBanner from '../components/WelcomeBanner';
import StatsCards from '../components/StatsCards';
import CourseCard from '../components/CourseCard';
import GoalCard from '../components/GoalCard';
import ProgressChart from '../components/ProgressChart';
import RecommendationCard from '../components/RecommendationCard';
import BackgroundMesh from '../components/BackgroundMesh';
import { analyticsService, courseService, userService } from '../services/api';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartRes, coursesRes, goalsRes, recsRes] = await Promise.allSettled([
          analyticsService.getStats(),
          analyticsService.getProgressChart(),
          courseService.getCourses(),
          userService.getGoals(),
          analyticsService.getRecommendations(),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (chartRes.status === 'fulfilled') setChartData(chartRes.value.data);
        if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data);
        if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data);
        if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleToggleGoal = async (goalId) => {
    try {
      const res = await userService.toggleGoal(goalId);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? res.data : g)));
    } catch (err) {
      console.error('Failed to toggle goal:', err);
    }
  };

  const handleAddGoal = async (title) => {
    try {
      const res = await userService.createGoal({ title });
      setGoals((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const activeCourse = courses[0] || {
    id: 1,
    title: 'Machine Learning Fundamentals',
    description: 'Continue your learning journey and complete today\'s lesson.',
    category: 'Artificial Intelligence',
    level: 'Beginner',
    progress_pct: 72,
  };

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
          transition={{ duration: 0.5 }}
        >
          <WelcomeBanner 
            userName={user?.full_name || 'Student'} 
            streakDays={stats?.active_streak_days || 5} 
          />

          <StatsCards stats={stats} />

          <div className="dashboard-grid">
            <div className="main-col">
              <CourseCard 
                course={activeCourse} 
                onContinue={(id) => navigate(`/courses`)} 
              />
              
              <ProgressChart data={chartData} />
            </div>

            <div className="side-col">
              <GoalCard 
                goals={goals} 
                onToggleGoal={handleToggleGoal} 
                onAddGoal={handleAddGoal} 
              />

              <RecommendationCard recommendations={recommendations} />
            </div>
          </div>
        </motion.main>
      </div>
    </>
  );
}

export default Dashboard;