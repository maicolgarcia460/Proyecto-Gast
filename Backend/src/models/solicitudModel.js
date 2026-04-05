const db = require('../config/dataBase');

class SolicitudModel {

// Creación de una solicitud //
  static crear(data, callback) {
    const sql = `
      INSERT INTO solicitud 
      (nombre, descripcion, area, tipo_trabajo, prioridad, tiempo_estimado, fecha_de_entrega, idUsuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      data.nombre,
      data.descripcion,
      data.area,
      data.tipo_trabajo,
      data.prioridad,
      data.tiempo_estimado,
      data.fecha_de_entrega,
      data.idUsuario
    ];

    db.query(sql, valores, (err, result) => {
    if (err) {
      console.log("ERROR INSERT SOLICITUD:", err);
      return callback(err);
    }

    console.log("Solicitud creada con ID:", result.insertId);
    const idSolicitud = result.insertId;
    const sqlEstado = `
      INSERT INTO estado_solicitud
      (idSolicitud, estado, fecha_cambio, comentario)
      VALUES (?, 'pendiente', NOW(), 'Solicitud creada')
    `;

    db.query(sqlEstado, [idSolicitud], (err2, result2) => {
      if (err2) {
        console.log("ERROR INSERT ESTADO:", err2);
        return callback(err2);
      }

      console.log("Estado creado correctamente");
      callback(null, result);
    });
  });
}

// Obtencion de una solicitud //
  static obtener(callback) {
  const sql = `
    SELECT s.*,
    (
    SELECT a.descripcion
    FROM avance a
    WHERE a.idSolicitud = s.idSolicitud
    ORDER BY a.fecha_avance DESC
    LIMIT 1
    ) AS ultimo_avance
    FROM solicitud s
  `;
  db.query(sql, callback);
  }

// Eliminación de una solicitud //
  static eliminar(id, callback) {
  const sql = "DELETE FROM solicitud WHERE idSolicitud = ?";

  db.query(sql, [id], (error, result) => {
    if (error) {
      return callback(error, null);
    }

    callback(null, result);
  });
}

// Edición de una solicitud //
  static actualizar(id, data, callback) {
  const sql = `
    UPDATE solicitud 
    SET nombre = ?, descripcion = ?, area = ?, tipo_trabajo = ?, 
        prioridad = ?, tiempo_estimado = ?, fecha_de_entrega = ?
    WHERE idSolicitud = ?
  `;

  const valores = [
    data.nombre,
    data.descripcion,
    data.area,
    data.tipo_trabajo,
    data.prioridad,
    data.tiempo_estimado,
    data.fecha_de_entrega,
    id
  ];

  db.query(sql, valores, callback);
}

// Asignación de una solicitud //
  static asignarSolicitud(idSolicitud, idUsuario, observaciones, callback) {
  const sqlAsignar = `
    INSERT INTO solicitud_asignada (idSolicitud, idUsuario, fecha_asignacion, observaciones)
    VALUES (?, ?, NOW(), ?)
  `;

  db.query(sqlAsignar, [idSolicitud, idUsuario, observaciones], (err) => {
    if (err) return callback(err);

    const sqlEstado = `
      UPDATE estado_solicitud
      SET estado = 'asignada',
          fecha_cambio = NOW()
      WHERE idSolicitud = ?
    `;

    db.query(sqlEstado, [idSolicitud], callback);
  });
}

// Obtener solicitudes asignadas por colaboradores //
  static obtenerPorColaborador(idUsuario, callback) {
  const sql = `
    SELECT s.*
    FROM solicitud s
    INNER JOIN solicitud_asignada sa
      ON s.idSolicitud = sa.idSolicitud
    WHERE sa.idUsuario = ?
  `;

  db.query(sql, [idUsuario], callback);
}

// Obtener solicitudes pendientes //
  static obtenerPendientes(callback) {
  const sql = `
    SELECT s.*,
    (
      SELECT e.estado
      FROM estado_solicitud e
      WHERE e.idSolicitud = s.idSolicitud
      ORDER BY e.fecha_cambio DESC
      LIMIT 1
    ) AS estado
    FROM solicitud s
  `;

  db.query(sql, callback);
}

// Obtener solicitudes en revisión //
  static obtenerEnRevision(callback) {
  const sql = `
    SELECT s.*
    FROM solicitud s
    INNER JOIN estado_solicitud e
      ON s.idSolicitud = e.idSolicitud
    WHERE e.idEstado_solicitud = (
        SELECT MAX(e2.idEstado_solicitud)
        FROM estado_solicitud e2
        WHERE e2.idSolicitud = s.idSolicitud
    )
    AND e.estado = 'en-revision'
  `;

  db.query(sql, callback);
}

}
module.exports = SolicitudModel;