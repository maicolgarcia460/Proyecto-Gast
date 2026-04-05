import { mostrarRolEnHeader } from "./Roles.js";

document.addEventListener("DOMContentLoaded", () => { mostrarRolEnHeader();

  const mensaje = localStorage.getItem("mensaje");
  const contenedor = document.getElementById("mensajeTexto");

  if (contenedor && mensaje) {
    contenedor.textContent = mensaje;
  }

  // Limpiar el mensaje //
  localStorage.removeItem("mensaje");

  // Volver automáticamente //
  setTimeout(() => { history.back();
  }, 1500);
});