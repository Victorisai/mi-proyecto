// backend/config/db.js

const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root', // Tu usuario de la base de datos
  password: 'C150485c', // Tu contraseña de la base de datos
  database: 'cedralsales' // El nombre de tu base de datos
};

// Crear una "piscina" de conexiones para mejorar el rendimiento
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ ¡Conexión a la base de datos exitosa!');
    connection.release(); // Liberar la conexión
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
}

// Probar la conexión al iniciar
testConnection();

// Exportar la piscina de conexiones para usarla en otras partes de la aplicación
module.exports = pool;