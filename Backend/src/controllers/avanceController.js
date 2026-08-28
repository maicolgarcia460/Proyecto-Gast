const AvanceModel = require('../models/avanceModel');
const { validarAvance } = require("../utils/validacion");
const fs = require("fs");

const eliminarArchivoTemporal = (archivo) => {
  if (archivo?.path) fs.unlink(archivo.path, () => {});
};

// Creación de un avance //
const crearAvance = (req, res) => {
  const archivo = req.file;
  const data = req.body;
  const errorValidacion = validarAvance(data);
  if (errorValidacion) {
    eliminarArchivoTemporal(archivo);
    return res.status(400).json({ mensaje: errorValidacion });
  }

  AvanceModel.registrar(data, archivo, (error, estaFinalizado) => {
    if (error) {
      eliminarArchivoTemporal(archivo);
      console.log("ERROR AVANCE:", error);
      return res.status(500).json({ mensaje: "Error al guardar avance" });
    }

    const mensaje = estaFinalizado
      ? "Avance 100% registrado y enviado a revisión"
      : "Avance registrado correctamente";
    return res.status(200).json({ mensaje });
  });
};

// Obtener todos los avances //
const obtenerAvances = (req, res) => {
  const { id } = req.params;

  AvanceModel.obtenerPorSolicitud(id, (error, results) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.json(results);
  });
};

module.exports = { crearAvance, obtenerAvances };