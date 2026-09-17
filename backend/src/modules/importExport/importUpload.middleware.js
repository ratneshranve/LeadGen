const multer = require("multer");
const ApiError = require("../../utils/apiError");

const ALLOWED_MIMETYPES = [
  "text/csv",
  "application/vnd.ms-excel",                                            // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",   // .xlsx
  "text/plain",    // some clients send CSV as text/plain
  "application/octet-stream", // fallback for binary CSV
];

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

const MAX_FILE_SIZE_MB = 10;

/**
 * Multer in-memory storage — we parse the buffer directly,
 * no temp files written to disk.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = "." + file.originalname.split(".").pop().toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new ApiError(
        400,
        `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed.`
      ),
      false
    );
  }

  cb(null, true);
};

const uploadImportFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
}).single("file");

/**
 * Express middleware that wraps multer errors into ApiError format.
 */
const handleImportUpload = (req, res, next) => {
  uploadImportFile(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new ApiError(400, `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`)
        );
      }
      return next(new ApiError(400, `File upload error: ${err.message}`));
    }

    if (err instanceof ApiError) return next(err);

    return next(new ApiError(400, err.message || "File upload failed."));
  });
};

module.exports = { handleImportUpload };
