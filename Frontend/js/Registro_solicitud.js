import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();
  aplicarPermisos();

const botonagregar = document.getElementById("botonagregar");
  const formularioSolicitud = document.getElementById("formularioSolicitud"); 

  if (botonagregar && formularioSolicitud) {
    botonagregar.addEventListener("click", () => {
      formularioSolicitud.classList.remove("hidden");
    });
  }
  
const botoncerrarformulario = document.getElementById("botoncerrarformulario");

  if (botoncerrarformulario && formularioSolicitud) {
    botoncerrarformulario.addEventListener("click", () => {
      formularioSolicitud.classList.add("hidden");
    });
  }
  
document.querySelectorAll("[data-menu]").forEach(boton => {
    boton.addEventListener("click", () => {

      const id = boton.dataset.menu;

      document.querySelectorAll('[id^="menu"]').forEach(menu =>
        menu.classList.add("hidden")
      );

      const menuSeleccionado = document.getElementById(id);
      if (menuSeleccionado) {
        menuSeleccionado.classList.toggle("hidden");
      }

    });
  });

  // Generar reporte //
  document.querySelectorAll("[data-reporte]").forEach(boton => {
  boton.addEventListener("click", () => {

    const nombre = boton.dataset.reporte;

    const texto = document.getElementById("solicitudSeleccionada");
    const panel = document.getElementById("panelReporte");

    if (texto && panel) {
      texto.textContent = "Solicitud seleccionada: " + nombre;
      panel.classList.remove("hidden");
    }

  });
});

// Subir avance //
  document.querySelectorAll("[data-detalle]").forEach(item => {
    item.addEventListener("click", () => {

      const nombre = item.dataset.detalle;

      const panel = document.getElementById("panelDetalle");
      const titulo = document.getElementById("tituloSolicitud");

      if (panel && titulo) {
        titulo.textContent = nombre;
        panel.classList.remove("hidden");
      }

    });
  });

  // Formulario avance //
  const botonsubiravance = document.getElementById("botonsubiravance");
  const formularioAvance = document.getElementById("formularioAvance");

  if (botonsubiravance && formularioAvance) {
    botonsubiravance.addEventListener("click", () => {
      formularioAvance.classList.remove("hidden");
    });
  }

document.querySelectorAll("[data-cerrar]").forEach(boton => {
  boton.addEventListener("click", () => {

    const id = boton.dataset.cerrar;
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.classList.add("hidden");
    }

  });
});
});