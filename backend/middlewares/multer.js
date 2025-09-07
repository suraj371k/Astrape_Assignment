import multer from "multer";
import path from "path";
import fs from "fs";

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use Date.now() for unique file names, keep original extension
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

// File filter to allow only images
function fileFilter(req, file, cb) {
  // Accept any image/* mimetype (covers jpg, png, webp, heic, gif, etc.)
  const isImage = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
  if (isImage) {
    return cb(null, true);
  }
  // Gracefully skip non-image files
  return cb(null, false);
}

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

export default upload;
