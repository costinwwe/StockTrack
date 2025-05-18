const Element = require('../models/Element');
const Project = require('../models/Project');

// @desc    Get all elements for a project
// @route   GET /api/projects/:projectId/elements
// @access  Private
exports.getElements = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized'
      });
    }
    
    // Get all elements for this project
    const elements = await Element.find({ projectId });
    
    res.status(200).json({
      success: true,
      count: elements.length,
      data: elements
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get a single element
// @route   GET /api/elements/:id
// @access  Private
exports.getElement = async (req, res) => {
  try {
    const element = await Element.findById(req.params.id);
    
    if (!element) {
      return res.status(404).json({
        success: false,
        error: 'Element not found'
      });
    }
    
    // Check if element belongs to user's project
    const project = await Project.findOne({
      _id: element.projectId,
      user: req.user._id
    });
    
    if (!project) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      data: element
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new element
// @route   POST /api/projects/:projectId/elements
// @access  Private
exports.createElement = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      user: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized'
      });
    }
    
    // Create element
    const element = await Element.create({
      ...req.body,
      projectId
    });
    
    res.status(201).json({
      success: true,
      data: element
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update element
// @route   PUT /api/elements/:id
// @access  Private
exports.updateElement = async (req, res) => {
  try {
    let element = await Element.findById(req.params.id);
    
    if (!element) {
      return res.status(404).json({
        success: false,
        error: 'Element not found'
      });
    }
    
    // Check if element belongs to user's project
    const project = await Project.findOne({
      _id: element.projectId,
      user: req.user._id
    });
    
    if (!project) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Update element
    element = await Element.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: element
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete element
// @route   DELETE /api/elements/:id
// @access  Private
exports.deleteElement = async (req, res) => {
  try {
    const element = await Element.findById(req.params.id);
    
    if (!element) {
      return res.status(404).json({
        success: false,
        error: 'Element not found'
      });
    }
    
    // Check if element belongs to user's project
    const project = await Project.findOne({
      _id: element.projectId,
      user: req.user._id
    });
    
    if (!project) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Delete element
    await element.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};