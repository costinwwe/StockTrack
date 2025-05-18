const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const teamRoutes = require('./routes/teamRoutes');
const sharedProjectRoutes = require('./routes/sharedProjectRoutes');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Initialize express app
const app = express();

// Middleware
app.use(cors());

// File upload middleware
app.use(fileUpload({
  useTempFiles: false,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
}));

// Special handling for Stripe webhook raw body - must be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Add middleware to convert raw body buffer for Stripe webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    req.rawBody = req.body;
  }
  next();
});

// Parse JSON bodies for all other routes
app.use(express.json());

// Set static folder for public assets
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads directories if they don't exist
const blogUploadDir = path.join(__dirname, 'public/uploads/blog');
if (!fs.existsSync(blogUploadDir)) {
  fs.mkdirSync(blogUploadDir, { recursive: true });
}

app.use('/api/teams', teamRoutes);
app.use('/api/shared-projects', sharedProjectRoutes);

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const initializeRoutes = () => {
  console.log('Initializing routes...');
  
  // Import route modules
  const elementRoutes = require('./routes/elementRoutes');
  const directElementRoutes = require('./routes/directElementRoutes');
  const lessonRoutes = require('./routes/lessonRoutes');
  const faqRoutes = require('./routes/faqRoutes');

  // Register routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/stripe', require('./routes/stripe'));
  app.use('/api/projects', require('./routes/projects'));
  app.use('/api/projects/:projectId/elements', elementRoutes);
  app.use('/api/elements', directElementRoutes);
  app.use('/api/blog', require('./routes/blog'));
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/faqs', faqRoutes);
  
  console.log('Routes initialized successfully');
};

// Initialize routes immediately
initializeRoutes();

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server and initialize routes after database connection
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();