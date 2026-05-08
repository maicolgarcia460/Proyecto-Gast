const db = require("../config/dataBase");

class ArchivoModel {

  static crear(data, callback) {
    const sql = `
      INSERT INTO archivo
      (idSolicitud, nombre_archivo, nombre_original, tipo_archivo, version, fecha_subida)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    db.query(sql, [
      data.idSolicitud,
      data.nombre_archivo,
      data.nombre_original,
      data.tipo_archivo,
      data.version
    ], callback);
  }

  static obtenerPorSolicitud(idSolicitud, callback) {
    const sql = `
      SELECT *
      FROM archivo
      WHERE idSolicitud = ?
      ORDER BY fecha_subida DESC
    `;

    db.query(sql, [idSolicitud], callback);
  }

  static obtenerPorNombre(nombreGuardado, callback) {
  const sql = `
    SELECT *
    FROM archivo
    WHERE nombre_archivo = ?
  `;

  db.query(sql, [nombreGuardado], callback);
  }
}

module.exports = ArchivoModel;