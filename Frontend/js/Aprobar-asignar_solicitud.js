import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();
  aplicarPermisos();

 // Mostrar panel de detalle //

  document.addEventListener("click", (e) => {
    const botonDetalle = e.target.closest("[data-detalle]");
    if (botonDetalle) {
      const nombre = botonDetalle.dataset.detalle;
      const panel = document.getElementById("panelDetalle");
      const titulo = document.getElementById("tituloSolicitud");
      if (panel && titulo) {
        titulo.textContent = nombre;
        panel.classList.remove("hidden");
      }
    }
  });

  // Cerrar el panel //

  document.addEventListener("click", (e) => {
    const botonCerrar = e.target.closest("[data-cerrar='panelDetalle']");
    if (botonCerrar) {
      const panel = document.getElementById("panelDetalle");
      if (panel) {
        panel.classList.add("hidden");
      }
    }
  });
});