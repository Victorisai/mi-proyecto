const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExists = (directoryPath) => {
  fs.mkdirSync(directoryPath, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const uploadPath = path.join('public', 'uploads', 'users', String(userId));

    try {
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname) || '.png';
    cb(null, `avatar-${timestamp}-${randomSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new Error('Solo se permiten archivos de imagen.'));
};

const uploadUserAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
  },
});

module.exports = {
  uploadUserAvatar,
};
