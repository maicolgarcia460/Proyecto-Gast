
export function obtenerRol() {
  return localStorage.getItem("rol");
}

export function guardarRol(rol) {
  localStorage.setItem("rol", rol);
}

export function mostrarRolEnHeader() {
  const rol = obtenerRol();
  const titulo = document.getElementById("rolTitulo");

  if (!titulo) return;

  if (rol === "jefe") titulo.textContent = "Jefe de área";
  if (rol === "solicitante") titulo.textContent = "Solicitante";
  if (rol === "colaborador") titulo.textContent = "Colaborador";
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