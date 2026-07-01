const AprobacionModel = require('../models/aprobacionModel');

// Controla (aprobacion o rechazo) //
const decidir = (req, res) => {
  const data = req.body;
  
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