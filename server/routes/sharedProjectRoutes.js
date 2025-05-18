const express = require('express');
const router = express.Router();
const {
  shareProject,
  getSharedProjects,
  getSharedProject,
  updateSharedProject,
  addComment,
  removeSharing
} = require('../controllers/sharedProjectController');
const { protect } = require('../middleware/auth');

// Get all shared projects
router.route('/')
  .get(protect, getSharedProjects);

// Shared project routes by ID
router.route('/:id')
  .get(protect, getSharedProject)
  .put(protect, updateSharedProject)
  .delete(protect, removeSharing);

// Comment routes
router.route('/:id/comments')
  .post(protect, addComment);

module.exports = router;
