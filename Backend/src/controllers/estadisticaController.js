const EstadisticasModel = require("../models/estadisticaModel");

class EstadisticasController {

  // Controla el grafico de estados de las solicitudes //
  static estados(req, res) {
    EstadisticasModel.obtenerEstados((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  // Controla el grafico de solicitudes promedio al mes //
  static promedioMes(req, res) {
    EstadisticasModel.promedioEntregasMes((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  // Controla el grafico de solicitudes por año //
  static porAnio(req, res) {
    EstadisticasModel.completadasPorAnio((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  // Controla el grafico de solicitudes por area //
  static porArea(req, res) {
    EstadisticasModel.solicitudesPorArea((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  // Controla el grafico de solicitudes por colaborador //
  static porColaborador(req, res) {
    EstadisticasModel.solicitudesPorColaborador((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  // Controla el grafico de solicitudes retrasadas por semana//
  static retrasadasSemana(req, res) {
    EstadisticasModel.retrasadasPorSemana((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  // Registra los reportes en la base de datos //
  static registrarReporte(req, res) {
    const data = req.body;
    EstadisticasModel.registrarReporte(data, (err, result) => {
      
      if (err) {
        console.error("Error registrando estadística:", err);
        return res.status(500).json({
          mensaje: "Error guardando estadística"
        });
      }
      
      res.json({
        mensaje: "Reporte estadístico registrado correctamente"
      });
    });
  }
}

module.exports = EstadisticasController;