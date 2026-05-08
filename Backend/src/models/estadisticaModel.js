const db = require("../config/dataBase");

class EstadisticasModel {

  // Estados de solicitudes //
  static obtenerEstados(callback) {
    const sql = `
      SELECT estado, COUNT(*) as total
      FROM estado_solicitud
      GROUP BY estado
    `;
    db.query(sql, callback);
  }

  // Promedio de entregas por mes //
  static promedioEntregasMes(callback) {
    const sql = `
      SELECT 
        MONTH(fecha_cambio) as mes,
        COUNT(*) as total
      FROM estado_solicitud
      WHERE estado = 'completada'
      GROUP BY MONTH(fecha_cambio)
      ORDER BY mes
    `;
    db.query(sql, callback);
  }

  // Solicitudes completadas por año //
  static completadasPorAnio(callback) {
    const sql = `
      SELECT 
        YEAR(fecha_cambio) as anio,
        COUNT(*) as total
      FROM estado_solicitud
      WHERE estado = 'completada'
      GROUP BY YEAR(fecha_cambio)
      ORDER BY anio
    `;
    db.query(sql, callback);
  }

  // Solicitudes por áreas //
  static solicitudesPorArea(callback) {
    const sql = `
      SELECT area, COUNT(*) as total
      FROM solicitud
      GROUP BY area
    `;
    db.query(sql, callback);
  }

  // Solicitudes por colaborador asignado //
  static solicitudesPorColaborador(callback) {
    const sql = `
    SELECT u.usuario, COUNT(sa.idSolicitud) as total
    FROM solicitud_asignada sa
    JOIN usuario u ON sa.idUsuario = u.idUsuario
    GROUP BY u.usuario
    ORDER BY total DESC
  `;
  db.query(sql, callback);
}

  // Solicitudes retrasadas por semana //
  static retrasadasPorSemana(callback) {
    const sql = `
      SELECT 
        WEEK(fecha_cambio) as semana,
        COUNT(*) as total
      FROM estado_solicitud
      WHERE estado = 'retrasada'
      GROUP BY WEEK(fecha_cambio)
      ORDER BY semana
    `;
    db.query(sql, callback);
  }

  // Registro del reporte estadístico //
  static registrarReporte(data, callback) {
    const sql = `
      INSERT INTO estadisticas 
      (idArchivo, tipo_estadistica, fecha_registro)
      VALUES (?, ?, CURDATE())
    `;
    
    db.query(sql, [data.idArchivo, data.tipo_estadistica], callback);
  }
}

module.exports = EstadisticasModel;