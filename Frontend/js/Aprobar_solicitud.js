import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";
import { mostrarMensajeSistema } from "./Mensaje_exitoso.js";

let solicitudActual = null;

document.addEventListener("DOMContentLoaded", () => {mostrarRolEnHeader(); aplicarPermisos(); cargarSolicitudesEnRevision();
});+

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
  
  const rol = localStorage.getItem("rol");
  const idUsuario = localStorage.getItem("idUsuario");

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
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        
        if (boton) {
          
          if (usuario.rol === "jefe" && solicitud.estado_jefe?.trim() === "aprobada") {
            boton.style.display = "none";
          }
          
          if (usuario.rol === "solicitante" && solicitud.estado_solicitante?.trim() === "aprobada") {
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
                  `http://localhost:3000/api/avances/${solicitud.idSolicitud}`
                );
                
                const avances = await resAvances.json();
                const avanceFinal = avances.find(a =>
                  a.descripcion.includes("100%")
                );
                
                if (!avanceFinal) {
                  infoAvance.innerHTML = "No hay avance final registrado."; return;
                }
                
                // Mostrar la descripción //
                infoAvance.innerHTML = `
                <p><strong>Descripción:</strong> ${avanceFinal.descripcion}</p>
                <p><strong>Fecha:</strong> ${new Date(avanceFinal.fecha_avance).toLocaleString()}</p>
                `;
                
                // Mostrar archivos //
                const resArchivos = await fetch(
                  `http://localhost:3000/api/archivos/${solicitud.idSolicitud}`
                );
                
                const archivos = await resArchivos.json();
                
                if (archivos.length > 0) {
                  
                  const lista = document.createElement("div");
                  lista.innerHTML = "<strong>Archivos:</strong>";
                  
                  archivos.forEach(a => {
                    const link = document.createElement("a");
                    link.href = `http://localhost:3000/api/archivos/descargar/${a.nombre_archivo}`;
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

  const usuario = JSON.parse(localStorage.getItem("usuario"));
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
          "http://localhost:3000/api/aprobaciones/decidir",
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
        
        const data = await response.json();
        if (!response.ok) {
          mostrarMensajeSistema(data.mensaje || "Error procesando la decisión","error");
          return;
        }
        
        document.getElementById("Comentarios").value = "";
        document.getElementById("panelDetalle").classList.add("hidden");

        mostrarMensajeSistema(data.mensaje || "Decisión registrada correctamente","exito");
      
      } catch (error) {
        console.error("Error enviando decisión:", error);

        mostrarMensajeSistema("Error de conexión con el servidor","error");
      }
}