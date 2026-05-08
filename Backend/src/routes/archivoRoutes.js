const express = require("express");
const router = express.Router();
const path = require("path");
const ArchivoModel = require("../models/archivoModel");

router.get("/:idSolicitud", (req, res) => {

  const { idSolicitud } = req.params;

  ArchivoModel.obtenerPorSolicitud(idSolicitud, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });

});

router.get("/descargar/:nombreGuardado", (req, res) => {

  const { nombreGuardado } = req.params;
  const rutaArchivo = path.join(__dirname, "../../archivo", nombreGuardado);

  ArchivoModel.obtenerPorNombre(nombreGuardado, (err, results) => {

    if (err || results.length === 0) {
      return res.status(404).send("Archivo no encontrado");
    }

    const nombreOriginal = results[0].nombre_original;
    res.download(rutaArchivo, nombreOriginal);
  });
});

module.exports = router;