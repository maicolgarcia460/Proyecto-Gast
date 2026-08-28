const { ejecutarEnTransaccion } = require('../config/dataBase');

const decidirAprobacion = (data, callback) => {

  // Actualizar decisión del rol //
  const sqlUpdate = `
    UPDATE aprobacion
    SET estado = ?, fecha_aprobacion = NOW(), comentario = ?
    WHERE idSolicitud = ? AND nivel_aprobacion = ?
  `;

  ejecutarEnTransaccion(async (conexion) => {
    await conexion.execute(sqlUpdate, [
      data.estado,
      data.comentario || null,
      data.idSolicitud,
      data.nivel_aprobacion
    ]);

    const [results] = await conexion.execute(
      `SELECT estado FROM aprobacion WHERE idSolicitud = ? FOR UPDATE`,
      [data.idSolicitud]
    );
    const estados = results.map((registro) => registro.estado);
    let nuevoEstado = null;

    if (estados.includes("rechazada")) {
      nuevoEstado = "rechazada";
    } else if (estados.length === 2 && estados.every((estado) => estado === "aprobada")) {
      nuevoEstado = "aprobada";
    }

    if (nuevoEstado) {
      await conexion.execute(
        `INSERT INTO estado_solicitud (idSolicitud, estado, fecha_cambio)
         VALUES (?, ?, NOW())`,
        [data.idSolicitud, nuevoEstado]
      );
    }
  }).then(() => callback(null)).catch(callback);
};

module.exports = { decidirAprobacion };