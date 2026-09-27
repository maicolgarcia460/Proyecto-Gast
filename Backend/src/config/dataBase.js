// Configuración de conexión a MySQL //
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bd_gast',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0
});

db.getConnection((error, connection) => {
    if (error) {
        console.error('Error de conexión:', error);
    } else {
        console.log('Conectado a MySQL');
        connection.release();
    }
});

async function ejecutarEnTransaccion(tarea) {
    const conexion = await db.promise().getConnection();

    try {
        await conexion.beginTransaction();
        const resultado = await tarea(conexion);
        await conexion.commit();
        return resultado;
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
}

module.exports = db;
module.exports.ejecutarEnTransaccion = ejecutarEnTransaccion;