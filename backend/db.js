// 1. Importar la librería que acabamos de instalar
const mysql = require('mysql2');

// 2. Crear un "pool" de conexiones.
// Un pool es más eficiente que una única conexión porque gestiona y reutiliza
// conexiones a la base de datos, lo cual es vital para un servidor web.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'C150485c',
  database: 'cedralsales',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 3. Exportamos una versión "promisificada" del pool.
// Esto nos permitirá usar async/await, una forma moderna y más legible
// de manejar operaciones asíncronas como las consultas a la base de datos.
module.exports = pool.promise();