// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Aplicamos el middleware de administrador a TODAS las rutas de este archivo
router.use(adminMiddleware);

// --- Rutas de Gestión de Usuarios ---
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// --- Rutas de Gestión de Propiedades ---
router.get('/properties', adminController.getAllProperties);
router.delete('/properties/:id', adminController.deleteProperty);

module.exports = router;