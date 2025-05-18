const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Import routes (adjust paths as needed)
const authRoutes = require('../../server/routes/auth');
const projectRoutes = require('../../server/routes/projects');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Export the serverless function
module.exports.handler = serverless(app);