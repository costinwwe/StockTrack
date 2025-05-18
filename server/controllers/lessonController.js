const Lesson = require('../models/Lesson');

// Get all lessons
exports.getLessons = async (req, res) => {
  const lessons = await Lesson.find().sort({ order: 1 });
  res.json(lessons);
};

// Add lesson
exports.addLesson = async (req, res) => {
  const { title, videoUrl, content } = req.body;
  const order = await Lesson.countDocuments();
  const lesson = await Lesson.create({ title, videoUrl, content, order });
  res.status(201).json(lesson);
};

// Update lesson
exports.updateLesson = async (req, res) => {
  const { title, videoUrl, content } = req.body;
  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { title, videoUrl, content },
    { new: true }
  );
  res.json(lesson);
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  await Lesson.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// Reorder lessons
exports.reorderLessons = async (req, res) => {
  const { order } = req.body; // [{id, order}, ...]
  for (const { id, order: newOrder } of order) {
    await Lesson.findByIdAndUpdate(id, { order: newOrder });
  }
  res.json({ success: true });
}; 