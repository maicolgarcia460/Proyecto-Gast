import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";
import { mostrarMensajeSistema } from "./Mensaje_exitoso.js";
import { apiUrl, escaparHtml, leerRespuesta } from "./api.js";

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
    fetch(apiUrl(`/api/solicitudes/colaborador/${idUsuario}`))
      .then(leerRespuesta)
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
    fetch(apiUrl("/api/solicitudes/pendientes"))
      .then(leerRespuesta)
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
                apiUrl(`/api/solicitudes/${solicitud.idSolicitud}`)
              );
              
              const detalle = await leerRespuesta(response);
              const titulo = document.getElementById("tituloSolicitud");
              const info = document.getElementById("infoSolicitudAsignar");
              const panel = document.getElementById("panelDetalle");
              
              titulo.textContent =
              `Solicitud #${detalle.idSolicitud} - ${detalle.nombre}`;
              
              info.innerHTML = `
              <p><b>Descripción:</b> ${escaparHtml(detalle.descripcion)}</p>
              <p><b>Área:</b> ${escaparHtml(detalle.area)}</p>
              <p><b>Tipo:</b> ${escaparHtml(detalle.tipo_trabajo)}</p>
              <p><b>Prioridad:</b> ${escaparHtml(detalle.prioridad)}</p>
              <p><b>Fecha de entrega:</b> ${
                detalle.fecha_de_entrega
                ? detalle.fecha_de_entrega.split("T")[0]
                : "Sin fecha"
              }</p>
              `;

              // Mostrar archivos //
              try {
                const resArchivos = await fetch(
                  apiUrl(`/api/archivos/${solicitud.idSolicitud}`)
                );
                
                const archivos = await leerRespuesta(resArchivos);
                if (archivos.length > 0) {
                  
                  const lista = document.createElement("div");
                  const encabezado = document.createElement("strong");
                  encabezado.textContent = "Archivos relacionados:";
                  lista.appendChild(encabezado);
                  
                  archivos.forEach(a => {
                    const link = document.createElement("a");
                    link.href = apiUrl(`/api/archivos/descargar/${encodeURIComponent(a.nombre_archivo)}`);
                    link.textContent = a.nombre_original;
                    link.target = "_blank";
                    link.classList.add("block", "text-blue-600", "underline", "mt-1");
                    
                    lista.appendChild(link);
                  });
                  
                  info.appendChild(lista);
                
                } else {
                  const sinArchivos = document.createElement("p");
                  sinArchivos.textContent = "No hay archivos registrados.";
                  
                  info.appendChild(sinArchivos);
                }
              
              } catch (error) { 
                console.error("Error cargando archivos:", error);
                
                const errorArchivos = document.createElement("p");
                errorArchivos.textContent = "No fue posible cargar los archivos.";
                
                info.appendChild(errorArchivos);
              }
              
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
  fetch(apiUrl("/api/usuarios/colaboradores"))
    .then(leerRespuesta)
    .then(data => {
      
      const contenedor = document.getElementById("listaColaboradores");
      contenedor.innerHTML = "";
      
      data.forEach(colaborador => {
        
        const label = document.createElement("label");
        label.classList.add("flex", "items-center", "space-x-2");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "asignado";
        input.value = colaborador.idUsuario;
        const nombre = document.createElement("span");
        nombre.classList.add("font-semibold", "text-black");
        nombre.textContent = colaborador.usuario;
        label.append(input, nombre);

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
      apiUrl("/api/solicitudes/asignar"),
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

    const data = await leerRespuesta(respuesta);

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