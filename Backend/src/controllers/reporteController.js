const PDFDocument = require("pdfkit");
const db = require("../config/dataBase");
const path = require("path");

// Generación de PDF //
const generarPDF = (req, res) => {
  const { id } = req.params;
  
  const sql = "SELECT * FROM solicitud WHERE idSolicitud = ?";
  db.query(sql, [id], (error, results) => {
    if (error || results.length === 0) {
      return res.status(500).send("Error al generar reporte");
    }

    const solicitud = results[0];
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    
    const nombreLimpio = solicitud.nombre
     .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
     .replace(/\s+/g, "-")
     .replace(/[^\w\-]/g, "");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Reporte-${nombreLimpio}.pdf`
    );

    const fontRegular = path.join(__dirname, "../assets/fonts/Domine-Regular.ttf");
    const fontBold = path.join(__dirname, "../assets/fonts/Domine_Bold.ttf");
    doc.registerFont("Domine-Regular", fontRegular);
    doc.registerFont("Domine_Bold", fontBold);
    doc.pipe(res);

    // Franja superior //
    doc.rect(0, 0, doc.page.width, 120).fill("#BFD3E6");

    // Logo //
    const logoPath = path.join(
      __dirname,
      "../../../Frontend/assets/img/logo-gast.png"
    );

    doc.image(logoPath, 40, 20, { width: 80 });

    // Título //
    doc
      .moveDown(8)
      .fillColor("#1E88E5")
      .fontSize(20)
      .font("Domine_Bold")
      .text("Reporte de Solicitud", { align: "center" });

    doc.moveDown(1);

    // Tarjeta con información //
    const cardY = doc.y;
    const cardHeight = 150;
    doc
      .roundedRect(40, cardY, doc.page.width - 80, cardHeight, 8)
      .fillAndStroke("#F4F6F8", "#D0D5DD");

    let y = cardY + 15;

    const escribirCampo = (titulo, valor) => {
      doc.fontSize(10).fillColor("black");
      doc.font("Domine_Bold").text(`${titulo}: `, 55, y, { continued: true });
      doc.font("Domine-Regular").text(valor || "No definido");
      y += 18;
    };

    escribirCampo("Nombre", solicitud.nombre);
    escribirCampo("Descripción", solicitud.descripcion);
    escribirCampo("Área", solicitud.area);
    escribirCampo("Tipo de trabajo", solicitud.tipo_trabajo);
    escribirCampo("Prioridad", solicitud.prioridad);
    escribirCampo("Tiempo estimado", solicitud.tiempo_estimado);
    escribirCampo(
      "Fecha de entrega",
      solicitud.fecha_de_entrega
        ? new Date(solicitud.fecha_de_entrega).toISOString().split("T")[0]
        : "No definida"
    );

    // Franja de historial //
    const historialY = cardY + cardHeight + 30;

    doc.rect(0, historialY, doc.page.width, 20).fill("#BFD3E6");
    doc
      .fillColor("#1E88E5")
      .fontSize(20)
      .font("Domine_Bold")
      .text("Historial de Avances", 0, historialY + 45, { width: doc.page.width, align: "center" });

    // Tarjeta de avances //
    const sqlAvances = `
      SELECT descripcion, fecha_avance
      FROM avance
      WHERE idSolicitud = ?
      ORDER BY fecha_avance DESC
    `;

    db.query(sqlAvances, [id], (errAv, avances) => {

      let avanceY = historialY + 90;
      if (!avances || avances.length === 0) {
        doc
          .fillColor("black")
          .fontSize(10)
          .text("No hay avances registrados.", 50, avanceY);
      } else {

        avances.forEach((avance, index) => {

          doc
            .roundedRect(40, avanceY, doc.page.width - 80, 60, 8)
            .fillAndStroke("#F4F6F8", "#D0D5DD");
          doc.fillColor("black");
          doc.fontSize(9).font("Domine_Bold")
            .text(`Avance #${index + 1}`, 55, avanceY + 10);
          doc.font("Domine-Regular")
            .text(`Descripción: ${avance.descripcion}`, 55, avanceY + 25);
          doc.text(
            `Fecha: ${
              avance.fecha_avance
                ? new Date(avance.fecha_avance).toISOString().split("T")[0]
                : "Sin fecha"
            }`,
            55,
            avanceY + 40
          );
          avanceY += 75;
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