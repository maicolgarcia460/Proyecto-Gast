const AvanceModel = require('../models/avanceModel');
const ArchivoModel = require("../models/archivoModel");

// Creación de un avance //
const crearAvance = (req, res) => {
  const archivo = req.file;
  const data = req.body;

  AvanceModel.crear(data, (error,) => {
    if (error) {
      console.log("ERROR AVANCE:", error);
      return res.status(500).json({ mensaje: "Error al guardar avance" });
    }

    // guardar el archivo //
    const guardarArchivo = (callback) => {

      if (!archivo) {
        return callback();
      }

      const dataArchivo = {
        idSolicitud: data.idSolicitud,
        nombre_archivo: archivo.filename,
        nombre_original: archivo.originalname,
        tipo_archivo: archivo.mimetype,
        version: "1.0"
      };

      ArchivoModel.crear(dataArchivo, (errArchivo) => {
        if (errArchivo) {
          return res.status(500).json({
            mensaje: "Avance guardado, pero error registrando archivo"
          });
        }
        callback();
      });
    };  
    guardarArchivo(() => {

    // Extración porcentaje desde la descripción //
    const match = data.descripcion.match(/(\d+)%/);
    const porcentaje = match ? parseInt(match[1]) : 0;

    // Si es 100%, cambiar el estado a revisión //
    if (data.descripcion.includes("100%")) {
      
      const idSolicitante = data.idUsuario;
      const idJefe = 1;

      AvanceModel.marcarEnRevision(data.idSolicitud, idSolicitante, idJefe, (errEstado) => {
        
        if (errEstado) {
          return res.status(500).json({ mensaje: "Error cambiando estado" });
        }

        return res.status(200).json({ mensaje: "Avance 100% registrado y enviado a revisión" });
      }
        );
      
    } else {
      return res.status(200).json({ mensaje: "Avance registrado correctamente" });
    }
    });
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