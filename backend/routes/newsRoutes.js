// backend/routes/newsRoutes.js

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Ruta para obtener las noticias
router.get('/news', newsController.getNews);

module.exports = router;
