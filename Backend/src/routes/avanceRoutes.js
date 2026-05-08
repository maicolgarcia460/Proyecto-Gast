const express = require('express');
const router = express.Router();
const upload = require("../../middlewares/upload");

const { crearAvance, obtenerAvances} = require('../controllers/avanceController');

router.post('/', upload.single("archivo"), crearAvance);
router.get('/:id', obtenerAvances);

module.exports = router;