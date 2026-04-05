import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";

let solicitudActual = null;

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();
  aplicarPermisos();
  cargarSolicitudesEnRevision();
});

// Cargar solicitudes que esten en revisión //
function cargarSolicitudesEnRevision() {

    const rol = localStorage.getItem("rol");
    const idUsuario = localStorage.getItem("idUsuario");
    console.log("ROL:", rol);
    console.log("ID USUARIO:", idUsuario);

  fetch("http://localhost:3000/api/solicitudes/en-revision")
    .then(res => res.json())
    .then(data => {

      const contenedor = document.getElementById("listaSolicitudes");
      const template = document.getElementById("templateSolicitud");

      contenedor.innerHTML = "";

      data.forEach(solicitud => {

        if (solicitud.estado === "en-revision") return;

        const clone = template.content.cloneNode(true);
        const nombre = clone.querySelector(".nombreSolicitud");
        const boton = clone.querySelector(".btnAprobar");

        nombre.textContent =
          `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;

          // Botón para abrir el panel de detalle //
        if (boton) {
          boton.addEventListener("click", () => {
          solicitudActual = solicitud.idSolicitud;

            const titulo = document.getElementById("tituloSolicitud");
            const panel = document.getElementById("panelDetalle");

            if (titulo && panel) {
              titulo.textContent =
                `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;
              panel.classList.remove("hidden");
            }
          });
        }

        contenedor.appendChild(clone);
      });
    })
    .catch(error => console.error("Error cargando revisión:", error));
}

// Aprobación o rechazo de solicitudes //
document.getElementById("btnSi")?.addEventListener("click", () => {
  enviarDecision("aprobado");
});

document.getElementById("btnNo")?.addEventListener("click", () => {
  enviarDecision("rechazado");
});

async function enviarDecision(estado) {

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  let nivel = "";

  if (usuario.rol === "jefe") {
    nivel = "jefe de área";
  } else {
    nivel = "Solicitante";
  }

  try {
    const response = await fetch("http://localhost:3000/api/solicitudes/aprobacion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idSolicitud: solicitudActual,
        nivel_aprobacion: nivel,
        estado: estado,
        comentario: ""
      })
    });

    const data = await response.json();

    alert(data.mensaje);
    location.reload();

  } catch (error) {
    console.error("Error:", error);
  }
}

// Boton de si aprobado //
btnSi.addEventListener("click", async () => {

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  await fetch("http://localhost:3000/api/solicitudes/aprobar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      idSolicitud: solicitudActual,
      idUsuario: usuario.idUsuario,
      nivel_aprobacion: usuario.rol === "jefe"
        ? "jefe de área"
        : "Solicitante",
      estado: "aprobado",
      comentario: "Aprobado desde sistema"
    })
  });

  cargarSolicitudesEnRevision();
});