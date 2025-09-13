// backend/middleware/adminMiddleware.js

const jwt = require('jsonwebtoken');

// Este middleware tiene una función extra: verificar el ROL del usuario
function adminMiddleware(req, res, next) {
  // Primero, obtenemos el token del encabezado
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No hay token, permiso denegado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // ----- VERIFICACIÓN DE ROL -----
    // Si el rol del usuario NO es 'admin', le negamos el acceso
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. No eres administrador.' });
    }
    // Si es admin, puede continuar
    next();
  } catch (error) {
    res.status(401).json({ message: 'El token no es válido.' });
  }
}

module.exports = adminMiddleware;