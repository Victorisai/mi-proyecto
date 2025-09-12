// backend/controllers/sellerPropertyController.js

const db = require('../config/db');

// (La función getMyProperties se mantiene igual)
exports.getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;
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

// --- FUNCIÓN ACTUALIZADA PARA CREAR PROPIEDAD ---
exports.createProperty = async (req, res) => {
  const userId = req.user.id; // ID del vendedor logueado
  
  // Extraemos todos los posibles campos del cuerpo de la petición
  const {
    title,
    description,
    price,
    category,
    listing_type,
    location,
    latitude,
    longitude,
    status = 'disponible', // Valor por defecto
    features // Las características vendrán en un objeto anidado
  } = req.body;

  // Validación básica
  if (!title || !price || !category || !listing_type || !location) {
      return res.status(400).json({ message: 'Los campos título, precio, categoría, tipo y ubicación son obligatorios.' });
  }

  try {
    const sql = `
      INSERT INTO properties 
      (title, description, price, category, listing_type, location, latitude, longitude, features, status, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      title,
      description,
      price,
      category,
      listing_type,
      location,
      latitude || null,
      longitude || null,
      JSON.stringify(features || {}), // Convertimos el objeto de características a un string JSON
      status,
      userId
    ];

    const [result] = await db.query(sql, params);
    const newPropertyId = result.insertId;

    res.status(201).json({ 
        message: '¡Propiedad creada con éxito!', 
        propertyId: newPropertyId 
    });

  } catch (error) {
    console.error('Error al crear la propiedad:', error);
    res.status(500).json({ message: 'Error en el servidor al crear la propiedad.' });
  }
};


// --- FUNCIÓN ACTUALIZADA PARA MODIFICAR PROPIEDAD ---
exports.updateProperty = async (req, res) => {
  const { id: propertyId } = req.params; // Obtenemos el ID de la propiedad de la URL
  const userId = req.user.id; // Obtenemos el ID del vendedor del token

  try {
    const connection = await db.getConnection();

    // 1. Verificar que la propiedad pertenece al usuario
    const [rows] = await connection.query("SELECT user_id FROM properties WHERE id = ?", [propertyId]);
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Propiedad no encontrada.' });
    }
    if (rows[0].user_id !== userId) {
      connection.release();
      return res.status(403).json({ message: 'No tienes permiso para editar esta propiedad.' });
    }

    // 2. Si es el dueño, proceder a actualizar
    const {
        title, description, price, category, listing_type, location,
        latitude, longitude, status, features
    } = req.body;

    const sql = `
      UPDATE properties SET 
      title = ?, description = ?, price = ?, category = ?, listing_type = ?, 
      location = ?, latitude = ?, longitude = ?, features = ?, status = ?
      WHERE id = ? AND user_id = ?
    `;
    
    const params = [
      title, description, price, category, listing_type, location,
      latitude || null, longitude || null, JSON.stringify(features || {}), status,
      propertyId, userId
    ];

    await connection.query(sql, params);
    connection.release();
    
    res.json({ message: 'Propiedad actualizada correctamente.' });

  } catch (error) {
    console.error('Error al actualizar la propiedad:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// --- FUNCIÓN ACTUALIZADA PARA ELIMINAR PROPIEDAD ---
exports.deleteProperty = async (req, res) => {
  const { id: propertyId } = req.params;
  const userId = req.user.id;

  try {
    const connection = await db.getConnection();

    // 1. Verificar que la propiedad pertenece al usuario
    const [rows] = await connection.query("SELECT user_id FROM properties WHERE id = ?", [propertyId]);
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Propiedad no encontrada.' });
    }
    if (rows[0].user_id !== userId) {
      connection.release();
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta propiedad.' });
    }

    // 2. Si es el dueño, proceder a eliminar
    await connection.query("DELETE FROM properties WHERE id = ? AND user_id = ?", [propertyId, userId]);
    connection.release();

    res.json({ message: 'Propiedad eliminada correctamente.' });

  } catch (error) {
    console.error('Error al eliminar la propiedad:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// --- NUEVA FUNCIÓN PARA SUBIR IMÁGENES ---
exports.uploadImages = async (req, res) => {
    const { id: propertyId } = req.params;
    const userId = req.user.id;

    try {
        const connection = await db.getConnection();

        // 1. Verificar que la propiedad pertenece al usuario (¡muy importante!)
        const [rows] = await connection.query("SELECT user_id FROM properties WHERE id = ?", [propertyId]);
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Propiedad no encontrada.' });
        }
        if (rows[0].user_id !== userId) {
            connection.release();
            return res.status(403).json({ message: 'No tienes permiso para subir imágenes a esta propiedad.' });
        }

        // 2. Construir el objeto de actualización de la base de datos
        const imagePaths = {};
        if (req.files.main_image) {
            imagePaths.main_image = req.files.main_image[0].path.replace(/\\/g, "/");
        }

        for (let i = 1; i <= 15; i++) {
            const fieldName = `thumbnail${i}`;
            if (req.files[fieldName]) {
                imagePaths[fieldName] = req.files[fieldName][0].path.replace(/\\/g, "/");
            }
        }
        
        if (Object.keys(imagePaths).length === 0) {
            connection.release();
            return res.status(400).json({ message: 'No se subieron archivos.' });
        }

        // 3. Crear y ejecutar la consulta SQL de actualización
        const fieldsToUpdate = Object.keys(imagePaths).map(key => `${key} = ?`).join(', ');
        const values = Object.values(imagePaths);
        const sql = `UPDATE properties SET ${fieldsToUpdate} WHERE id = ?`;
        
        await connection.query(sql, [...values, propertyId]);
        connection.release();

        res.json({ message: 'Imágenes subidas y guardadas correctamente.', paths: imagePaths });

    } catch (error) {
        console.error('Error al subir imágenes:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};