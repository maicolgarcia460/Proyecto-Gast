const PDFDocument = require("pdfkit");
const db = require("../config/dataBase");

// Generación de PDF //
const generarPDF = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM solicitud WHERE idSolicitud = ?";

  db.query(sql, [id], (error, results) => {
    if (error || results.length === 0) {
      return res.status(500).send("Error al generar reporte");
    }

    const solicitud = results[0];
    const doc = new PDFDocument();
    const path = require("path");

const logoPath = path.join(
  __dirname,
  "../../../Frontend/assets/img/logo-gast.png"
);

doc.image(logoPath, 50, 40, { width: 60 });

    res.setHeader("Content-Type", "application/pdf");
    
    const nombreLimpio = solicitud.nombre
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, "-")
  .replace(/[^\w\-]/g, "");

res.setHeader(
  "Content-Disposition",
  `attachment; filename=reporte-${nombreLimpio}.pdf`
);

    doc.pipe(res);
    doc.moveDown(3);
doc
  .fontSize(22)
  .fillColor("#1E88E5")
  .text("REPORTE DE SOLICITUD", { align: "center" });

doc.moveDown(2);
doc.fillColor("black").fontSize(12);
doc.text(`Nombre: ${solicitud.nombre}`);
doc.moveDown(0.5);
doc.text(`Descripción: ${solicitud.descripcion}`);
doc.moveDown(0.5);
doc.text(`Área: ${solicitud.area}`);
doc.moveDown(0.5);
doc.text(`Tipo de trabajo: ${solicitud.tipo_trabajo}`);
doc.moveDown(0.5);
doc.text(`Prioridad: ${solicitud.prioridad}`);
doc.moveDown(0.5);
doc.text(`Tiempo estimado: ${solicitud.tiempo_estimado}`);
doc.moveDown(0.5);
doc.text(`Fecha de entrega: ${
  solicitud.fecha_de_entrega
    ? solicitud.fecha_de_entrega.toISOString().split("T")[0]
    : "No definida"
}`);

// Bloque de historial de avances en el PDF //
const sqlAvances = `
  SELECT descripcion, fecha_avance
  FROM avance
  WHERE idSolicitud = ?
  ORDER BY fecha_avance DESC
`;

db.query(sqlAvances, [id], (errAv, avances) => {

  if (errAv) {
    console.error("Error al obtener avances:", errAv);
    doc.moveDown(2);
    doc.fontSize(14).fillColor("red").text("Error al cargar avances.");
    doc.end();
    return;
  }

  doc.moveDown(2);
  doc.fontSize(16).fillColor("#1E88E5").text("Historial de avances");
  doc.moveDown(1);
  doc.fillColor("black").fontSize(11);
  if (!avances || avances.length === 0) {
    doc.text("No hay avances registrados.");
  } else {
    avances.forEach((avance, index) => {
      doc.moveDown(0.5);
      doc.text(`Avance #${index + 1}`);
      doc.text(`Descripción: ${avance.descripcion}`);
      doc.text(`Fecha: ${
        avance.fecha_avance
          ? new Date(avance.fecha_avance).toISOString().split("T")[0]
          : "Sin fecha"
      }`);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    });
  }

  const sqlInsertReporte = `
  INSERT INTO reporte (idSolicitud, tipo_reporte, Fecha_generacion, formato)
  VALUES (?, ?, NOW(), ?)
`;

db.query(sqlInsertReporte, [id, "Reporte general", "pdf"]);
  doc.end();
});
  });
};

module.exports = { generarPDF };