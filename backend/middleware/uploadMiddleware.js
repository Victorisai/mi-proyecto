// backend/middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const propertyId = req.params.id;
    const dir = `public/uploads/property_${propertyId}`;

    // Crea el directorio si no existe
    fs.mkdirSync(dir, { recursive: true });
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Genera un nombre de archivo único para evitar colisiones
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('¡Solo se permiten imágenes!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Límite de 5MB por archivo
});

// Middleware para subir hasta 16 imágenes (1 principal + 15 miniaturas)
const uploadPropertyImages = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'thumbnail1', maxCount: 1 }, { name: 'thumbnail2', maxCount: 1 },
    { name: 'thumbnail3', maxCount: 1 }, { name: 'thumbnail4', maxCount: 1 },
    { name: 'thumbnail5', maxCount: 1 }, { name: 'thumbnail6', maxCount: 1 },
    { name: 'thumbnail7', maxCount: 1 }, { name: 'thumbnail8', maxCount: 1 },
    { name: 'thumbnail9', maxCount: 1 }, { name: 'thumbnail10', maxCount: 1 },
    { name: 'thumbnail11', maxCount: 1 }, { name: 'thumbnail12', maxCount: 1 },
    { name: 'thumbnail13', maxCount: 1 }, { name: 'thumbnail14', maxCount: 1 },
    { name: 'thumbnail15', maxCount: 1 }
]);

module.exports = { uploadPropertyImages };