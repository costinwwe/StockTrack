const mongoose = require('mongoose');

// Debug log
console.log('Registering FAQ model');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer'],
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
FAQSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if model exists before registering
const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
console.log('FAQ model registered successfully');

module.exports = FAQ; 