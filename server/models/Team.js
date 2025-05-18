// backend/models/Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true,
    maxlength: [50, 'Team name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['admin', 'member', 'viewer'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  invites: [
    {
      email: {
        type: String,
        required: true
      },
      role: {
        type: String,
        enum: ['admin', 'member', 'viewer'],
        default: 'member'
      },
      token: {
        type: String,
        required: true
      },
      expiresAt: {
        type: Date,
        required: true
      }
    }
  ],
  sharedProjects: [
    {
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      },
      sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      },
      accessLevel: {
        type: String,
        enum: ['view', 'comment', 'edit'],
        default: 'view'
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
TeamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for shared project count
TeamSchema.virtual('sharedProjectCount').get(function() {
  return this.sharedProjects.length;
});

// Method to check if user is a member
TeamSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is an admin
TeamSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member && member.role === 'admin';
};

// Method to check if user is the owner
TeamSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

module.exports = mongoose.model('Team', TeamSchema);