// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtener el token del encabezado de la petición
  const token = req.header('x-auth-token');

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ message: 'No hay token, permiso denegado.' });
  }

  // Verificar el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar el usuario decodificado (que contiene el id y el rol) a la petición
    req.user = decoded.user;
    next(); // Pasar al siguiente middleware o controlador
  } catch (error) {
    res.status(401).json({ message: 'El token no es válido.' });
  }
};