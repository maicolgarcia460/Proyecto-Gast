const express = require('express');
const router = express.Router();
const aprobacionController = require('../controllers/aprobacionController');

router.post('/decidir', aprobacionController.decidir);

module.exports = router;