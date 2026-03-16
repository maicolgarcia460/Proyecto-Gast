import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();
  aplicarPermisos();

  document.addEventListener("click", (e) => {

  const tarjeta = e.target.closest("[data-soporte]");
  const panel = document.getElementById("tarjetaSoporte");

  if (tarjeta && panel) {
    panel.classList.remove("hidden");
  }

  if (!tarjeta && panel && !panel.contains(e.target)) {
    panel.classList.add("hidden");
  }

});

  new Chart(document.getElementById('graficoPastel'), {
    type: 'pie',
    data: {
      labels: ['Completadas', 'Pendientes', 'Con retraso', 'En revisión'],
      datasets: [{
        data: [40, 25, 20, 15],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#E53935']
      }]
    }
  });

  new Chart(document.getElementById('graficoBarras'), {
    type: 'bar',
    data: {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      datasets: [{
        data: [12, 19, 8, 15],
        backgroundColor: '#36A2EB'
      }]
    }
  });

  new Chart(document.getElementById('graficoLineas'), {
    type: 'line',
    data: {
      labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
      datasets: [{
        data: [15, 25, 30, 45, 60, 80],
        borderColor: '#E53935',
        fill: true
      }]
    }
  });
});