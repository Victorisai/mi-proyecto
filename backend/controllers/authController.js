// backend/controllers/authController.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para registrar un nuevo usuario
exports.register = async (req, res) => {
  const { name, email, password, phone, birth_date } = req.body;

  // Verificación básica de datos
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, proporciona nombre, email y contraseña.' });
  }

  try {
    const connection = await db.getConnection();

    // Revisar si el email ya existe
    const [existingUser] = await connection.query("SELECT email FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar el nuevo usuario
    const sql = "INSERT INTO users (name, email, password, phone, birth_date) VALUES (?, ?, ?, ?, ?)";
    await connection.query(sql, [name, email, hashedPassword, phone, birth_date]);
    
    connection.release();

    res.status(201).json({ message: '¡Usuario registrado con éxito!' });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error en el servidor al intentar registrar.' });
  }
};

// Función para iniciar sesión
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, proporciona email y contraseña.' });
  }

  try {
    const connection = await db.getConnection();

    // 1. Buscar al usuario por su email
    const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // No decir si es el email o la pass
    }

    const user = rows[0];

    // 2. Comparar la contraseña enviada con la guardada en la BD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Si todo es correcto, crear el token (JWT)
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Usamos la clave secreta del archivo .env
      { expiresIn: '1h' }, // El token expira en 1 hora
      (error, token) => {
        if (error) throw error;
        // 4. Enviar el token al cliente
        res.json({ token });
      }
    );

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor al intentar iniciar sesión.' });
  }
};