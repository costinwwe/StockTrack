const mongoose = require('mongoose');

const ElementSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a name for this element'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Please specify the element type'],
      enum: ['header', 'text', 'image', 'list', 'card', 'custom'],
      default: 'custom'
    },
    content: {
      title: String,
      description: String,
      imageUrl: String,
      items: [String]
    },
    style: {
      backgroundColor: {
        type: String,
        default: '#ffffff'
      },
      textColor: {
        type: String,
        default: '#333333'
      },
      width: {
        type: Number,
        default: 300
      },
      height: {
        type: Number,
        default: 200
      },
      borderRadius: {
        type: Number,
        default: 8
      },
      borderColor: {
        type: String,
        default: '#e2e8f0'
      },
      borderWidth: {
        type: Number,
        default: 1
      },
      padding: {
        type: Number,
        default: 20
      }
    },
    position: {
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      zIndex: {
        type: Number,
        default: 1
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Element', ElementSchema);