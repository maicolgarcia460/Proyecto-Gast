import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";
import { mostrarMensajeSistema } from "./Mensaje_exitoso.js";
import { apiUrl, escaparHtml, leerRespuesta } from "./api.js";

let solicitudActual = null;

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();
  aplicarPermisos();
  cargarSolicitudesEnRevision();
});

// Aprobación o rechazo de solicitudes //
document.getElementById("btnSi")?.addEventListener("click", () => {
  enviarDecision("aprobada");
});

document.getElementById("btnNo")?.addEventListener("click", () => {
  enviarDecision("rechazada");
});

document.addEventListener("click", (e) => {
  const botonCerrar = e.target.closest("[data-cerrar='panelDetalle']");
  if (botonCerrar) {
    document.getElementById("panelDetalle").classList.add("hidden");
  }
});

// Cargar solicitudes que esten en revisión //
function cargarSolicitudesEnRevision() {
  
  fetch(apiUrl("/api/solicitudes/en-revision"))
    .then(leerRespuesta)
    .then(data => {

      const contenedor = document.getElementById("listaSolicitudes");
      const template = document.getElementById("templateSolicitud");
      contenedor.innerHTML = "";

      data.forEach(solicitud => {
        
        if (solicitud.estado === "en-revision") return;
        
        const clone = template.content.cloneNode(true);
        const nombre = clone.querySelector(".nombreSolicitud");
        const boton = clone.querySelector(".btnAprobar");
        const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
        
        if (boton) {
          
          if (usuario?.rol === "jefe" && solicitud.estado_jefe?.trim() === "aprobada") {
            boton.style.display = "none";
          }
          
          if (usuario?.rol === "solicitante" && solicitud.estado_solicitante?.trim() === "aprobada") {
            boton.style.display = "none";
          }
        }

        nombre.textContent =
         `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;

          // Botón para abrir el panel de detalle //
        if (boton) {
          boton.addEventListener("click", async () => {
            
            solicitudActual = solicitud.idSolicitud;
            
            const titulo = document.getElementById("tituloSolicitud");
            const panel = document.getElementById("panelDetalle");
            const infoAvance = document.getElementById("infoAvance");
            
            if (titulo && panel) {
              
              titulo.textContent =
              `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;
              
              panel.classList.remove("hidden");
              
              infoAvance.innerHTML = "Cargando avance...";
              
              try {
                
                // Mostrar el avance //
                const resAvances = await fetch(
                  apiUrl(`/api/avances/${solicitud.idSolicitud}`)
                );
                
                const avances = await leerRespuesta(resAvances);
                const avanceFinal = avances.find(a =>
                  a.descripcion.includes("100%")
                );
                
                if (!avanceFinal) {
                  infoAvance.innerHTML = "No hay avance final registrado."; return;
                }
                
                // Mostrar la descripción //
                infoAvance.innerHTML = `
                <p><strong>Descripción:</strong> ${escaparHtml(avanceFinal.descripcion)}</p>
                <p><strong>Fecha:</strong> ${new Date(avanceFinal.fecha_avance).toLocaleString()}</p>
                `;
                
                // Mostrar archivos //
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
                     link.classList.add("block", "text-blue-600", "underline");
                     
                     lista.appendChild(link);
                  });
                  
                  infoAvance.appendChild(lista);
                }
              
              } catch (error) {            
                infoAvance.innerHTML = "Error cargando avance.";
                console.error(error);
              }
            }
          });
        }
        contenedor.appendChild(clone);
      });
    })
    .catch(error => console.error("Error cargando revisión:", error));
}

// Desición de aprobación //
async function enviarDecision(estado) {
  
  if (!solicitudActual) {
    mostrarMensajeSistema("No hay solicitud seleccionada", "error");
    return;
  }

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!usuario?.rol) {
    mostrarMensajeSistema("La sesión no es válida", "error");
    return;
  }
  const nivel =
    usuario.rol === "jefe"
      ? "jefe de área"
      : "Solicitante";
      
      const comentarioTexto = document
      .getElementById("Comentarios")
      .value
      .trim();
      
      try {
        
        console.log("Enviando:", {
          idSolicitud: solicitudActual,
          estado: estado,
          nivel_aprobacion: nivel,
          comentario: comentarioTexto
        });
        
        const response = await fetch(
          apiUrl("/api/aprobaciones/decidir"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              idSolicitud: solicitudActual,
              estado: estado,
              nivel_aprobacion: nivel,
              comentario: comentarioTexto
            })
          }
        );
        
        const data = await leerRespuesta(response);
        
        document.getElementById("Comentarios").value = "";
        document.getElementById("panelDetalle").classList.add("hidden");

        mostrarMensajeSistema(data.mensaje || "Decisión registrada correctamente","exito");
      
      } catch (error) {
        console.error("Error enviando decisión:", error);

        mostrarMensajeSistema("Error de conexión con el servidor","error");
      }
}