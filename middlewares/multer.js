// backend/middleware/multer.js
const multer = require("multer");
const path = require("path");

// Configure how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    // Save file as: taskID-timestamp.extension
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
module.exports = upload;
