const mongoose = require('mongoose');
const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: String,
  content: String,
  order: { type: Number, default: 0 }
});
module.exports = mongoose.model('Lesson', LessonSchema); 