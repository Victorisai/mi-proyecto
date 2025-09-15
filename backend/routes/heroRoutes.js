// backend/routes/heroRoutes.js

const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');

// Ruta para obtener las imágenes del carrusel
router.get('/hero-images', heroController.getHeroImages);

module.exports = router;