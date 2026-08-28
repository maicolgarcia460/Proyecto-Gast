const multer = require("multer");
const path = require("path");
const CARPETA_ARCHIVOS = path.resolve(__dirname, "../archivo");
const EXTENSIONES_PERMITIDAS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]);

// Configuración del almacenamiento//
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, CARPETA_ARCHIVOS);
  },
  filename: function (req, file, cb) {
    const nombreUnico = Date.now() + path.extname(file.originalname);
    cb(null, nombreUnico);
  }
});

// Tipo de archivos permitidos //
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (EXTENSIONES_PERMITIDAS.has(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"));
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;