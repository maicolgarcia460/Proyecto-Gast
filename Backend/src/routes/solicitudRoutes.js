const express = require('express');
const router = express.Router();

const { crearSolicitud, obtenerSolicitudes, eliminarSolicitud, actualizarSolicitud, asignarSolicitud, 
    obtenerPendientes, obtenerSolicitudesPorColaborador, obtenerEnRevision } = require('../controllers/solicitudController');

router.post('/', crearSolicitud);
router.get('/', obtenerSolicitudes);
router.get('/pendientes', obtenerPendientes);
router.get('/en-revision', obtenerEnRevision);
router.get("/colaborador/:id", obtenerSolicitudesPorColaborador);
router.delete('/:id', eliminarSolicitud);
router.put('/:id', actualizarSolicitud);
router.post('/asignar', asignarSolicitud);

module.exports = router;