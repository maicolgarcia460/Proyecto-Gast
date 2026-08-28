const AprobacionModel = require('../models/aprobacionModel');
const { validarDecision } = require("../utils/validacion");

// Controla (aprobacion o rechazo) //
const decidir = (req, res) => {
  const data = req.body;
  const errorValidacion = validarDecision(data);
  if (errorValidacion) return res.status(400).json({ mensaje: errorValidacion });
  
  AprobacionModel.decidirAprobacion(data, (err) => {
    
    if (err) {
      console.log("Error decisión:", err);
      return res.status(500).json({
        mensaje: "Error procesando decisión"
      });
    }

    res.json({
      mensaje: "Decisión registrada correctamente"
    });
  });
};

module.exports = { decidir };