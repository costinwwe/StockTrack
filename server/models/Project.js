// models/Project.js
const mongoose = require('mongoose');

// Schema for custom cell styling
const CellStyleSchema = new mongoose.Schema({
  fontWeight: {
    type: String,
    enum: ['normal', 'bold'],
    default: 'normal'
  },
  fontStyle: {
    type: String,
    enum: ['normal', 'italic'],
    default: 'normal'
  },
  textDecoration: {
    type: String,
    enum: ['none', 'underline'],
    default: 'none'
  },
  textAlign: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'left'
  },
  backgroundColor: {
    type: String,
    default: ''
  },
  textColor: {
    type: String,
    default: ''
  }
}, { _id: false });

// Schema for cell data
const CellSchema = new mongoose.Schema({
  columnId: {
    type: String,
    required: true
  },
  value: mongoose.Schema.Types.Mixed,
  formula: String,
  style: CellStyleSchema
}, { _id: false });

// Schema for rows in a table
const RowSchema = new mongoose.Schema({
  cells: [CellSchema]
}, { _id: false });

// Schema for grid settings
const GridSettingsSchema = new mongoose.Schema({
  columns: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  rows: {
    type: Number,
    default: 20,
    min: 1,
    max: 1000
  },
  frozenRows: {
    type: Number,
    default: 0
  },
  frozenColumns: {
    type: Number,
    default: 0
  },
  showHeaders: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Schema for table columns
const ColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'boolean', 'select', 'formula'],
    default: 'text'
  },
  width: {
    type: Number,
    default: 100
  },
  options: [String], // For select type
  hidden: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Schema for tables within a project
const TableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  columns: [ColumnSchema],
  rows: [RowSchema],
  gridSettings: {
    type: GridSettingsSchema,
    default: () => ({})
  },
  mergedCells: [{
    startRow: Number,
    endRow: Number,
    startCol: Number,
    endCol: Number
  }]
}, { _id: false });

// Main Project Schema
const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  tables: {
    type: [TableSchema],
    default: () => ([{
      name: 'Sheet 1',
      columns: [
        { name: 'A', type: 'text' },
        { name: 'B', type: 'text' },
        { name: 'C', type: 'text' }
      ],
      rows: [],
      gridSettings: {
        columns: 10,
        rows: 20,
        frozenRows: 0,
        frozenColumns: 0,
        showHeaders: true
      }
    }])
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to update the lastModified date
ProjectSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);