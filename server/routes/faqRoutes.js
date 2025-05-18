const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const { protect, authorize } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log(`FAQ Route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// @route   GET /api/faqs
// @desc    Get all FAQs
// @access  Public
router.get('/', async (req, res) => {
  console.log('Attempting to fetch FAQs');
  try {
    const faqs = await FAQ.find().sort('order');
    console.log('FAQs found:', faqs.length);
    res.json(faqs);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/faqs
// @desc    Create a new FAQ
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    const faq = new FAQ({
      question,
      answer,
      order: order || 0
    });
    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/faqs/:id
// @desc    Update a FAQ
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.order = order !== undefined ? order : faq.order;
    
    await faq.save();
    res.json(faq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/faqs/:id
// @desc    Delete a FAQ
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await FAQ.deleteOne({ _id: req.params.id });
    res.json({ message: 'FAQ removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 