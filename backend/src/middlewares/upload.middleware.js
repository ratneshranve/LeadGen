const multer = require("multer");
const ApiError = require("../utils/apiError");

// Use Memory Storage so binary files are uploaded via stream to Cloudinary without saving to disk/DB
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Basic format check
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("application/") || file.mimetype.startsWith("text/")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Unsupported file format. Upload rejected."));
    }
  },
});

module.exports = upload;
