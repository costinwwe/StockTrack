// backend/controllers/sharedProjectController.js
const Project = require('../models/Project');
const Team = require('../models/Team');
const SharedProject = require('../models/SharedProject');

// @desc    Share a project with a team
// @route   POST /api/projects/:id/share
// @access  Private
exports.shareProject = async (req, res) => {
  try {
    const { teamId, accessLevel } = req.body;
    
    // Check if project exists and user owns it
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Verify user owns the project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only share projects you own'
      });
    }
    
    // Check if team exists and user is a member
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    if (!team.isMember(req.user.id) && !team.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member of the team to share projects with it'
      });
    }
    
    // Check if project is already shared with this team
    const existingShare = await SharedProject.findOne({
      project: project._id,
      team: team._id
    });
    
    if (existingShare) {
      return res.status(400).json({
        success: false,
        error: 'Project is already shared with this team'
      });
    }
    
    // Create shared project entry
    const sharedProject = await SharedProject.create({
      project: project._id,
      owner: req.user.id,
      team: team._id,
      accessLevel: accessLevel || 'view',
      sharedWith: team.members
        .filter(member => member.user.toString() !== req.user.id)
        .map(member => ({
          user: member.user,
          accessLevel: accessLevel || 'view'
        }))
    });
    
    // Add project to team's shared projects
    team.sharedProjects.push({
      project: project._id,
      sharedBy: req.user.id,
      accessLevel: accessLevel || 'view'
    });
    
    await team.save();
    
    // Populate the response
    await sharedProject.populate('project', 'name description');
    await sharedProject.populate('owner', 'name email');
    await sharedProject.populate('team', 'name');
    await sharedProject.populate('sharedWith.user', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      data: sharedProject
    });
  } catch (err) {
    console.error('Error sharing project:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to share project'
    });
  }
};

// @desc    Get all shared projects for user
// @route   GET /api/shared-projects
// @access  Private
exports.getSharedProjects = async (req, res) => {
  try {
    // Find all shared projects where user is either owner or in sharedWith
    const sharedProjects = await SharedProject.find({
      $or: [
        { owner: req.user.id },
        { 'sharedWith.user': req.user.id }
      ]
    })
      .populate('project', 'name description createdAt updatedAt')
      .populate('owner', 'name email profileImage')
      .populate('team', 'name')
      .sort('-sharedAt');
    
    res.status(200).json({
      success: true,
      count: sharedProjects.length,
      data: sharedProjects
    });
  } catch (err) {
    console.error('Error getting shared projects:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get shared projects'
    });
  }
};

// @desc    Get a single shared project
// @route   GET /api/shared-projects/:id
// @access  Private
exports.getSharedProject = async (req, res) => {
  try {
    // Find shared project by ID
    const sharedProject = await SharedProject.findById(req.params.id)
      .populate('project')
      .populate('owner', 'name email profileImage')
      .populate('team', 'name')
      .populate('sharedWith.user', 'name email profileImage')
      .populate('comments.user', 'name email profileImage');
    
    if (!sharedProject) {
      return res.status(404).json({
        success: false,
        error: 'Shared project not found'
      });
    }
    
    // Check if user has access
    if (!sharedProject.canUserAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this shared project'
      });
    }
    
    // Update view history
    const viewIndex = sharedProject.views.findIndex(
      view => view.user.toString() === req.user.id
    );
    
    if (viewIndex > -1) {
      // Update existing view timestamp
      sharedProject.views[viewIndex].lastViewed = Date.now();
    } else {
      // Add new view entry
      sharedProject.views.push({
        user: req.user.id,
        lastViewed: Date.now()
      });
    }
    
    await sharedProject.save();
    
    res.status(200).json({
      success: true,
      data: sharedProject
    });
  } catch (err) {
    console.error('Error getting shared project:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get shared project'
    });
  }
};

// @desc    Update shared project access
// @route   PUT /api/shared-projects/:id
// @access  Private
exports.updateSharedProject = async (req, res) => {
  try {
    const { accessLevel } = req.body;
    
    // Find shared project
    let sharedProject = await SharedProject.findById(req.params.id);
    
    if (!sharedProject) {
      return res.status(404).json({
        success: false,
        error: 'Shared project not found'
      });
    }
    
    // Only the owner can update access settings
    if (sharedProject.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can update sharing settings'
      });
    }
    
    // Update access level
    sharedProject = await SharedProject.findByIdAndUpdate(
      req.params.id,
      { accessLevel },
      { new: true, runValidators: true }
    )
      .populate('project', 'name description')
      .populate('owner', 'name email profileImage')
      .populate('team', 'name')
      .populate('sharedWith.user', 'name email profileImage');
    
    // Also update all sharedWith entries
    await SharedProject.updateMany(
      { _id: req.params.id },
      { $set: { "sharedWith.$[].accessLevel": accessLevel } }
    );
    
    res.status(200).json({
      success: true,
      data: sharedProject
    });
  } catch (err) {
    console.error('Error updating shared project:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update shared project'
    });
  }
};

// @desc    Add comment to shared project
// @route   POST /api/shared-projects/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    // Find shared project
    const sharedProject = await SharedProject.findById(req.params.id);
    
    if (!sharedProject) {
      return res.status(404).json({
        success: false,
        error: 'Shared project not found'
      });
    }
    
    // Check if user has access
    if (!sharedProject.canUserAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this shared project'
      });
    }
    
    // Check if user has comment access
    const accessLevel = sharedProject.getUserAccessLevel(req.user.id);
    if (accessLevel === 'view') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to comment on this project'
      });
    }
    
    // Add comment
    sharedProject.comments.push({
      user: req.user.id,
      text
    });
    
    await sharedProject.save();
    
    // Populate the newly added comment
    await sharedProject.populate('comments.user', 'name email profileImage');
    
    // Get only the latest comment
    const newComment = sharedProject.comments[sharedProject.comments.length - 1];
    
    res.status(200).json({
      success: true,
      data: newComment
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    });
  }
};

// @desc    Remove sharing for a project
// @route   DELETE /api/shared-projects/:id
// @access  Private
exports.removeSharing = async (req, res) => {
  try {
    // Find shared project
    const sharedProject = await SharedProject.findById(req.params.id);
    
    if (!sharedProject) {
      return res.status(404).json({
        success: false,
        error: 'Shared project not found'
      });
    }
    
    // Only the owner can remove sharing
    if (sharedProject.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can remove sharing'
      });
    }
    
    // Remove project from team's shared projects
    await Team.updateOne(
      { _id: sharedProject.team },
      { $pull: { sharedProjects: { project: sharedProject.project } } }
    );
    
    // Delete the shared project entry
    await sharedProject.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error removing sharing:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to remove sharing'
    });
  }
};