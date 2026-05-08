const multer = require("multer");
const path = require("path");

// Configuración del almacenamiento//
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "archivo/");
  },
  filename: function (req, file, cb) {
    const nombreUnico = Date.now() + path.extname(file.originalname);
    cb(null, nombreUnico);
  }
});

// Tipo de archivos permitidos //
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /pdf|jpg|jpeg|png|doc|docx/;
  const extension = path.extname(file.originalname).toLowerCase();

  if (tiposPermitidos.test(extension)) {
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