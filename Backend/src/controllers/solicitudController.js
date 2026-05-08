const SolicitudModel = require('../models/solicitudModel');

// Creación de solicitudes //
const crearSolicitud = (req, res) => {
  const data = req.body;

  SolicitudModel.crear(data, (error, result) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.json({
      mensaje: "Solicitud registrada correctamente"
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

  SolicitudModel.actualizar(id, data, (error, result) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al actualizar" });
    }
    res.json({ mensaje: "Solicitud actualizada correctamente" });
  });
};

// Asignación de solicitudes //
const asignarSolicitud = (req, res) => {
  const { idSolicitud, idUsuario, observaciones, prioridad_jefe } = req.body;

  SolicitudModel.asignarSolicitud(idSolicitud, idUsuario, observaciones, prioridad_jefe, (error) => {
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

// Obtención de solicitudes según solicitantes //
const obtenerSolicitudesPorSolicitante = (req, res) => {
  const { idUsuario } = req.params;

  SolicitudModel.obtenerPorSolicitante(idUsuario, (err, results) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error obteniendo solicitudes" });
    }
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
      return res.status(500).json(err);
    }
    res.json(results);
  });
};

//Obtención de solicitudes para panel de detalle //
const obtenerSolicitudPorId = (req, res) => {
  const { id } = req.params;

  SolicitudModel.obtenerPorId(id, (error, results) => {
    if (error) {
      return res.status(500).json(error);
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }
    res.json(results[0]);
  });
};

module.exports = { crearSolicitud, obtenerSolicitudes, eliminarSolicitud, actualizarSolicitud, asignarSolicitud, 
  obtenerSolicitudesPorColaborador, obtenerPendientes, obtenerEnRevision, obtenerSolicitudesPorSolicitante, obtenerSolicitudPorId };