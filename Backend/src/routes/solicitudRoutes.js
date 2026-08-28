const express = require('express');
const router = express.Router();
const upload = require("../../middlewares/upload");

const { crearSolicitud, obtenerSolicitudes, eliminarSolicitud, actualizarSolicitud, asignarSolicitud, obtenerPendientes, obtenerSolicitudesPorColaborador, 
    obtenerEnRevision, obtenerSolicitudesPorSolicitante, obtenerSolicitudPorId } = require('../controllers/solicitudController');

router.post('/', upload.single("archivo"), crearSolicitud);
router.get('/', obtenerSolicitudes);
router.get('/pendientes', obtenerPendientes);
router.get('/en-revision', obtenerEnRevision);
router.get("/:id", obtenerSolicitudPorId);
router.get("/colaborador/:id", obtenerSolicitudesPorColaborador);
router.get("/solicitante/:idUsuario", obtenerSolicitudesPorSolicitante);
router.delete('/:id', eliminarSolicitud);
router.put('/:id', actualizarSolicitud);
router.post('/asignar', asignarSolicitud);

module.exports = router;