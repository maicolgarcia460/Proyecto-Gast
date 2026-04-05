import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";

let solicitudActual = null;

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();
  aplicarPermisos();
  cargarSolicitudesPendientes();
  cargarColaboradores();

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

  // Botón de asignar final //
    const btnAsignar = document.getElementById("btnAsignar");
    if (btnAsignar) {
    btnAsignar.addEventListener("click", asignarSolicitud);
    }

  // Cerrar el panel //
  document.addEventListener("click", (e) => {
    const botonCerrar = e.target.closest("[data-cerrar='panelDetalle']");
    if (botonCerrar) {
      document.getElementById("panelDetalle").classList.add("hidden");
    }
  });
});

// Cargar solicitudes según el rol //
function cargarSolicitudesPendientes() {

  const rol = localStorage.getItem("rol");
  const idUsuario = localStorage.getItem("idUsuario");
  console.log("ROL:", rol);
  console.log("ID USUARIO:", idUsuario);
  const contenedor = document.getElementById("listaSolicitudes");
  const template = document.getElementById("templateSolicitud");

  contenedor.innerHTML = "";

  // Si es un colaborador //
  if (rol === "colaborador") {
    fetch(`http://localhost:3000/api/solicitudes/colaborador/${idUsuario}`)
      .then(res => res.json())
      .then(data => {

        console.log("SOLICITUDES DEL COLABORADOR:", data);

        data.forEach(solicitud => {

          const clone = template.content.cloneNode(true);
          const nombre = clone.querySelector(".nombreSolicitud");
          const boton = clone.querySelector(".btnAsignar");

          nombre.textContent =
            `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;

          if (boton) boton.remove();

          contenedor.appendChild(clone);
        });
      })
      .catch(error => console.error("Error:", error));
  }

  //  Si es el jefe de área //
  else {
    fetch("http://localhost:3000/api/solicitudes/pendientes")
      .then(res => res.json())
      .then(data => {

        data.forEach(solicitud => {

          if (solicitud.estado !== "pendiente") return;

          const clone = template.content.cloneNode(true);
          const nombre = clone.querySelector(".nombreSolicitud");
          const boton = clone.querySelector(".btnAsignar");

          nombre.textContent =
            `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;

          boton.addEventListener("click", () => {
            solicitudActual = solicitud.idSolicitud;

            document.getElementById("tituloSolicitud").textContent =
              `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;

            document.getElementById("panelDetalle").classList.remove("hidden");
          });

          contenedor.appendChild(clone);
        });

      })
      .catch(error => console.error("Error:", error));
  }
}

// Cargar los colaboradores desde la base de datos //
function cargarColaboradores() {
  fetch("http://localhost:3000/api/usuarios/colaboradores")
    .then(res => res.json())
    .then(data => {

      const contenedor = document.getElementById("listaColaboradores");
      contenedor.innerHTML = "";

      data.forEach(colaborador => {

        const label = document.createElement("label");
        label.classList.add("flex", "items-center", "space-x-2");

        label.innerHTML = `
          <input type="radio" name="asignado" value="${colaborador.idUsuario}">
          <span class="font-semibold text-black">
            ${colaborador.usuario}
          </span> `;

        contenedor.appendChild(label);
      });
    })
    .catch(error => console.error("Error cargando colaboradores:", error));
}

// Asignacion de una solicitud //
async function asignarSolicitud() {

  if (!solicitudActual) {
    alert("No hay solicitud seleccionada");
    return;
  }

  const seleccionado = document.querySelector("input[name='asignado']:checked");
  if (!seleccionado) {
    alert("Debe seleccionar un colaborador");
    return;
  }

  const idUsuario = parseInt(seleccionado.value);
  try {
    const respuesta = await fetch(
      "http://localhost:3000/api/solicitudes/asignar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idSolicitud: solicitudActual,
          idUsuario,
          observaciones: "Asignado por el jefe de área"
        })
      }
    );

    const data = await respuesta.json();
    alert(data.mensaje);

    // Cerrar el panel //
    document.getElementById("panelDetalle").classList.add("hidden");

    // Recargar la lista //
    cargarSolicitudesPendientes();

  } catch (error) {
    console.error("Error:", error);
    alert("Error al asignar");
  }
}