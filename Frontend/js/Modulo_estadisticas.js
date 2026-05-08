import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";
import { mostrarMensajeSistema } from "./Mensaje_exitoso.js";

let graficoSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();
  aplicarPermisos();

  document.addEventListener("click", (e) => {
    
    const tarjeta = e.target.closest("[data-soporte]");
    const panel = document.getElementById("tarjetaSoporte");
    
    if (tarjeta && panel) {
    panel.classList.remove("hidden");
    graficoSeleccionado = tarjeta.querySelector("canvas");
    }

    if (!tarjeta && panel && !panel.contains(e.target)) {
      panel.classList.add("hidden");
    }
  });

  document.getElementById("btnConfirmar").addEventListener("click", async () => {
    
    if (!graficoSeleccionado) {
      mostrarMensajeSistema("Selecciona un gráfico primero.", "error");
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    // título del gráfico //
    const tarjeta = graficoSeleccionado.closest("[data-soporte]");
    const titulo = tarjeta.querySelector("h2").innerText;
 
    const fecha = new Date().toLocaleDateString();
    const imgGrafico = graficoSeleccionado.toDataURL("image/png", 1.0);
    const imgLogo = await cargarImagenBase64("assets/img/logo-gast.png");

    // Encabezado //
    pdf.setFillColor(191, 211, 230);
    pdf.rect(10, 10, 190, 40, "F");
    pdf.addImage(imgLogo, "PNG", 15, 17.5, 25, 25);
    pdf.setFontSize(18);
    pdf.setFont("domine", "bold");
    pdf.text("GAST - Gestión y asignacion de solicitudes de trabajo", 50, 30);
    pdf.setFontSize(12);
    pdf.setFont("domine", "normal");
    pdf.text(`Fecha de generación: ${fecha}`, 50, 37);

    // Titulo del grafico //
    pdf.setFontSize(16);
    pdf.setFont("domine", "bold");
    pdf.setTextColor(30, 136, 229);
    pdf.text(titulo, 105, 65, { align: "center" });

    // Descripcion //
    const descripcion = obtenerDescripcionGrafico(titulo);
    pdf.setFontSize(12);
    pdf.setFont("domine", "normal");
    pdf.setTextColor(0, 0, 0);
    const textoDividido = pdf.splitTextToSize(descripcion, 180);
    pdf.text(textoDividido, 15, 75);

    // Grafico //
    pdf.addImage(imgGrafico, "PNG", 55, 100, 100, 90,);

    // Pie de pagina //
    pdf.setFontSize(10);
    pdf.text("Documento generado automáticamente por el sistema GAST.", 105, 285, { align: "center" });
    
    const nombreLimpio = titulo
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "");
    const fechaArchivo = new Date().toISOString().split("T")[0];
    const nombreArchivo = `Reporte-${nombreLimpio}-${fechaArchivo}.pdf`;
    pdf.save(nombreArchivo);
    
    await fetch("http://localhost:3000/api/estadisticas/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idArchivo: nombreArchivo,
        tipo_estadistica: titulo
      })
    });
    
    mostrarMensajeSistema("Reporte estadístico generado correctamente",
      "exito"
    );
  });

  function cargarImagenBase64(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = url;
    });
  }

  function obtenerDescripcionGrafico(titulo) {
    
    const descripciones = {
      "Estado de solicitudes":
       "Este gráfico muestra la distribución actual de las solicitudes según su estado dentro del sistema. Permite identificar la carga operativa y el porcentaje de solicitudes completadas, en proceso o pendientes.",
      
      "Promedio de entregas al mes":
       "Este gráfico representa el promedio mensual de solicitudes entregadas. Permite analizar el comportamiento productivo y detectar meses con mayor o menor desempeño.",

      "Solicitudes completadas por año":
       "Este gráfico muestra la evolución anual de solicitudes completadas, permitiendo analizar tendencias de crecimiento y desempeño histórico del sistema.",

      "Solicitudes por áreas":
       "Este gráfico permite identificar qué áreas generan mayor cantidad de solicitudes, ayudando en la planificación de recursos y carga laboral.",

      "Solicitudes por colaboradores":
       "Este gráfico muestra la distribución de trabajo por colaborador asignado, permitiendo evaluar productividad individual.",

      "Solicitudes retrasadas por semana":
       "Este gráfico presenta la cantidad de solicitudes que presentan retrasos organizadas semanalmente, permitiendo identificar periodos críticos."
    };
    
    return descripciones[titulo] || "Reporte estadístico generado por el sistema GAST.";
  }

  async function cargarEstados() {
    const res = await fetch("http://localhost:3000/api/estadisticas/estados");
    const data = await res.json();
    const labels = data.map(item => item.estado);
    const valores = data.map(item => item.total);
    
    new Chart(document.getElementById("graficoEstados"), {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#E53935", "#9C27B0"           
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  async function cargarPromedioMes() {
    const res = await fetch("http://localhost:3000/api/estadisticas/promedio-mes");
    const data = await res.json();
    const mesesTexto = [ "", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"     
    ];
    
    const labels = data.map(item => mesesTexto[item.mes]);
    const valores = data.map(item => item.total);

    new Chart(document.getElementById("graficoPromedioMes"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Solicitudes completadas",
          data: valores,
          backgroundColor: "#36A2EB"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  async function cargarPorAnio() {
    const res = await fetch("http://localhost:3000/api/estadisticas/por-anio");
    const data = await res.json();
    const labels = data.map(item => item.anio);
    const valores = data.map(item => item.total);

    new Chart(document.getElementById("graficoPorAnio"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Completadas",
          data: valores,
          borderColor: "#E53935",
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  async function cargarPorArea() {
    const res = await fetch("http://localhost:3000/api/estadisticas/por-area");
    const data = await res.json();
    const labels = data.map(item => item.area);
    const valores = data.map(item => item.total);
    
    new Chart(document.getElementById("graficoAreas"), {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: ["#673AB7", "#3F51B5", "#009688", "#FF5722", "#795548"            
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  async function cargarPorColaborador() {
    const res = await fetch("http://localhost:3000/api/estadisticas/por-colaborador");
    const data = await res.json();
    const labels = data.map(item => item.usuario);
    const valores = data.map(item => item.total);

    new Chart(document.getElementById("graficoColaboradores"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Solicitudes asignadas",
          data: valores,
          backgroundColor: "#8BC34A"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  async function cargarRetrasadasSemana() {
    const res = await fetch("http://localhost:3000/api/estadisticas/retrasadas-semana");
    const data = await res.json();
    const labels = data.map(item => "Semana " + item.semana);
    const valores = data.map(item => item.total);

    new Chart(document.getElementById("graficoRetrasadas"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Retrasadas",
          data: valores,
          borderColor: "#F44336",
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

cargarEstados(); cargarPromedioMes(); cargarPorAnio(); cargarPorArea(); cargarPorColaborador(); cargarRetrasadasSemana();

});