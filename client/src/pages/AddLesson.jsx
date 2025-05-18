import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialLessons = [
  { id: '1', title: 'Welcome to Stock Track', videoUrl: '', content: 'This is the intro lesson.' },
  { id: '2', title: 'How to Use the Platform', videoUrl: '', content: 'Learn how to use the platform.' },
];

const AddLesson = () => {
  const [lessons, setLessons] = useState(initialLessons);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Handle drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(lessons);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setLessons(reordered);
    // TODO: Call API to save new order
  };

  // Add lesson
  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsAdding(true);
    const newLesson = {
      id: Date.now().toString(),
      title,
      videoUrl,
      content,
    };
    setLessons([...lessons, newLesson]);
    setTitle('');
    setVideoUrl('');
    setContent('');
    setIsAdding(false);
    // TODO: Call API to save lesson
  };

  // Delete lesson
  const handleDeleteLesson = (id) => {
    setLessons(lessons.filter(l => l.id !== id));
    // TODO: Call API to delete lesson
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h2 style={{ color: '#00a651', fontWeight: 700 }}>Hi. Let's learn Stock Track!</h2>
      <p style={{ color: '#555', marginBottom: 32 }}>
        Welcome to the lesson manager. Here you can add, delete, and rearrange lessons for your tutorial. Each lesson can have a title, an optional video, and content. Drag and drop lessons to change their order.
      </p>
      <form onSubmit={handleAddLesson} style={{ background: '#f8f9fa', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ marginTop: 0, color: '#00a651' }}>Add a Lesson</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #dee2e6', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Video URL</label>
          <input
            type="text"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #dee2e6', marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #dee2e6', marginTop: 4 }}
          />
        </div>
        <button
          type="submit"
          disabled={isAdding || !title.trim()}
          style={{ background: '#00a651', color: 'white', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
        >
          {isAdding ? 'Adding...' : 'Add Lesson'}
        </button>
      </form>
      <h3 style={{ color: '#00a651', marginBottom: 16 }}>Lessons</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lessons">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {lessons.map((lesson, idx) => (
                <Draggable key={lesson.id} draggableId={lesson.id} index={idx}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        background: snapshot.isDragging ? '#e6f9ef' : 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: 6,
                        marginBottom: 12,
                        padding: 16,
                        boxShadow: snapshot.isDragging ? '0 4px 16px rgba(0,166,81,0.10)' : '0 1px 4px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        ...provided.draggableProps.style
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#00a651', fontSize: 18 }}>{lesson.title}</div>
                        {lesson.videoUrl && <div style={{ fontSize: 13, color: '#3498db', margin: '4px 0' }}>🎬 {lesson.videoUrl}</div>}
                        <div style={{ fontSize: 14, color: '#555' }}>{lesson.content}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', fontWeight: 500, cursor: 'pointer', marginLeft: 16 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default AddLesson;
