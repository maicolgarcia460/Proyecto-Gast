import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";

document.addEventListener("DOMContentLoaded", () => {

  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "Inicio_sesion.html";
    return;
  }

  try {
    const usuarioParseado = JSON.parse(usuario);
    if (!usuarioParseado || !usuarioParseado.idUsuario) {
      window.location.href = "Inicio_sesion.html";
      return;
    }

  } catch (error) {
    window.location.href = "Inicio_sesion.html";
    return;
  }

  mostrarRolEnHeader();
  aplicarPermisos();

  // Botón para cerrar sesión //
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "Inicio_sesion.html";
    });
  }
});