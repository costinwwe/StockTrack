// routes/blog.js
const express = require('express');
const router = express.Router();
const {
  createBlogPost,
  getBlogPosts,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogCategories,
  getRelatedPosts,
  toggleLike,
  addComment,
  getComments,
  addReply
} = require('../controllers/blogController');

const { protect, authorize } = require('../middleware/auth');

// Important: Order matters in Express routes!
// Put the specific routes before the parameterized ones

// Blog categories route
router.get('/categories', getBlogCategories);

// Related posts route
router.get('/related/:category', getRelatedPosts);

// Social feature routes
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.post('/:id/comments/:commentId/replies', protect, addReply);

// Blog post routes
router.route('/')
  .get(getBlogPosts)
  .post(protect, createBlogPost);

router.route('/:id')
  .get(getBlogPost)
  .put(protect, updateBlogPost)
  .delete(protect, deleteBlogPost);

module.exports = router;