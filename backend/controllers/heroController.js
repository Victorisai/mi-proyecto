// backend/controllers/heroController.js

const db = require('../config/db');

// Obtener todas las imágenes del carrusel (hero)
exports.getHeroImages = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM hero_images ORDER BY display_order ASC, id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las imágenes del carrusel:', error);
        res.status(500).send('Error en el servidor');
    }
};