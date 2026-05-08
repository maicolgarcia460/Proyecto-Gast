const express = require("express");
const router = express.Router();
const EstadisticasController = require("../controllers/estadisticaController");

router.get('/estados', EstadisticasController.estados);
router.get('/promedio-mes', EstadisticasController.promedioMes);
router.get("/por-anio", EstadisticasController.porAnio);
router.get("/por-area", EstadisticasController.porArea);
router.get("/por-colaborador", EstadisticasController.porColaborador);
router.get("/retrasadas-semana", EstadisticasController.retrasadasSemana);
router.post("/registrar", EstadisticasController.registrarReporte);

module.exports = router;