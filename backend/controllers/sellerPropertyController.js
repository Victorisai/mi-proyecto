// backend/controllers/sellerPropertyController.js

const db = require('../config/db');

// Obtener todas las propiedades de un vendedor específico
exports.getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id; // Obtenemos el ID del usuario desde el token verificado
    
    const [properties] = await db.query(
      "SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(properties);
  } catch (error) {
    console.error("Error al obtener las propiedades del vendedor:", error);
    res.status(500).send("Error en el servidor");
  }
};

// Crear una nueva propiedad
exports.createProperty = async (req, res) => {
    // Lógica para crear una propiedad... (La construiremos en el siguiente paso)
    res.json({ message: 'Propiedad creada (próximamente)', user: req.user });
};

// Actualizar una propiedad existente
exports.updateProperty = async (req, res) => {
    // Lógica para actualizar una propiedad...
    res.json({ message: `Propiedad ${req.params.id} actualizada (próximamente)`, user: req.user });
};

// Eliminar una propiedad
exports.deleteProperty = async (req, res) => {
    // Lógica para eliminar una propiedad...
    res.json({ message: `Propiedad ${req.params.id} eliminada (próximamente)`, user: req.user });
};