
export function obtenerRol() {
  return localStorage.getItem("rol");
}

export function guardarRol(rol) {
  localStorage.setItem("rol", rol);
}

// Mostrar el nombre y rol del usuario en el encabezado //
export function mostrarRolEnHeader() {
  const rol = obtenerRol();
  const usuarioGuardado = localStorage.getItem("usuario");
  const titulo = document.getElementById("rolTitulo");

  if (!titulo) return;
  let nombre = "";

  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    nombre = usuario.usuario;
  }

  let textoRol = "";

  if (rol === "jefe") textoRol = "Jefe de área";
  if (rol === "solicitante") textoRol = "Solicitante";
  if (rol === "colaborador") textoRol = "Colaborador";

  titulo.textContent = `${textoRol} - ${nombre}`;
}

export function aplicarPermisos() {
  
  const rol = obtenerRol();
  const asignar = document.getElementById("asignar") ;
  const Tasignar = document.getElementById("Tasignar");
  const aprobar = document.getElementById("aprobar");
  const Taprobar = document.getElementById("Taprobar");

  if (rol !== "jefe" && asignar) asignar.style.display = "none";
  if (rol !== "jefe" && Tasignar) Tasignar.style.display = "none";
  if (rol !== "jefe" && rol !== "solicitante" && aprobar) aprobar.style.display = "none";
  if (rol !== "jefe" && rol !== "solicitante" && Taprobar) Taprobar.style.display = "none";
} 