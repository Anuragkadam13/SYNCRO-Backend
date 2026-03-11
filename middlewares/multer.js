const multer = require("multer");

const storage = multer.memoryStorage();

// 2. Initialize upload with memory storage
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
