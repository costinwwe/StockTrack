// controllers/blogController.js
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Blog = require('../models/Blog');
const path = require('path');
const fs = require('fs');

// @desc    Create a new blog post
// @route   POST /api/blog
// @access  Private/Admin
exports.createBlogPost = asyncHandler(async (req, res, next) => {
  console.log('Create blog post request:', req.body);
  console.log('Current user:', req.user?.id);
  
  // Check if user is admin
  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return next(
      new ErrorResponse('You are not authorized to create blog posts', 403)
    );
  }

  // Process cover image if uploaded
  let coverImagePath = null;
  if (req.files && req.files.coverImage) {
    const file = req.files.coverImage;
    
    console.log('Uploaded file:', file.name);

    // Validate file type
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return next(new ErrorResponse('Image size should be less than 5MB', 400));
    }

    // Create custom filename
    file.name = `blog_${Date.now()}${path.parse(file.name).ext}`;
    const filePath = path.join(__dirname, '../public/uploads/blog', file.name);
    
    // Move file to uploads directory
    try {
      await file.mv(filePath);
      coverImagePath = `/uploads/blog/${file.name}`;
      console.log('File saved to:', filePath);
    } catch (err) {
      console.error('File upload error:', err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }
  }

  // Handle tags if provided as JSON string
  let tags = [];
  if (req.body.tags) {
    try {
      if (typeof req.body.tags === 'string') {
        tags = JSON.parse(req.body.tags);
      } else {
        tags = req.body.tags;
      }
    } catch (err) {
      // If not valid JSON, assume it's a comma-separated string
      tags = req.body.tags.split(',').map(tag => tag.trim());
    }
  }

  // Create blog post
  try {
    const blog = await Blog.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: tags,
      author: req.user.id,
      coverImage: coverImagePath
    });
    
    console.log('Blog created successfully:', blog._id);

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (err) {
    console.error('Blog creation error:', err);
    return next(new ErrorResponse(err.message, 500));
  }
});

// @desc    Get all blog posts
// @route   GET /api/blog
// @access  Public
exports.getBlogPosts = asyncHandler(async (req, res, next) => {
  // Simple implementation for testing
  const blogs = await Blog.find()
    .populate({
      path: 'author',
      select: 'name'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

// @desc    Get single blog post
// @route   GET /api/blog/:id
// @access  Public
exports.getBlogPost = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate({
    path: 'author',
    select: 'name'
  });

  if (!blog) {
    return next(
      new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404)
    );
  }

  // Increment view count
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Private/Admin
exports.updateBlogPost = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is admin
  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return next(
      new ErrorResponse('You are not authorized to update blog posts', 403)
    );
  }

  // Update blog post
  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: blog
  });
});

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Private/Admin
exports.deleteBlogPost = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is admin
  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return next(
      new ErrorResponse('You are not authorized to delete blog posts', 403)
    );
  }

  // Remove blog post
  await Blog.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get blog categories
// @route   GET /api/blog/categories
// @access  Public
exports.getBlogCategories = asyncHandler(async (req, res, next) => {
  const categories = await Blog.distinct('category');

  res.status(200).json({
    success: true,
    count: categories.length,
    categories: categories.filter(cat => cat) // Filter out empty categories
  });
});

// @desc    Get related blog posts
// @route   GET /api/blog/related/:category
// @access  Public
exports.getRelatedPosts = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const { exclude } = req.query;

  const query = {
    category,
    published: true
  };

  // Exclude current post if provided
  if (exclude) {
    query._id = { $ne: exclude };
  }

  const relatedPosts = await Blog.find(query)
    .select('title coverImage createdAt slug')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    success: true,
    count: relatedPosts.length,
    data: relatedPosts
  });
});

// @desc    Like/unlike a blog post
// @route   POST /api/blog/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user already liked this post
  const alreadyLiked = blog.likes && blog.likes.includes(req.user.id);
  
  if (alreadyLiked) {
    // Unlike the post
    blog.likes = blog.likes.filter(userId => userId.toString() !== req.user.id);
  } else {
    // Like the post
    if (!blog.likes) blog.likes = [];
    blog.likes.push(req.user.id);
  }
  
  await blog.save();

  res.status(200).json({
    success: true,
    isLiked: !alreadyLiked,
    likes: blog.likes.length
  });
});

// @desc    Add comment to blog post
// @route   POST /api/blog/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404)
    );
  }

  // Validate comment content
  if (!req.body.content || !req.body.content.trim()) {
    return next(
      new ErrorResponse('Comment content is required', 400)
    );
  }

  // Create new comment
  const newComment = {
    content: req.body.content.trim(),
    user: req.user.id,
    createdAt: Date.now()
  };

  // Add to comments array
  if (!blog.comments) blog.comments = [];
  blog.comments.unshift(newComment);
  await blog.save();

  // Populate user info
  const populatedBlog = await Blog.findById(req.params.id).populate({
    path: 'comments.user',
    select: 'name avatar'
  });

  // Return only the new comment
  const comment = populatedBlog.comments[0];

  res.status(201).json({
    success: true,
    data: comment
  });
});

// @desc    Get comments for a blog post
// @route   GET /api/blog/:id/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate({
    path: 'comments.user',
    select: 'name avatar'
  }).populate({
    path: 'comments.replies.user',
    select: 'name avatar'
  });

  if (!blog) {
    return next(
      new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: blog.comments ? blog.comments.length : 0,
    data: blog.comments || []
  });
});

// @desc    Add reply to comment
// @route   POST /api/blog/:id/comments/:commentId/replies
// @access  Private
exports.addReply = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog post not found with id of ${req.params.id}`, 404)
    );
  }

  // Find the comment
  if (!blog.comments) {
    return next(
      new ErrorResponse(`No comments found for this post`, 404)
    );
  }
  
  const comment = blog.comments.id(req.params.commentId);
  
  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.commentId}`, 404)
    );
  }

  // Validate reply content
  if (!req.body.content || !req.body.content.trim()) {
    return next(
      new ErrorResponse('Reply content is required', 400)
    );
  }

  // Create new reply
  const newReply = {
    content: req.body.content.trim(),
    user: req.user.id,
    createdAt: Date.now()
  };

  // Add to replies array
  if (!comment.replies) comment.replies = [];
  comment.replies.push(newReply);
  await blog.save();

  res.status(201).json({
    success: true,
    data: newReply
  });
});