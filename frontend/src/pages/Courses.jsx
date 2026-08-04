import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BackgroundMesh from '../components/BackgroundMesh';
import { courseService } from '../services/api';
import { FiBook, FiCheckCircle, FiClock, FiPlay } from 'react-icons/fi';
import '../styles/Courses.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getCourses();
      setCourses(res.data);
      if (res.data.length > 0) {
        loadCourseDetail(res.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetail = async (id) => {
    try {
      const res = await courseService.getCourseDetails(id);
      setSelectedCourse(res.data);
      if (res.data.lessons && res.data.lessons.length > 0) {
        setSelectedLesson(res.data.lessons[0]);
      }
    } catch (err) {
      console.error('Error fetching course detail:', err);
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      await courseService.completeLesson(lessonId);
      if (selectedCourse) {
        loadCourseDetail(selectedCourse.id);
      }
    } catch (err) {
      console.error('Error completing lesson:', err);
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
            <h2>📚 Course Catalog & Lesson Reader</h2>
            <p>Explore structured AI courses and complete interactive modules</p>
          </div>

          <div className="courses-layout">
            <div className="course-list-sidebar glass-panel">
              <h3>Available Courses</h3>
              {courses.map((c) => (
                <div 
                  key={c.id} 
                  className={`course-item-card ${selectedCourse?.id === c.id ? 'active' : ''}`}
                  onClick={() => loadCourseDetail(c.id)}
                >
                  <span className="badge">{c.category}</span>
                  <h4>{c.title}</h4>
                  <div className="progress-mini">
                    <div className="progress-fill" style={{ width: `${c.progress_pct || 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lesson-main-content glass-panel">
              {selectedCourse ? (
                <>
                  <div className="course-banner-detail">
                    <h2>{selectedCourse.title}</h2>
                    <p>{selectedCourse.description}</p>
                    <span className="level-chip">{selectedCourse.level} Level</span>
                  </div>

                  <div className="lessons-container">
                    <div className="lessons-sidebar">
                      <h4>Lesson Modules</h4>
                      <ul>
                        {selectedCourse.lessons.map((l) => (
                          <li 
                            key={l.id} 
                            className={selectedLesson?.id === l.id ? 'active' : ''}
                            onClick={() => setSelectedLesson(l)}
                          >
                            <FiBook className="icon" />
                            <span>{l.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lesson-viewer">
                      {selectedLesson ? (
                        <>
                          <div className="lesson-header">
                            <h3>{selectedLesson.title}</h3>
                            <span className="duration"><FiClock /> {selectedLesson.duration_mins} mins</span>
                          </div>
                          <div className="lesson-body">
                            <p>{selectedLesson.content}</p>
                          </div>
                          <button 
                            className="complete-btn" 
                            onClick={() => handleCompleteLesson(selectedLesson.id)}
                          >
                            <FiCheckCircle /> Mark Lesson Completed
                          </button>
                        </>
                      ) : (
                        <p>Select a lesson from the module list to read.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="loading-box">Loading course details...</div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </>
  );
}

export default Courses;
