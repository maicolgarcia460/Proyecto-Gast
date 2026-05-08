import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";
import { mostrarMensajeSistema } from "./Mensaje_exitoso.js";

let solicitudActual = null;
let prioridadSeleccionada = null;

document.addEventListener("DOMContentLoaded", () => {mostrarRolEnHeader(); aplicarPermisos(); cargarSolicitudesPendientes(); cargarColaboradores();

  // Botón de asignar final //
  const btnAsignar2 = document.getElementById("btnAsignar2");
  if (btnAsignar2) {
    btnAsignar2.addEventListener("click", asignarSolicitud);
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
  const contenedor = document.getElementById("listaSolicitudes");
  const template = document.getElementById("templateSolicitud");

  contenedor.innerHTML = "";

  // Si es un colaborador //
  if (rol === "colaborador") {
    fetch(`http://localhost:3000/api/solicitudes/colaborador/${idUsuario}`)
      .then(res => res.json())
      .then(data => {

        data.forEach(solicitud => {
          
          const clone = template.content.cloneNode(true);
          const nombre = clone.querySelector(".nombreSolicitud");
          const boton = clone.querySelector(".btnAsignar1");

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
          const boton = clone.querySelector(".btnAsignar1");

          nombre.textContent =
            `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;

          boton.addEventListener("click", async () => {
            
            solicitudActual = solicitud.idSolicitud;
            
            try {
              const response = await fetch(
                `http://localhost:3000/api/solicitudes/${solicitud.idSolicitud}`
              );
              
              const detalle = await response.json();
              const titulo = document.getElementById("tituloSolicitud");
              const info = document.getElementById("infoSolicitudAsignar");
              const panel = document.getElementById("panelDetalle");
              
              titulo.textContent =
              `Solicitud #${detalle.idSolicitud} - ${detalle.nombre}`;
              
              info.innerHTML = `
              <p><b>Descripción:</b> ${detalle.descripcion}</p>
              <p><b>Área:</b> ${detalle.area}</p>
              <p><b>Tipo:</b> ${detalle.tipo_trabajo}</p>
              <p><b>Prioridad:</b> ${detalle.prioridad}</p>
              <p><b>Fecha de entrega:</b> ${
                detalle.fecha_de_entrega
                ? detalle.fecha_de_entrega.split("T")[0]
                : "Sin fecha"
              }</p>
              `;
              
              panel.classList.remove("hidden");
            
            } catch (error) {
              console.error("Error cargando detalle:", error);
            }
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
    mostrarMensajeSistema("No hay solicitud seleccionada", "error");
    return;
  }

  const seleccionado = document.querySelector("input[name='asignado']:checked");
  if (!seleccionado) {
    mostrarMensajeSistema("Debe seleccionar un colaborador", "error");
    return;
  }

  if (!prioridadSeleccionada) {
    mostrarMensajeSistema("Debe seleccionar una prioridad", "error");
    return;
  }

  const observaciones = document.getElementById("observaciones").value;
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
          observaciones,
          prioridad_jefe: prioridadSeleccionada
        })
      }
    );

    const data = await respuesta.json();
    if (!respuesta.ok) {
      mostrarMensajeSistema(data.mensaje || "Error al asignar solicitud","error");
      return;
    }

    // Cerrar el panel //
    document.getElementById("panelDetalle").classList.add("hidden");

    mostrarMensajeSistema(data.mensaje || "Solicitud asignada correctamente","exito");

  } catch (error) {
    console.error("Error:", error);
    mostrarMensajeSistema("Error de conexión con el servidor","error");
  }
}

// Boton de prioridad al asignar //
document.querySelectorAll(".btnPrioridad").forEach(btn => {
  btn.addEventListener("click", () => {
    prioridadSeleccionada = btn.dataset.prioridad;

    document.querySelectorAll(".btnPrioridad").forEach(b =>
      b.classList.remove("ring-2", "ring-black")
    );

    btn.classList.add("ring-2", "ring-black");
  });
});