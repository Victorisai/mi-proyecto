// backend/server.js
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const app = express();
const port = 3000; // Puedes cambiar el puerto si lo necesitas

// Middleware para entender JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rutas estáticas para servir el frontend reorganizado
const frontendPath = path.join(__dirname, '../frontend');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets/js', express.static(path.join(frontendPath, 'src/js')));
app.use('/assets/templates', express.static(path.join(frontendPath, 'src/partials')));
app.use('/assets', express.static(path.join(frontendPath, 'public')));
app.use('/', express.static(path.join(frontendPath, 'src/pages')));

// --- RUTAS DE LA API ---
const propertiesRoutes = require('./routes/propertiesRoutes');
const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const heroRoutes = require('./routes/heroRoutes');
const newsRoutes = require('./routes/newsRoutes');

app.use('/api/properties', propertiesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', heroRoutes);
app.use('/api', newsRoutes);

// Una ruta de prueba
app.get('/api', (req, res) => {
  res.json({ message: '¡Hola desde el backend de Domably con Node.js!' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});