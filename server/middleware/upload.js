// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    // Create unique filename with timestamp and original extension
    cb(
      null,
      `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: fileFilter
});

// Middleware to upload profile image
exports.uploadProfileImage = (req, res, next) => {
  const uploadSingle = upload.single('profileImage');

  uploadSingle(req, res, function(err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file too large)
        return res.status(400).json({
          success: false,
          error: err.message
        });
      } else {
        // An unknown error occurred
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
    }
    
    // Everything went fine, proceed
    next();
  });
};