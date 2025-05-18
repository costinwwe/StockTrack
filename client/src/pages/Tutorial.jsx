import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaBook, FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';
import '../styles/tutorial.scss';

// Helper to convert YouTube URLs to embed format
function getEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:v=|youtu.be\/)([\w-]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?modestbranding=1&rel=0`;
  }
  return url;
}

const Tutorial = () => {
  const [lessons, setLessons] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/lessons');
      setLessons(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load lessons');
      setLoading(false);
    }
  };

  const markLessonCompleted = (lessonId) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
  };

  if (loading) return <div className="loading-state">Loading lessons...</div>;
  if (error) return <div className="error-state">{error}</div>;

  const activeLesson = lessons[activeIdx] || {};

  return (
    <div className="tutorial-container">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`sidebar-toggle ${isSidebarOpen ? 'open' : ''}`}
      >
        {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="header-content">
            <FaBook className="icon" />
            <h2>Course Lessons</h2>
          </div>
          <p>Complete all lessons to master the course content</p>
        </div>

        <div className="lessons-list">
          {lessons.map((lesson, idx) => {
            const isCompleted = completedLessons.has(lesson._id);
            const isActive = idx === activeIdx;
            
            return (
              <div
                key={lesson._id}
                onClick={() => {
                  setActiveIdx(idx);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`lesson-item ${isActive ? 'active' : ''}`}
              >
                <div className="lesson-number">{idx + 1}</div>
                
                <div className="lesson-content">
                  <div className="title">{lesson.title}</div>
                  <div className="type">
                    {lesson.videoUrl ? 'Video Lesson' : 'Text Lesson'}
                  </div>
                </div>

                {isCompleted && (
                  <div className="completed-icon">
                    <FaPlay />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="content-card">
          <h1>{activeLesson.title}</h1>
          
          {activeLesson.videoUrl && (
            <div className="video-container">
              <iframe
                src={getEmbedUrl(activeLesson.videoUrl)}
                title={activeLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          
          <div className="content">
            {activeLesson.content}
          </div>

          <button
            onClick={() => markLessonCompleted(activeLesson._id)}
            className="complete-button"
          >
            <FaPlay /> Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;