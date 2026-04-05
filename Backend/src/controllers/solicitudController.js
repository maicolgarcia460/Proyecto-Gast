const SolicitudModel = require('../models/solicitudModel');

// Creación de solicitudes //
const crearSolicitud = (req, res) => {
  const data = req.body;
  console.log("DATOS RECIBIDOS:", data);

  SolicitudModel.crear(data, (error, result) => {
    if (error) {
      console.log("ERROR:", error);
      return res.status(500).json(error);
    }
    res.json({
      mensaje: "Solicitud creada correctamente"
    });
  });
};

// Obtención de solicitudes //
const obtenerSolicitudes = (req, res) => {
  SolicitudModel.obtener((error, results) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.json(results);
  });
};

// Eliminar solicitudes //
const eliminarSolicitud = (req, res) => {
  const { id } = req.params;

  SolicitudModel.eliminar(id, (error) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al eliminar" });
    }
    res.json({ mensaje: "Solicitud eliminada correctamente" });
  });
};

// Actualización de solicitudes //
const actualizarSolicitud = (req, res) => {
  const { id } = req.params;
  const data = req.body;
  console.log("ID RECIBIDO:", id);
  console.log("DATA RECIBIDA:", data);

  SolicitudModel.actualizar(id, data, (error, result) => {
    if (error) {
      console.log("ERROR UPDATE:", error);
      return res.status(500).json({ mensaje: "Error al actualizar" });
    }
    console.log("RESULTADO UPDATE:", result);
    res.json({ mensaje: "Solicitud actualizada correctamente" });
  });
};

// Asignación de solicitudes //
const asignarSolicitud = (req, res) => {
  const { idSolicitud, idUsuario, observaciones } = req.body;

  SolicitudModel.asignarSolicitud(idSolicitud, idUsuario, observaciones, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ mensaje: "Error al asignar solicitud" });
    }
    res.json({ mensaje: "Solicitud asignada correctamente" });
  });
};

// Obtención de solicitudes según colaborador //
const obtenerSolicitudesPorColaborador = (req, res) => {
  const { id } = req.params;

  SolicitudModel.obtenerPorColaborador(id, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Obtencion de solicitudes pendientes //
const obtenerPendientes = (req, res) => {
  SolicitudModel.obtenerPendientes((error, results) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.json(results);
  });
};

// Obtencion de solicitudes para revisión //
const obtenerEnRevision = (req, res) => {
  SolicitudModel.obtenerEnRevision((err, results) => {
    if (err) {
      console.log("Error en revisión:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
};

module.exports = { crearSolicitud, obtenerSolicitudes, eliminarSolicitud, actualizarSolicitud, asignarSolicitud, 
  obtenerSolicitudesPorColaborador, obtenerPendientes, obtenerEnRevision };