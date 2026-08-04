import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';
import '../styles/ProgressChart.css';

function ProgressChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { day: 'Mon', study_hours: 1.5, quiz_score: 78.0 },
    { day: 'Tue', study_hours: 2.0, quiz_score: 85.0 },
    { day: 'Wed', study_hours: 3.2, quiz_score: 92.0 },
    { day: 'Thu', study_hours: 2.5, quiz_score: 88.0 },
    { day: 'Fri', study_hours: 4.0, quiz_score: 95.0 },
    { day: 'Sat', study_hours: 3.5, quiz_score: 91.0 },
    { day: 'Sun', study_hours: 2.8, quiz_score: 94.0 },
  ];

  return (
    <motion.div 
      className="progress-chart-glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="chart-glass-header">
        <div className="chart-title">
          <FiTrendingUp className="icon" />
          <h2>Weekly Learning Analytics</h2>
        </div>
        <div className="chart-legend-dark">
          <span className="legend-chip hours"><span className="dot"></span> Study Hours</span>
          <span className="legend-chip quiz"><span className="dot"></span> Quiz Accuracy %</span>
        </div>
      </div>

      <div className="chart-container-dark">
        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
            <Tooltip 
              contentStyle={{ 
                background: '#111827', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                color: '#fff' 
              }}
            />
            <Area type="monotone" dataKey="study_hours" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" name="Hours Spent" />
            <Area type="monotone" dataKey="quiz_score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorQuiz)" name="Quiz Score %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default ProgressChart;