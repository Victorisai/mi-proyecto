// backend/controllers/adminController.js

const db = require('../config/db');

// Obtener una lista de todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

// Eliminar un usuario (¡y todas sus propiedades!)
exports.deleteUser = async (req, res) => {
  const { id: userId } = req.params;
  try {
    const connection = await db.getConnection();
    await connection.beginTransaction(); // Iniciar transacción

    // 1. Eliminar todas las propiedades del usuario
    await connection.query("DELETE FROM properties WHERE user_id = ?", [userId]);

    // 2. Eliminar al usuario
    const [result] = await connection.query("DELETE FROM users WHERE id = ?", [userId]);

    await connection.commit(); // Confirmar transacción
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Usuario y todas sus propiedades han sido eliminados.' });
  } catch (error) {
    await connection.rollback(); // Revertir en caso de error
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

// Obtener TODAS las propiedades de la plataforma
exports.getAllProperties = async (req, res) => {
    try {
        // Hacemos un JOIN para obtener también el nombre del vendedor
        const [properties] = await db.query(`
            SELECT p.*, u.name as seller_name 
            FROM properties p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.json(properties);
    } catch (error) {
        console.error("Error al obtener todas las propiedades:", error);
        res.status(500).json({ message: "Error en el servidor." });
    }
};

// Eliminar CUALQUIER propiedad de la plataforma
exports.deleteProperty = async (req, res) => {
    const { id: propertyId } = req.params;
    try {
        const [result] = await db.query("DELETE FROM properties WHERE id = ?", [propertyId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Propiedad no encontrada.' });
        }
        res.json({ message: 'Propiedad eliminada correctamente por el administrador.' });
    } catch (error) {
        console.error("Error al eliminar propiedad:", error);
        res.status(500).json({ message: "Error en el servidor." });
    }
};