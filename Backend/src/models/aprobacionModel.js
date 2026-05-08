const db = require('../config/dataBase');

const decidirAprobacion = (data, callback) => {

  // Actualizar decisión del rol //
  const sqlUpdate = `
    UPDATE aprobacion
    SET estado = ?, fecha_aprobacion = NOW(), comentario = ?
    WHERE idSolicitud = ? AND nivel_aprobacion = ?
  `;

  db.query( sqlUpdate,
    [data.estado, data.comentario || null, data.idSolicitud, data.nivel_aprobacion],
    (err) => {
      
      if (err) return callback(err);

      // Verificación de estados //
      const sqlVerificar = `
        SELECT estado FROM aprobacion
        WHERE idSolicitud = ?
      `;

      db.query(sqlVerificar, [data.idSolicitud], (err2, results) => {

        if (err2) return callback(err2);
        const estados = results.map(r => r.estado);

        let nuevoEstado = null;

        // Si alguno rechaza //
        if (estados.includes("rechazada")) {
          nuevoEstado = "rechazada";
        }

        // Si ambos aprueban //
        else if (estados.length === 2 && estados.every(e => e === "aprobada")) {
          nuevoEstado = "aprobada";
        }

        // Si falta uno para aprobar //
        if (!nuevoEstado) {
          return callback(null);
        }

        // Insertar nuevo estado en historial //
        const sqlEstado = `
          INSERT INTO estado_solicitud (idSolicitud, estado, fecha_cambio)
          VALUES (?, ?, NOW())
        `;

        db.query(sqlEstado, [data.idSolicitud, nuevoEstado], callback);
      });
    }
  );
};

module.exports = { decidirAprobacion };