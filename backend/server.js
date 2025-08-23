const express = require('express');
const db = require('./db');
// 1. Importamos el paquete cors
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const multer = require('multer');
const path = require('path'); // Un módulo nativo de Node.js para manejar rutas de archivos

const bcrypt = require('bcrypt');

// --- CONFIGURACIÓN DE MULTER (PARA SUBIDA DE ARCHIVOS) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Le decimos a multer que guarde los archivos en la carpeta que está FUERA del backend
    cb(null, '../assets/images/experiences/');
  },
  filename: (req, file, cb) => {
    // Creamos un nombre de archivo único para evitar conflictos: timestamp + nombre original
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- NUEVA CONFIGURACIÓN DE MULTER PARA IMÁGENES DEL HERO ---
const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // La ruta donde se guardarán las nuevas imágenes del hero
    cb(null, '../assets/images/hero/');
  },
  filename: (req, file, cb) => {
    // Creamos un nombre de archivo único
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadHero = multer({ storage: heroStorage });

// --- MIDDLEWARE ---
// ... app.use(cors()); app.use(express.json());

// --- NUEVO MIDDLEWARE PARA SERVIR ARCHIVOS ESTÁTICOS ---
// Hacemos que la carpeta 'assets' del proyecto principal sea accesible públicamente
// para que las imágenes se puedan ver en el navegador.
app.use('/assets', express.static(path.join(__dirname, '../assets')));
// --- MIDDLEWARE ---
// 2. Usamos cors para permitir peticiones desde cualquier origen.
// Esto es útil para desarrollo. En producción se puede restringir.
app.use(cors());

// Middleware para que Express entienda los datos JSON que vienen en el cuerpo de una petición
app.use(express.json());

// --- RUTAS DE LA API ---

// 3. Creamos nuestra primera ruta GET para obtener todas las propiedades
// Cuando se visite http://localhost:3000/api/properties
app.get('/api/properties', async (req, res) => {
  try {
    // 4. Escribimos la misma consulta SQL que tenías en dashboard.php
    const query = "SELECT * FROM properties ORDER BY created_at DESC";

    // 5. Ejecutamos la consulta usando nuestro pool de conexión
    const [properties] = await db.query(query);

    // 6. Enviamos los resultados de vuelta en formato JSON
    res.json(properties);

  } catch (error) {
    // 7. Si algo sale mal, enviamos un error
    console.error("Error al obtener las propiedades:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- NUEVA RUTA: Eliminar una propiedad por su ID ---
// Usamos app.delete() para indicar la acción de borrado.
// :id es un parámetro dinámico. Express lo capturará por nosotros.
app.delete('/api/properties/:id', async (req, res) => {
  try {
    // Obtenemos el ID de los parámetros de la URL (ej: /api/properties/12)
    const { id } = req.params;

    const query = "DELETE FROM properties WHERE id = ?";

    // Ejecutamos la consulta pasando el ID de forma segura
    const [result] = await db.query(query, [id]);

    // `affectedRows` nos dice cuántas filas fueron eliminadas.
    if (result.affectedRows === 0) {
      // Si no se eliminó nada, es porque no se encontró el ID.
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // Si todo salió bien, enviamos un mensaje de éxito.
    res.json({ message: 'Propiedad eliminada exitosamente' });

  } catch (error) {
    console.error("Error al eliminar la propiedad:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER PROPIEDADES (CON FILTROS OPCIONALES)
app.get('/api/properties', async (req, res) => {
  try {
    // Obtenemos los parámetros de la URL, como ?listing_type=venta&limit=10
    const { listing_type, limit } = req.query;

    let query = "SELECT * FROM properties WHERE status = 'disponible'";
    const params = [];

    if (listing_type) {
      query += " AND listing_type = ?";
      params.push(listing_type);
    }

    query += " ORDER BY created_at DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit, 10));
    }

    const [properties] = await db.query(query, params);
    res.json(properties);

  } catch (error) {
    console.error("Error al obtener las propiedades:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- NUEVA RUTA: Actualizar (UPDATE) una propiedad por su ID ---
// Usamos app.put() para la acción de actualizar/reemplazar.
app.put('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // req.body contiene los datos JSON que el formulario nos envió.
    const { title, description, price, category, listing_type, location, status, features } = req.body;

    const query = `
      UPDATE properties SET
        title = ?, description = ?, price = ?, category = ?,
        listing_type = ?, location = ?, status = ?, features = ?
      WHERE id = ?
    `;

    const [result] = await db.query(query, [
      title,
      description,
      price,
      category,
      listing_type,
      location,
      status,
      JSON.stringify(features), // El campo 'features' en la BD es JSON, así que lo convertimos a string.
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Propiedad no encontrada para actualizar' });
    }

    res.json({ message: 'Propiedad actualizada exitosamente' });

  } catch (error) {
    console.error("Error al actualizar la propiedad:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- NUEVA RUTA: Obtener todos los mensajes ---
app.get('/api/messages', async (req, res) => {
  try {
    const query = "SELECT * FROM contacts ORDER BY created_at DESC";
    const [messages] = await db.query(query);
    res.json(messages);
  } catch (error) {
    console.error("Error al obtener los mensajes:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- NUEVA RUTA: Crear un nuevo mensaje (desde el formulario de contacto) ---
// Usamos app.post() que es el estándar para crear nuevos registros.
app.post('/api/messages', async (req, res) => {
  try {
    // Obtenemos los datos que nos envía el formulario desde req.body
    const { name, email, phone, message } = req.body;

    // Validación simple para asegurarnos de que los datos necesarios están presentes
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos.' });
    }

    const query = "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(query, [name, email, phone, message]);

    // Enviamos una respuesta de éxito (código 201 significa "Creado")
    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      messageId: result.insertId // Devolvemos el ID del nuevo mensaje
    });

  } catch (error) {
    console.error("Error al guardar el mensaje:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =============================================
// ===          RUTAS PARA NOTICIAS          ===
// =============================================

// OBTENER TODAS LAS NOTICIAS (ordenadas por 'display_order')
app.get('/api/news', async (req, res) => {
  try {
    const query = "SELECT * FROM news ORDER BY display_order ASC";
    const [news] = await db.query(query);
    res.json(news);
  } catch (error) {
    console.error("Error al obtener las noticias:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// OBTENER UNA SOLA NOTICIA POR ID
app.get('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = "SELECT * FROM news WHERE id = ?";
        const [news] = await db.query(query, [id]);
        if (news.length === 0) {
            return res.status(404).json({ error: 'Noticia no encontrada' });
        }
        res.json(news[0]);
    } catch (error) {
        console.error("Error al obtener la noticia:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// CREAR UNA NUEVA NOTICIA
app.post('/api/news', async (req, res) => {
  try {
    const { title, date, information, sources, images } = req.body;
    // La nueva noticia se inserta al final con un display_order alto.
    const query = `
      INSERT INTO news (title, date, images, information, sources, display_order) 
      VALUES (?, ?, ?, ?, ?, 999)
    `;
    const [result] = await db.query(query, [title, date, JSON.stringify(images), information, sources]);
    res.status(201).json({ message: 'Noticia creada', newsId: result.insertId });
  } catch (error) {
    console.error("Error al crear la noticia:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ACTUALIZAR UNA NOTICIA
app.put('/api/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, information, sources, images } = req.body;
    const query = `
      UPDATE news SET title = ?, date = ?, images = ?, information = ?, sources = ? 
      WHERE id = ?
    `;
    await db.query(query, [title, date, JSON.stringify(images), information, sources, id]);
    res.json({ message: 'Noticia actualizada' });
  } catch (error) {
    console.error("Error al actualizar la noticia:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ELIMINAR UNA NOTICIA
app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM news WHERE id = ?";
        await db.query(query, [id]);
        res.json({ message: 'Noticia eliminada' });
    } catch (error) {
        console.error("Error al eliminar la noticia:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RUTA ESPECIAL PARA ACTUALIZAR EL ORDEN
app.post('/api/news/order', async (req, res) => {
    try {
        // Recibimos un array de IDs en el orden correcto
        const { order } = req.body; 
        if (!Array.isArray(order)) {
            return res.status(400).json({ error: 'El formato del orden no es válido.' });
        }

        // Usamos una transacción para asegurarnos de que todas las actualizaciones se hagan correctamente.
        const connection = await db.getConnection();
        await connection.beginTransaction();

        for (let i = 0; i < order.length; i++) {
            const newsId = order[i];
            const newPosition = i + 1;
            await connection.query("UPDATE news SET display_order = ? WHERE id = ?", [newPosition, newsId]);
        }

        await connection.commit();
        connection.release();

        res.json({ message: 'Orden de las noticias actualizado' });
    } catch (error) {
        console.error("Error al actualizar el orden:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =============================================
// ===        RUTAS PARA UBICACIONES         ===
// =============================================

// OBTENER TODAS LAS UBICACIONES
app.get('/api/locations', async (req, res) => {
  try {
    const query = "SELECT * FROM locations ORDER BY name ASC";
    const [locations] = await db.query(query);
    res.json(locations);
  } catch (error) {
    console.error("Error al obtener las ubicaciones:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// CREAR UNA NUEVA UBICACIÓN
app.post('/api/locations', async (req, res) => {
    try {
        const { name, municipality } = req.body;
        if (!name || !municipality) {
            return res.status(400).json({ error: 'Nombre y municipio son requeridos.' });
        }
        const query = "INSERT INTO locations (name, municipality) VALUES (?, ?)";
        const [result] = await db.query(query, [name, municipality]);
        res.status(201).json({ message: 'Ubicación creada', locationId: result.insertId });
    } catch (error) {
        console.error("Error al crear la ubicación:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR UNA UBICACIÓN
app.put('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, municipality } = req.body;
        const query = "UPDATE locations SET name = ?, municipality = ? WHERE id = ?";
        const [result] = await db.query(query, [name, municipality, id]);
        if (result.affectedRows === 0) {
             return res.status(404).json({ error: 'Ubicación no encontrada' });
        }
        res.json({ message: 'Ubicación actualizada' });
    } catch (error) {
        console.error("Error al actualizar la ubicación:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ELIMINAR UNA UBICACIÓN
app.delete('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM locations WHERE id = ?";
        const [result] = await db.query(query, [id]);
         if (result.affectedRows === 0) {
             return res.status(404).json({ error: 'Ubicación no encontrada' });
        }
        res.json({ message: 'Ubicación eliminada' });
    } catch (error) {
        console.error("Error al eliminar la ubicación:", error);
        // Si hay un error de clave foránea (intentando borrar una ubicación que tiene experiencias)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar la ubicación porque tiene experiencias asociadas.' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =============================================
// ===        RUTAS PARA EXPERIENCIAS        ===
// =============================================

// OBTENER EXPERIENCIAS POR ID DE UBICACIÓN
app.get('/api/locations/:locationId/experiences', async (req, res) => {
  try {
    const { locationId } = req.params;
    const query = "SELECT * FROM experiences WHERE location_id = ? ORDER BY created_at DESC";
    const [experiences] = await db.query(query, [locationId]);
    res.json(experiences);
  } catch (error) {
    console.error("Error al obtener experiencias:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// CREAR UNA NUEVA EXPERIENCIA (¡CON SUBIDA DE IMAGEN!)
// Fíjate en `upload.single('image')`. Esto le dice a multer que espere un archivo
// del campo del formulario llamado 'image'.
app.post('/api/experiences', upload.single('image'), async (req, res) => {
  try {
    const { location_id, title, description } = req.body;
    // req.file contiene la información del archivo subido por multer.
    const imagePath = req.file.path.replace(/\\/g, '/').replace('../', '');

    const query = "INSERT INTO experiences (location_id, title, description, image) VALUES (?, ?, ?, ?)";
    await db.query(query, [location_id, title, description, imagePath]);
    
    res.status(201).json({ message: 'Experiencia creada exitosamente' });
  } catch (error) {
    console.error("Error al crear la experiencia:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ELIMINAR UNA EXPERIENCIA
app.delete('/api/experiences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // (Opcional pero recomendado) También podríamos borrar el archivo de imagen del servidor aquí.
        const query = "DELETE FROM experiences WHERE id = ?";
        await db.query(query, [id]);
        res.json({ message: 'Experiencia eliminada' });
    } catch (error) {
        console.error("Error al eliminar la experiencia:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// NOTA: La actualización (PUT) de una experiencia con imagen es más compleja,
// así que la dejaremos para el final para no complicar este paso.

// =============================================
// ===      RUTAS PARA IMÁGENES DEL HERO     ===
// =============================================

// OBTENER TODAS LAS IMÁGENES DEL HERO
app.get('/api/hero-images', async (req, res) => {
  try {
    const query = "SELECT * FROM hero_images ORDER BY display_order ASC, id DESC";
    const [images] = await db.query(query);
    res.json(images);
  } catch (error) {
    console.error("Error al obtener las imágenes del hero:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// AÑADIR UNA NUEVA IMAGEN AL HERO
// Usamos el nuevo 'uploadHero' que acabamos de crear.
app.post('/api/hero-images', uploadHero.single('hero_image'), async (req, res) => {
  try {
    const { display_order } = req.body;
    const imagePath = req.file.path.replace(/\\/g, '/').replace('../', '');

    const query = "INSERT INTO hero_images (image_path, display_order) VALUES (?, ?)";
    await db.query(query, [imagePath, display_order]);

    res.status(201).json({ message: 'Imagen del hero añadida exitosamente' });
  } catch (error) {
    console.error("Error al añadir la imagen del hero:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ELIMINAR UNA IMAGEN DEL HERO
app.delete('/api/hero-images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Opcional: Borrar el archivo físico antes de borrar el registro en la BD.
        // (Esta parte se puede implementar después para mayor robustez)
        const query = "DELETE FROM hero_images WHERE id = ?";
        await db.query(query, [id]);
        res.json({ message: 'Imagen eliminada' });
    } catch (error) {
        console.error("Error al eliminar la imagen del hero:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =============================================
// ===       RUTAS PARA ADMINISTRADORES      ===
// =============================================

// OBTENER TODOS LOS ADMINISTRADORES (solo username y id)
app.get('/api/admins', async (req, res) => {
  try {
    // Por seguridad, nunca enviamos el hash de la contraseña al frontend.
    const query = "SELECT id, username FROM admins ORDER BY username ASC";
    const [admins] = await db.query(query);
    res.json(admins);
  } catch (error) {
    console.error("Error al obtener administradores:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// CREAR UN NUEVO ADMINISTRADOR
app.post('/api/admins', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
        }

        // Hasheamos la contraseña antes de guardarla.
        // El '10' es el "costo" o "rondas de salting", un valor estándar y seguro.
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "INSERT INTO admins (username, password) VALUES (?, ?)";
        await db.query(query, [username, hashedPassword]);

        res.status(201).json({ message: 'Administrador creado exitosamente' });
    } catch (error) {
        // Manejar error si el usuario ya existe (código de error de MySQL para duplicados)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
        }
        console.error("Error al crear administrador:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ACTUALIZAR LA CONTRASEÑA DE UN ADMINISTRADOR
app.put('/api/admins/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!password) {
             return res.status(400).json({ error: 'La nueva contraseña es requerida.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "UPDATE admins SET password = ? WHERE id = ?";
        await db.query(query, [hashedPassword, id]);

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// OBTENER TODAS LAS UBICACIONES CON SUS EXPERIENCIAS ANIDADAS
app.get('/api/public/experiences', async (req, res) => {
  try {
    const locationsQuery = "SELECT * FROM locations ORDER BY name";
    const [locations] = await db.query(locationsQuery);

    const experiencesQuery = "SELECT * FROM experiences WHERE location_id = ? ORDER BY created_at DESC";

    // Usamos Promise.all para hacer todas las consultas de experiencias en paralelo
    const locationsWithExperiences = await Promise.all(
      locations.map(async (location) => {
        const [experiences] = await db.query(experiencesQuery, [location.id]);
        return { ...location, experiences: experiences };
      })
    );

    res.json(locationsWithExperiences);
  } catch (error) {
    console.error("Error al obtener datos de experiencias:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});