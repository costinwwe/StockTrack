// backend/models/SharedProject.js
const mongoose = require('mongoose');

const SharedProjectSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  sharedWith: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      accessLevel: {
        type: String,
        enum: ['view', 'comment', 'edit'],
        default: 'view'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  accessLevel: {
    type: String,
    enum: ['view', 'comment', 'edit'],
    default: 'view'
  },
  sharedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  views: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      lastViewed: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

// Method to check if user can access project
SharedProjectSchema.methods.canUserAccess = function(userId) {
  // Owner always has access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }
  
  // Check if user is in the sharedWith array
  const userShare = this.sharedWith.find(
    share => share.user.toString() === userId.toString()
  );
  
  return userShare !== undefined;
};

// Method to get user's access level
SharedProjectSchema.methods.getUserAccessLevel = function(userId) {
  // Owner always has full access
  if (this.owner.toString() === userId.toString()) {
    return 'edit';
  }
  
  // Check shared access level
  const userShare = this.sharedWith.find(
    share => share.user.toString() === userId.toString()
  );
  
  return userShare ? userShare.accessLevel : null;
};

module.exports = mongoose.model('SharedProject', SharedProjectSchema);