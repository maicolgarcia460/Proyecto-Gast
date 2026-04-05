const db = require('../config/dataBase');

class usuarioModel {
    static login(usuario, password, callback) {
        const sql = 'SELECT u.*, r.nombre AS rol FROM usuario u JOIN rol r ON u.idRol = r.idRol WHERE u.usuario = ? AND u.password = ?';
        db.query(sql, [usuario, password], callback);
    }

// iniciar sesión segun rol //
static obtenerColaboradores(callback) {
  const sql = `
      SELECT u.idUsuario, u.usuario
          FROM usuario u
          JOIN rol r ON u.idRol = r.idRol
          WHERE r.nombre = 'colaborador'
        `;
    db.query(sql, callback);
    }
}

module.exports = usuarioModel;