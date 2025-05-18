const express = require('express');
const router = express.Router();
const { 
  getElement, 
  updateElement, 
  deleteElement 
} = require('../controllers/elementController');
const { protect } = require('../middleware/auth');

// Routes for direct element access
// GET /api/elements/:id
// PUT /api/elements/:id
// DELETE /api/elements/:id
router.route('/:id')
  .get(protect, getElement)
  .put(protect, updateElement)
  .delete(protect, deleteElement);

// Export router to be used in other files
module.exports = router;