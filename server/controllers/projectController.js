// controllers/projectController.js
const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res, next) => {
  // Add owner to req.body
  req.body.owner = req.user.id;
  
  // Create project with default empty table
  const project = await Project.create({
    ...req.body,
    tables: [{
      name: 'Table 1',
      columns: [
        { name: 'Column 1', type: 'text' },
        { name: 'Column 2', type: 'text' },
        { name: 'Column 3', type: 'text' }
      ],
      rows: [{ cells: [] }]
    }]
  });

  // Add project to user's projects array
  await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { projects: project._id } },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ owner: req.user.id });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  // VALIDATION: Check if ID exists and is valid
  if (!req.params.id || req.params.id === 'undefined') {
    return next(
      new ErrorResponse(`Invalid project ID`, 400)
    );
  }

  // Check if ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(
      new ErrorResponse(`Invalid project ID format`, 400)
    );
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the project or is a collaborator
  if (project.owner.toString() !== req.user.id && 
      !project.collaborators.some(collab => collab.toString() === req.user.id)) {
    return next(
      new ErrorResponse(`User not authorized to access this project`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res, next) => {
  // VALIDATION: Check if ID exists and is valid
  if (!req.params.id || req.params.id === 'undefined') {
    return next(
      new ErrorResponse(`Invalid project ID`, 400)
    );
  }

  // Check if ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(
      new ErrorResponse(`Invalid project ID format`, 400)
    );
  }

  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the project
  if (project.owner.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to update this project`, 401)
    );
  }

  // Update lastModified
  req.body.lastModified = Date.now();

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res, next) => {
  // VALIDATION: Check if ID exists and is valid
  if (!req.params.id || req.params.id === 'undefined') {
    return next(
      new ErrorResponse(`Invalid project ID`, 400)
    );
  }

  // Check if ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(
      new ErrorResponse(`Invalid project ID format`, 400)
    );
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the project
  if (project.owner.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to delete this project`, 401)
    );
  }

  await project.deleteOne(); // Using deleteOne instead of remove() which is deprecated

  // Remove project from user's projects array
  await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { projects: req.params.id } }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});