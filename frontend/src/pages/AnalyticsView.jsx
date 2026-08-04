import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import ProgressChart from '../components/ProgressChart';
import RecommendationCard from '../components/RecommendationCard';
import BackgroundMesh from '../components/BackgroundMesh';
import { analyticsService } from '../services/api';

function AnalyticsView() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, chartRes, recsRes] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getProgressChart(),
        analyticsService.getRecommendations(),
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setRecommendations(recsRes.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
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
            <h2>📊 Learning Analytics & Mastery Insights</h2>
            <p>Track your weekly performance, quiz accuracy trends, and AI score metrics</p>
          </div>

          <StatsCards stats={stats} />

          <div className="dashboard-grid" style={{ marginTop: '24px' }}>
            <div className="main-col">
              <ProgressChart data={chartData} />
            </div>
            <div className="side-col">
              <RecommendationCard recommendations={recommendations} />
            </div>
          </div>
        </motion.main>
      </div>
    </>
  );
}

export default AnalyticsView;
