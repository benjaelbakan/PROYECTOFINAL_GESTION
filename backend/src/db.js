const mysql = require('mysql2/promise');

// Configuración de la conexión
// Estos datos deben coincidir con lo que creamos en MySQL
const pool = mysql.createPool({
    host: 'localhost',           // En Codespaces suele ser localhost o 127.0.0.1
    user: 'mantenimiento_user',  // El usuario que creamos
    password: 'password_strong', // La contraseña que pusimos
    database: 'mantenimiento',   // La base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probamos la conexión al iniciar
pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('✅ Conexión a Base de Datos EXITOSA');
    })
    .catch(err => {
        console.error('❌ ERROR de conexión a Base de Datos:', err.code);
        console.error('   Revisa si MySQL está encendido (sudo service mysql start)');
    });

module.exports = pool;