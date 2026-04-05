const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ramon0819',
    database: 'bd_gast'
});

db.connect((error) => {
    if (error) {
        console.log('Error de conexión:', error);
    } else {
        console.log('Conectado a MySQL');
    }
});

module.exports = db;