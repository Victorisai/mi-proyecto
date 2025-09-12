// backend/server.js
require('dotenv').config()
const express = require('express');
const db = require('./config/db');
const app = express();
const port = 3000; // Puedes cambiar el puerto si lo necesitas

// Middleware para entender JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- RUTAS DE LA API ---
const propertiesRoutes = require('./routes/propertiesRoutes'); // Importa el enrutador
const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');

app.use('/api/properties', propertiesRoutes);
app.use('/api/auth', authRoutes); // <-- Usa las rutas de auth
app.use('/api/seller', sellerRoutes);

// Una ruta de prueba
app.get('/api', (req, res) => {
  res.json({ message: '¡Hola desde el backend de Domably con Node.js!' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});