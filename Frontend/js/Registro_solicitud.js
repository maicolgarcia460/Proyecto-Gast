import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";
import { mostrarMensajeSistema, mostrarConfirmacion } from "./Mensaje_exitoso.js";


let idSolicitudEditando = null;
let idSolicitudActual = null;
let textoBusqueda = "";
let tabActiva = "pendientes";
let tieneBloqueo = 0;

document.addEventListener("DOMContentLoaded", () => {
  
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "Inicio_sesion.html"; return;
  }
  mostrarRolEnHeader(); aplicarPermisos();

  // Buscador //
  const inputBuscar = document.getElementById("inputBuscar");
  if (inputBuscar) {
    inputBuscar.addEventListener("keyup", (e) => {
      textoBusqueda = e.target.value.toLowerCase();
      cargarSolicitudes();
    });
  }

  // Despliegue y cierre de menu + botón agregar //
  const botonagregar = document.getElementById("botonagregar");
  
  const rol = localStorage.getItem("rol");
  if (rol === "colaborador") {
    botonagregar?.classList.add("hidden");}

  const formularioSolicitud = document.getElementById("formularioSolicitud"); 
  if (botonagregar && formularioSolicitud) {
    botonagregar.addEventListener("click", () => {
      formularioSolicitud.classList.remove("hidden");
    });
  }
  
  const botoncerrarformulario = document.getElementById("botoncerrarformulario");
  if (botoncerrarformulario && formularioSolicitud) {
    botoncerrarformulario.addEventListener("click", () => {
      formularioSolicitud.classList.add("hidden");
    });
  }
  
  // Control de menu //
  document.querySelectorAll("[data-menu]").forEach(boton => {
    boton.addEventListener("click", () => {
      
      const id = boton.dataset.menu;

      document.querySelectorAll('[id^="menu"]').forEach(menu =>
        menu.classList.add("hidden")
      );

      const menuSeleccionado = document.getElementById(id);
      if (menuSeleccionado) {
        menuSeleccionado.classList.toggle("hidden");
      }
    });
  });

  // Botón para generar el PDF //
  document.getElementById("btnGenerarPDF").addEventListener("click", () => {

  if (!idSolicitudActual) {
    mostrarMensajeSistema("No hay solicitud seleccionada", "error");return;
  }

    // Abrir el PDF //
    window.open(`http://localhost:3000/api/reportes/${idSolicitudActual}`, "_blank");

    mostrarMensajeSistema("Reporte generado correctamente", "exito");
  });

  // Subir avances //
  document.addEventListener("click", async (e) => {
    
    const btn = e.target.closest("[data-detalle]");
    if (!btn) return;
    
    const id = btn.dataset.id;
    idSolicitudActual = id;
    
    try {
      const response = await fetch(`http://localhost:3000/api/solicitudes/${id}`);
      const solicitud = await response.json();

      const panel = document.getElementById("panelDetalle");
      const titulo = document.getElementById("tituloSolicitud");
      const info = document.getElementById("infoSolicitud");
      
      if (panel && titulo && info) {
        
        titulo.textContent = solicitud.nombre;
        
        info.innerHTML = `
        <p><b>Descripción:</b> ${solicitud.descripcion}</p>
        <p><b>Área:</b> ${solicitud.area}</p>
        <p><b>Tipo de trabajo:</b> ${solicitud.tipo_trabajo}</p>
        <p><b>Prioridad:</b> ${solicitud.prioridad}</p>
        <p><b>Fecha de entrega:</b> ${
          solicitud.fecha_de_entrega
            ? solicitud.fecha_de_entrega.split("T")[0]
            : "Sin fecha"
        }</p>
        <p><b>Estado:</b> ${solicitud.estado}</p>
        <p><b>Colaborador:</b> ${solicitud.nombre_colaborador || "Sin asignar"}</p>
      `;
      
        panel.classList.remove("hidden");
      }
    
    } catch (error) {
      console.error("Error cargando detalle:", error);
    }
  });

  let archivoSeleccionado = null;

  const inputArchivo = document.getElementById("inputArchivo");
  const btnSubirArchivo = document.getElementById("btnSubirArchivo");
  
  if (btnSubirArchivo && inputArchivo) {
    
    // Abrir gestionador de archivos //
    btnSubirArchivo.addEventListener("click", () => {
      inputArchivo.click();
    });
    
    // Guardar archivo seleccionado //
    inputArchivo.addEventListener("change", (e) => {
      archivoSeleccionado = e.target.files[0];
      
      if (archivoSeleccionado) {
        btnSubirArchivo.textContent = "Archivo: " + archivoSeleccionado.name;
      }
    });
  }

  // Guardar los avances //
  const btnGuardarAvance = document.getElementById("btnGuardarAvance");
  if (btnGuardarAvance) {
    btnGuardarAvance.addEventListener("click", async () => {
      
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const porcentaje = document.getElementById("porcentaje").value;
      const observaciones = document.getElementById("observaciones").value;
      const detalleBloqueo = document.getElementById("detalleBloqueo").value;
      const archivoInput = document.getElementById("archivoInput");
      const formData = new FormData();

      formData.append("idSolicitud", idSolicitudActual);
      formData.append("idUsuario", usuario.idUsuario);
      formData.append("descripcion", `Avance ${porcentaje}% - ${observaciones}`);
      formData.append("tiene_bloqueo", tieneBloqueo);
      formData.append("detalle_bloqueo", tieneBloqueo ? detalleBloqueo : "");
      
      if (inputArchivo.files.length > 0) {
        formData.append("archivo", inputArchivo.files[0]);
      }
      
      try {
        const response = await fetch("http://localhost:3000/api/avances", {
          method: "POST",
          body: formData
        });
        
        const result = await response.json();
        if (!response.ok) {
        mostrarMensajeSistema(
          result.mensaje || "Error al guardar el avance","error"
        );
        return;
      }
      
      mostrarMensajeSistema(
        result.mensaje || "Avance registrado correctamente","exito"
      );
    
      } catch (error) {

      mostrarMensajeSistema(
        "Error de conexión con el servidor","error"
      );
      }
    });
  }
  
  const btnSi = document.getElementById("btnSi");
  const btnNo = document.getElementById("btnNo");
  const detalleBloqueo = document.getElementById("detalleBloqueo");
  
  if (btnSi && btnNo) {
    btnSi.addEventListener("click", () => {
      tieneBloqueo = 1;
      detalleBloqueo.classList.remove("hidden");
      btnSi.classList.add("bg-red-300");
      btnNo.classList.remove("bg-green-300");
    });
    
    btnNo.addEventListener("click", () => {
      tieneBloqueo = 0;
      detalleBloqueo.classList.add("hidden");
      detalleBloqueo.value = "";
      btnNo.classList.add("bg-green-300");
      btnSi.classList.remove("bg-red-300");
    });
  }

  // Formulario para subir avances //
  const botonsubiravance = document.getElementById("botonsubiravance");
  const btnCerrar = document.getElementById("btnCerrarAvance");
  const formularioAvance = document.getElementById("formularioAvance");
  
  if (botonsubiravance && formularioAvance) {
    botonsubiravance.addEventListener("click", () => {
      formularioAvance.classList.remove("hidden");
    });
  } 

  if (btnCerrar && formularioAvance) {
    btnCerrar.addEventListener("click", () => {
      formularioAvance.classList.add("hidden");
    });
  }
    
  const slider = document.getElementById("porcentaje");
  const texto = document.getElementById("valorPorcentaje");
  
  if (slider && texto) {
    texto.textContent = slider.value + "%";
    slider.addEventListener("input", () => {
      texto.textContent = slider.value + "%";
    });
  }

  document.querySelectorAll("[data-cerrar]").forEach(boton => {
    boton.addEventListener("click", () => {
      
      const id = boton.dataset.cerrar;
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.classList.add("hidden");
      }
    });
  });
});

// historial de los avances //
async function cargarHistorialAvances(idSolicitud) {
  try {
    const response = await fetch(`http://localhost:3000/api/avances/${idSolicitud}`);
    const avances = await response.json();
    const contenedor = document.getElementById("historialAvances");
    contenedor.innerHTML = "";
    avances.forEach(avance => {
      
      const fecha = avance.fecha_avance
        ? avance.fecha_avance.split("T")[0]
        : "";
      const porcentajeMatch = avance.descripcion.match(/(\d+)%/);
      const porcentaje = porcentajeMatch ? porcentajeMatch[1] : 0;
      const div = document.createElement("div");
      div.classList.add("mb-2", "p-2", "bg-white", "rounded", "shadow");
      div.innerHTML = `
        <strong>${porcentaje}%</strong> - ${avance.descripcion} <br>
        <small>${fecha}</small>
        ${avance.tiene_bloqueo ? "<br><span class='text-red-600'>Bloqueo</span>" : ""}
      `;

      contenedor.appendChild(div);
    });
  
  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
}

// Registrar una solicitud //
const btnRegistrar = document.getElementById("btnRegistrar");
if (btnRegistrar) {
  btnRegistrar.addEventListener("click", async () => {
    
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    const fechaInput = document.getElementById("fecha_de_entrega").value;
    const fechaFormateada = fechaInput
      ? new Date(fechaInput).toISOString().split("T")[0]
      : null;
    const data = {
      nombre: document.getElementById("nombre").value,
      descripcion: document.getElementById("descripcion").value,
      area: document.getElementById("area").value,
      tipo_trabajo: document.getElementById("tipo_trabajo").value,
      prioridad: document.getElementById("prioridad").value,
      tiempo_estimado: document.getElementById("tiempo_estimado").value,
      fecha_de_entrega: fechaFormateada,
      idUsuario: usuarioGuardado.idUsuario
    };

    try {
      const metodo = idSolicitudEditando !== null ? "PUT" : "POST";
      const url = idSolicitudEditando !== null
        ? `http://localhost:3000/api/solicitudes/${idSolicitudEditando}`
        : "http://localhost:3000/api/solicitudes";
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) {
        mostrarMensajeSistema(result.mensaje || "Error al procesar la solicitud","error"); return;
      }

      idSolicitudEditando = null;
      
      mostrarMensajeSistema(result.mensaje || "Solicitud registrada correctamente", "exito");

    } catch (error) {
      mostrarMensajeSistema("Error de conexión con el servidor","error");
    }
  });
}

// fecha automatica de creación de una solicitud //
const inputFecha = document.getElementById("fecha_creacion");
if (inputFecha) {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  inputFecha.value = `${año}-${mes}-${dia}`;
}

// Obtener y mostrar las solicitudes según su rol //
async function cargarSolicitudes() {
  
  try {
    const rol = localStorage.getItem("rol");
    const idUsuario = localStorage.getItem("idUsuario");

    let url = "";

    if (rol === "colaborador") {
      url = `http://localhost:3000/api/solicitudes/colaborador/${idUsuario}`;
    } else if (rol === "solicitante") {
      url = `http://localhost:3000/api/solicitudes/solicitante/${idUsuario}`;
    }else {
      url = "http://localhost:3000/api/solicitudes";
    }

    const response = await fetch(url);
    const solicitudes = await response.json();
    const contenedor = document.getElementById("listaSolicitudes");
    const template = document.getElementById("templateSolicitud");
    contenedor.innerHTML = "";

    solicitudes.forEach(solicitud => {

      // Filtrar por texto //
      if (textoBusqueda && 
        !solicitud.nombre.toLowerCase().includes(textoBusqueda)) {
          return;
        }

      if (solicitud.estado === "en-revision") return;
      if (solicitud.estado === "rechazada") return;

      const clone = template.content.cloneNode(true);
      const nombre = clone.querySelector(".nombre-solicitud");
      const esAprobada = solicitud.estado === "aprobada";

      nombre.textContent =
        `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;

      if (solicitud.estado === "aprobada") {
        nombre.textContent += " - (Terminada y Aprobada)"; }
      if (solicitud.estado === "asignada" && solicitud.nombre_colaborador) {
        nombre.textContent += ` - (Asignada a colaborador ${solicitud.nombre_colaborador})`; }
        
        document.getElementById("tabPendientes")?.addEventListener("click", () => {
          cambiarTab("pendientes");
        });
        
        document.getElementById("tabProceso")?.addEventListener("click", () => {
          cambiarTab("proceso");
        });
        
        document.getElementById("tabCompletado")?.addEventListener("click", () => {
          cambiarTab("completado");
        });
        
        if (tabActiva === "pendientes") {
          
          if (
            solicitud.estado !== "pendiente" &&
            solicitud.estado !== "asignada"
          ) return;
        }
        
        if (tabActiva === "proceso") {
          if (solicitud.estado !== "asignada") return;
        }

        if (tabActiva === "completado") {
          if (solicitud.estado !== "aprobada") return;
        }

        // Calcular el porcentaje desde los avances //
        let porcentaje = 0;

        if (solicitud.estado === "aprobada") {
          porcentaje = 100;
        } 
        
        else if (solicitud.ultimo_avance) {
          const match = solicitud.ultimo_avance.match(/(\d+)%/);
          if (match) {
            porcentaje = parseInt(match[1]);
          }
        }

      // Circulo del porcentaje //
      const spanPorcentaje = clone.querySelector(".porcentaje");
      if (spanPorcentaje) {
        spanPorcentaje.textContent = porcentaje + "%";
      }

      // Botón para avances //
      const btnAvance = clone.querySelector(".btn-avance");
      if (rol === "jefe" || rol === "solicitante" || esAprobada) {
        btnAvance?.remove(); }
          
      if (btnAvance) {
        btnAvance.dataset.id = solicitud.idSolicitud;
        btnAvance.dataset.detalle = solicitud.nombre;
        btnAvance.addEventListener("click", () => {
          
          idSolicitudActual = solicitud.idSolicitud;
          
          const panel = document.getElementById("panelDetalle");
          const titulo = document.getElementById("tituloSolicitud");
          if (panel && titulo) {
            titulo.textContent = solicitud.nombre;
            panel.classList.remove("hidden");
          }
        });
      }

      // Panel de informacion de las solicitudes //
      const nombreElemento = clone.querySelector(".nombre-solicitud");
      nombreElemento.addEventListener("click", () => {
            
        const panel = document.getElementById("detalleSolicitud");
        panel.classList.remove("hidden");
        
        document.getElementById("d_nombre").textContent = solicitud.nombre;
        document.getElementById("d_descripcion").textContent = solicitud.descripcion;
        document.getElementById("d_area").textContent = solicitud.area;
        document.getElementById("d_tipo").textContent = solicitud.tipo_trabajo;
        document.getElementById("d_prioridad").textContent = solicitud.prioridad;
        document.getElementById("d_tiempo").textContent = solicitud.tiempo_estimado;
        document.getElementById("d_fecha").textContent =           
         solicitud.fecha_de_entrega
         ? solicitud.fecha_de_entrega.split("T")[0]
         : "Sin fecha";
         
         cargarHistorialAvances(solicitud.idSolicitud);
      });

      // Eliminar una solicitud //
      const btnEliminar = clone.querySelector(".btn-eliminar");
      
      if (rol === "colaborador" || esAprobada) {
        btnEliminar?.remove(); 
      }
      
      if (btnEliminar) {
        btnEliminar.addEventListener("click", () => {
          
          mostrarConfirmacion("¿Seguro que deseas eliminar esta solicitud?", async () => {
            try {
              const response = await fetch(`http://localhost:3000/api/solicitudes/${solicitud.idSolicitud}`,
                { method: "DELETE" } );
                
                const result = await response.json();
                if (!response.ok) {
                  throw new Error(result.mensaje || "Error al eliminar");
                }
                
                mostrarMensajeSistema(result.mensaje || "Solicitud eliminada correctamente",
                  "exito"
                );
              
            } catch (error) {
              
              mostrarMensajeSistema(error.message || "Error al eliminar la solicitud",
                "error"
              );
            }
          });
        });
      }

      // Editar una solicitud //
      const btnEditar = clone.querySelector(".btn-editar");
      
      if (rol === "colaborador" || esAprobada) {
        btnEditar?.remove(); }
        
      if (btnEditar) {
        btnEditar.addEventListener("click", () => {
          
          idSolicitudEditando = solicitud.idSolicitud;
          
          document.getElementById("formularioSolicitud").classList.remove("hidden");
          document.getElementById("nombre").value = solicitud.nombre;
          document.getElementById("descripcion").value = solicitud.descripcion;
          document.getElementById("area").value = solicitud.area;
          document.getElementById("tipo_trabajo").value = solicitud.tipo_trabajo;
          document.getElementById("prioridad").value = solicitud.prioridad;
          document.getElementById("tiempo_estimado").value = solicitud.tiempo_estimado;
          document.getElementById("fecha_de_entrega").value =
            solicitud.fecha_de_entrega
            ? solicitud.fecha_de_entrega.split("T")[0]
            : "";
        });
      }

      // Botón de generación de reportes //
      const btnReporte = clone.querySelector(".btn-reporte");
      
      if (esAprobada) {
        btnReporte.remove(); }
        
      if (btnReporte) {
        btnReporte.addEventListener("click", async () => {
          
          idSolicitudActual = solicitud.idSolicitud;
          
          const panel = document.getElementById("panelReporte");
          const titulo = document.getElementById("tituloSolicitudReporte");
          const info = document.getElementById("infoSolicitudReporte");
          
          try {
            const response = await fetch(`http://localhost:3000/api/solicitudes/${idSolicitudActual}`);
            const data = await response.json();
            
            if (panel && titulo && info) {
              titulo.textContent = `${data.nombre}`;
              
              info.innerHTML = `
               <p><b>Descripción:</b> ${data.descripcion}</p>
               <p><b>Área:</b> ${data.area}</p>
               <p><b>Tipo de trabajo:</b> ${data.tipo_trabajo}</p>
               <p><b>Prioridad:</b> ${data.prioridad}</p>
               <p><b>Fecha de entrega:</b> ${
                data.fecha_de_entrega
                ? data.fecha_de_entrega.split("T")[0]
                : "Sin fecha"
              }</p>
              <p><b>Estado:</b> ${data.estado}</p>
              <p><b>Colaborador:</b> ${data.nombre_colaborador || "Sin asignar"}</p>
              `;
              
              panel.classList.remove("hidden");
            }
          
          } catch (error) {
            console.error("Error cargando reporte:", error);
          }
        });
      }
      contenedor.appendChild(clone);
    });

    // cerrar el panel de informacion de la solicitud //
    const cerrar = document.getElementById("cerrarDetalle");
    if (cerrar) {
      cerrar.addEventListener("click", () => {
        document.getElementById("detalleSolicitud").classList.add("hidden");
      });
    }

    function cambiarTab(tab) { tabActiva = tab;
      
      document.getElementById("tabPendientes")?.classList.remove("tab-activa");
      document.getElementById("tabProceso")?.classList.remove("tab-activa");
      document.getElementById("tabCompletado")?.classList.remove("tab-activa");
      
      if (tab === "pendientes") {
        document.getElementById("tabPendientes")?.classList.add("tab-activa");
      }
      
      if (tab === "proceso") {
        document.getElementById("tabProceso")?.classList.add("tab-activa");
      }
      
      if (tab === "completado") {
        document.getElementById("tabCompletado")?.classList.add("tab-activa");
      }
      
      cargarSolicitudes();
    }
  
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
  }
}
cargarSolicitudes();