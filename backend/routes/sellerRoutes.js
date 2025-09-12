// backend/routes/sellerRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const sellerController = require('../controllers/sellerPropertyController');

// El middleware se aplica a todas las rutas de este archivo.
// ¡Nadie puede acceder a estas rutas sin un token válido!
router.use(authMiddleware);

// --- RUTAS DEL PANEL DEL VENDEDOR ---

// GET /api/seller/properties -> Obtener todas mis propiedades
router.get('/properties', sellerController.getMyProperties);

// POST /api/seller/properties -> Crear una nueva propiedad
router.post('/properties', sellerController.createProperty);

// PUT /api/seller/properties/:id -> Actualizar una de mis propiedades
router.put('/properties/:id', sellerController.updateProperty);

// DELETE /api/seller/properties/:id -> Eliminar una de mis propiedades
router.delete('/properties/:id', sellerController.deleteProperty);


module.exports = router;