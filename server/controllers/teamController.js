// backend/controllers/teamController.js
const Team = require('../models/Team');
const User = require('../models/User');
const Project = require('../models/Project');
const SharedProject = require('../models/SharedProject');
const crypto = require('crypto');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create team
    const team = await Team.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });
    
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create team'
    });
  }
};

// @desc    Get all teams for user
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res) => {
  try {
    // Find teams where user is either owner or member
    const teams = await Team.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('owner', 'name email profileImage')
      .populate('members.user', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (err) {
    console.error('Error getting teams:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get teams'
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email profileImage')
      .populate('members.user', 'name email profileImage')
      .populate({
        path: 'sharedProjects.project',
        select: 'name description createdAt updatedAt'
      })
      .populate('sharedProjects.sharedBy', 'name email profileImage');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Check if user is member or owner
    if (!team.isMember(req.user.id) && !team.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this team'
      });
    }
    
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error('Error getting team:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get team'
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
exports.updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    let team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Check if user is admin or owner
    if (!team.isAdmin(req.user.id) && !team.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this team'
      });
    }
    
    team = await Team.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    ).populate('owner', 'name email profileImage')
      .populate('members.user', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update team'
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Check if user is owner
    if (!team.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Only the team owner can delete a team'
      });
    }
    
    // Remove all associated shared projects
    await SharedProject.deleteMany({ team: team._id });
    
    // Delete the team
    await team.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete team'
    });
  }
};

// @desc    Invite user to team
// @route   POST /api/teams/:id/invite
// @access  Private
exports.inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    // Check if user is admin or owner
    if (!team.isAdmin(req.user.id) && !team.isOwner(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to invite users to this team'
      });
    }
    
    // Generate invite token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Set expiration (48 hours)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    
    // Add invite to team
    team.invites.push({
      email,
      role: role || 'member',
      token,
      expiresAt
    });
    
    await team.save();
    
    // In a real implementation, you would send an email with the invite link
    
    res.status(200).json({
      success: true,
      data: {
        message: `Invitation sent to ${email}`,
        token
      }
    });
  } catch (err) {
    console.error('Error inviting user:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to invite user'
    });
  }
};

// @desc    Accept team invitation
// @route   GET /api/teams/invite/:token
// @access  Private
exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find team with matching invite token
    const team = await Team.findOne({
      'invites.token': token,
      'invites.expiresAt': { $gt: Date.now() }
    });
    
    if (!team) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired invitation token'
      });
    }
    
    // Find the specific invite
    const invite = team.invites.find(i => i.token === token);
    
    // Check if the invite email matches the current user's email
    if (invite.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: 'This invitation is for a different email address'
      });
    }
    
    // Check if user is already a member
    if (team.members.some(member => member.user.toString() === req.user.id)) {
      // Remove the invite
      team.invites = team.invites.filter(i => i.token !== token);
      await team.save();
      
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this team'
      });
    }
    
    // Add user to members
    team.members.push({
      user: req.user.id,
      role: invite.role
    });
    
    // Remove the invite
    team.invites = team.invites.filter(i => i.token !== token);
    
    await team.save();
    
    res.status(200).json({
      success: true,
      data: {
        message: `You have joined the team: ${team.name}`,
        team
      }
    });
  } catch (err) {
    console.error('Error accepting invite:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to accept invitation'
    });
  }
};