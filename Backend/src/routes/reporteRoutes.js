const express = require("express");
const router = express.Router();

const { generarPDF } = require("../controllers/reporteController");

router.get("/:id", generarPDF);

module.exports = router;