const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const csvFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() !== '.csv') {
    return cb(new Error('Only CSV files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: csvFilter });

module.exports = upload;
