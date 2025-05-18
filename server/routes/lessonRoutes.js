const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

// Test route
router.get('/test', (req, res) => res.send('Lesson route works!'));

// Get all lessons (ordered)
router.get('/', lessonController.getLessons);

// Add lesson
router.post('/', lessonController.addLesson);

// Update lesson
router.put('/:id', lessonController.updateLesson);

// Delete lesson
router.delete('/:id', lessonController.deleteLesson);

// Reorder lessons
router.patch('/reorder', lessonController.reorderLessons);

module.exports = router; 