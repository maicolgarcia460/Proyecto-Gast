const express = require('express');
const router = express.Router();

const { login, obtenerColaboradores } = require('../controllers/usuarioController');

router.post('/login', login);
router.get('/colaboradores', obtenerColaboradores);

module.exports = router;