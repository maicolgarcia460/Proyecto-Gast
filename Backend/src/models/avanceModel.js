const db = require('../config/dataBase');
const { obtenerEnRevision } = require('./solicitudModel');

// Creación de un avance en la solicitud //
const crear = (data, callback) => {
  const sql = `
    INSERT INTO avance 
    (idSolicitud, idUsuario, descripcion, fecha_avance, tiene_bloqueo, detalle_bloqueo)
    VALUES (?, ?, ?, NOW(), ?, ?)
  `;

  db.query(sql, [
    data.idSolicitud,
    data.idUsuario,
    data.descripcion,
    data.tiene_bloqueo,
    data.detalle_bloqueo
  ], callback);
};

const obtenerPorSolicitud = (idSolicitud, callback) => {
  const sql = `
    SELECT *
    FROM avance
    WHERE idSolicitud = ?
    ORDER BY fecha_avance DESC
  `;
  db.query(sql, [idSolicitud], callback);
};

// Colocar solicitudes en estado de revisión al subir un avance de terminado //
const marcarEnRevision = (idSolicitud, callback) => {
  const sqlEstado = `
        INSERT INTO estado_solicitud (idSolicitud, estado)
        VALUES (?, 'en-revision')
      `;

       db.query(sqlEstado, [idSolicitud], (errEstado, resultEstado) => {

    if (errEstado) {
      console.log("Error cambiando estado:", errEstado);
      return callback(errEstado);
    }

  const sqlAprobacion = `
        INSERT INTO aprobacion
        (idSolicitud, idUsuario, nivel_aprobacion, estado, fecha_aprobacion)
        VALUES
        (?, ?, 'Solicitante', 'pendiente', NOW()),
        (?, ?, 'jefe de área', 'pendiente', NOW())
      `;

       db.query(sqlAprobacion, [idSolicitud, idSolicitud], (errAprobacion, resultAprobacion) => {

      if (errAprobacion) {
        console.log("Error creando registros de aprobación:", errAprobacion);
        return callback(errAprobacion);
      }

      callback(null, {
        estado: resultEstado,
        aprobacion: resultAprobacion
      });
    });
  });
};

module.exports = { crear, obtenerPorSolicitud, obtenerEnRevision, marcarEnRevision};