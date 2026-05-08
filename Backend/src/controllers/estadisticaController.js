const EstadisticasModel = require("../models/estadisticaModel");

class EstadisticasController {

  static estados(req, res) {
    EstadisticasModel.obtenerEstados((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  static promedioMes(req, res) {
    EstadisticasModel.promedioEntregasMes((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  static porAnio(req, res) {
    EstadisticasModel.completadasPorAnio((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  static porArea(req, res) {
    EstadisticasModel.solicitudesPorArea((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  static porColaborador(req, res) {
    EstadisticasModel.solicitudesPorColaborador((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

  static retrasadasSemana(req, res) {
    EstadisticasModel.retrasadasPorSemana((err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    });
  }

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