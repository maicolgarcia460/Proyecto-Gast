const db = require('../config/dataBase');
const { ejecutarEnTransaccion } = require('../config/dataBase');

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

// Obtiene avance por solicitud //
const obtenerPorSolicitud = (idSolicitud, callback) => {
  const sql = `
    SELECT *
    FROM avance
    WHERE idSolicitud = ?
    ORDER BY fecha_avance DESC
  `;
  db.query(sql, [idSolicitud], callback);
};

const insertarRevision = async (conexion, idSolicitud, idSolicitante, idJefe) => {
  await conexion.execute(
    `INSERT INTO estado_solicitud (idSolicitud, estado)
     VALUES (?, 'en-revision')`,
    [idSolicitud]
  );

  await conexion.execute(
    `INSERT INTO aprobacion
     (idSolicitud, idUsuario, nivel_aprobacion, estado, fecha_aprobacion)
     VALUES
     (?, ?, 'Solicitante', 'pendiente', NOW()),
     (?, ?, 'jefe de área', 'pendiente', NOW())`,
    [idSolicitud, idSolicitante, idSolicitud, idJefe]
  );
};

const registrar = (data, archivo, callback) => {
  const estaFinalizado = data.descripcion.includes("100%");

  ejecutarEnTransaccion(async (conexion) => {
    await conexion.execute(
      `INSERT INTO avance
       (idSolicitud, idUsuario, descripcion, fecha_avance, tiene_bloqueo, detalle_bloqueo)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [data.idSolicitud, data.idUsuario, data.descripcion, data.tiene_bloqueo, data.detalle_bloqueo]
    );

    if (archivo) {
      await conexion.execute(
        `INSERT INTO archivo
         (idSolicitud, nombre_archivo, nombre_original, tipo_archivo, version, fecha_subida)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [data.idSolicitud, archivo.filename, archivo.originalname, archivo.mimetype, "1.0"]
      );
    }

    if (estaFinalizado) {
      await insertarRevision(conexion, data.idSolicitud, data.idUsuario, 1);
    }

    return estaFinalizado;
  }).then((estaFinalizado) => callback(null, estaFinalizado)).catch(callback);
};

// Colocar solicitudes en estado de revisión al subir un avance terminado //
const marcarEnRevision = (idSolicitud, idSolicitante, idJefe, callback) => {
  ejecutarEnTransaccion((conexion) =>
    insertarRevision(conexion, idSolicitud, idSolicitante, idJefe)
  ).then(() => callback(null)).catch(callback);
};

module.exports = { crear, obtenerPorSolicitud, registrar, marcarEnRevision };