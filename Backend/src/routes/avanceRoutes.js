const express = require('express');
const router = express.Router();

const { crearAvance, obtenerAvances} = require('../controllers/avanceController');

router.post('/', crearAvance);
router.get('/:id', obtenerAvances);

module.exports = router;