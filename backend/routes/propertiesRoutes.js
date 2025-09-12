// backend/routes/propertiesRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Importamos la conexión a la BD

// Definimos la ruta para obtener todas las propiedades
// GET /api/properties
router.get('/', async (req, res) => {
  try {
    // Obtenemos una conexión de la piscina
    const connection = await db.getConnection();
    
    // Ejecutamos la consulta SQL
    const [rows] = await connection.query("SELECT id, title, price, category, location, main_image FROM properties WHERE status = 'disponible' ORDER BY created_at DESC");
    
    // Liberamos la conexión
    connection.release();
    
    // Enviamos los resultados como JSON
    res.json(rows);

  } catch (error) {
    console.error('Error al obtener las propiedades:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;