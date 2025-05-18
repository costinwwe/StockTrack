const express = require('express');
const router = express.Router({ mergeParams: true });
const { 
  getElements, 
  getElement, 
  createElement, 
  updateElement, 
  deleteElement 
} = require('../controllers/elementController');
const { protect } = require('../middleware/auth');

// Routes mounted from other routers
// GET /api/projects/:projectId/elements
// POST /api/projects/:projectId/elements
router.route('/')
  .get(protect, getElements)
  .post(protect, createElement);

// Export router to be used in other files
module.exports = router;