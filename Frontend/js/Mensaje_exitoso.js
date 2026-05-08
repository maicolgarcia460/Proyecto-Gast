import { mostrarRolEnHeader } from "./Roles.js";

// Mensaje global en el sistema //
export function mostrarMensajeSistema(mensaje, tipo = "exito") {

  localStorage.setItem("mensaje", mensaje);
  localStorage.setItem("tipoMensaje", tipo);
  localStorage.setItem("paginaRetorno", window.location.pathname);

  window.location.href = "Mensaje_proceso_exitoso.html";
}

// Mensaje para confirmación //
export function mostrarConfirmacion(mensaje, callbackConfirmar) {
  
  const modal = document.getElementById("modalConfirmacion");
  const mensajeTexto = document.getElementById("mensajeConfirmacion");
  const btnAceptar = document.getElementById("btnAceptarConfirmacion");
  const btnCancelar = document.getElementById("btnCancelarConfirmacion");
  
  if (!modal || !mensajeTexto || !btnAceptar || !btnCancelar) return;
  mensajeTexto.textContent = mensaje;
  modal.classList.remove("hidden");
  
  const nuevoBtnAceptar = btnAceptar.cloneNode(true);
  btnAceptar.parentNode.replaceChild(nuevoBtnAceptar, btnAceptar);
  
  nuevoBtnAceptar.addEventListener("click", () => {
    modal.classList.add("hidden");
    callbackConfirmar();
  });

  btnCancelar.onclick = () => {
    modal.classList.add("hidden");
  };
}

document.addEventListener("DOMContentLoaded", () => {

  mostrarRolEnHeader();

  const mensaje = localStorage.getItem("mensaje");
  const tipo = localStorage.getItem("tipoMensaje") || "exito";
  const paginaRetorno = localStorage.getItem("paginaRetorno");

  const contenedor = document.getElementById("mensajeTexto");
  const tarjeta = document.querySelector(".bg-white");
  const icono = tarjeta.querySelector("div");

  if (contenedor && mensaje) {
    contenedor.textContent = mensaje;
  }

  // Cambiar estilo según tipo de mensaje //
  if (!tarjeta || !icono) return;

  switch (tipo) {

    case "error":
      tarjeta.classList.add("border-red-600");
      icono.textContent = "✕";
      icono.className = "text-red-600 text-6xl font-bold mb-6";
      break;

    case "advertencia":
      tarjeta.classList.add("border-yellow-500");
      icono.textContent = "⚠";
      icono.className = "text-yellow-500 text-6xl font-bold mb-6";
      break;

    case "info":
      tarjeta.classList.add("border-blue-600");
      icono.textContent = "ℹ";
      icono.className = "text-blue-600 text-6xl font-bold mb-6";
      break;

    default:
      tarjeta.classList.add("border-[#43A047]");
      icono.textContent = "✓";
      icono.className = "text-[#43A047] text-6xl font-bold mb-6";
  }

  // Redirigir después de segundos //
  setTimeout(() => {

    localStorage.removeItem("mensaje");
    localStorage.removeItem("tipoMensaje");
    localStorage.removeItem("paginaRetorno");

    if (paginaRetorno) {
      window.location.href = paginaRetorno;
    } else {
      history.back();
    }

  }, 2000);

});