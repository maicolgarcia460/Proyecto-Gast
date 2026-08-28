import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";
import { mostrarMensajeSistema, mostrarConfirmacion } from "./Mensaje_exitoso.js";
import { apiUrl, escaparHtml, leerRespuesta } from "./api.js";

let idSolicitudEditando = null;
let idSolicitudActual = null;
let textoBusqueda = "";
let tabActiva = "pendientes";
let tieneBloqueo = 0;
let temporizadorBusqueda;

document.addEventListener("DOMContentLoaded", () => {
  
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "Inicio_sesion.html"; return;
  }
  mostrarRolEnHeader(); aplicarPermisos();

  // Buscador //
  const inputBuscar = document.getElementById("inputBuscar");
  if (inputBuscar) {
    inputBuscar.addEventListener("input", (e) => {
      textoBusqueda = e.target.value.toLowerCase();
      clearTimeout(temporizadorBusqueda);
      temporizadorBusqueda = setTimeout(cargarSolicitudes, 250);
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
      restablecerFormularioSolicitud();
      formularioSolicitud.classList.remove("hidden");
    });
  }
  
  const botoncerrarformulario = document.getElementById("botoncerrarformulario");
  if (botoncerrarformulario && formularioSolicitud) {
    botoncerrarformulario.addEventListener("click", () => {
      restablecerFormularioSolicitud();
    });
  }

  const inputArchivoSolicitud = document.getElementById("inputArchivoSolicitud");
  const btnSubirArchivoSolicitud = document.getElementById("btnSubirArchivoSolicitud");
  const nombreArchivoSolicitud = document.getElementById("nombreArchivoSolicitud");
  btnSubirArchivoSolicitud?.addEventListener("click", () => inputArchivoSolicitud?.click());
  inputArchivoSolicitud?.addEventListener("change", () => {
    nombreArchivoSolicitud.textContent = inputArchivoSolicitud.files[0]?.name || "";
  });
  
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
  document.getElementById("btnGenerarPDF")?.addEventListener("click", () => {

  if (!idSolicitudActual) {
    mostrarMensajeSistema("No hay solicitud seleccionada", "error");return;
  }

    // Abrir el PDF //
    window.open(apiUrl(`/api/reportes/${idSolicitudActual}`), "_blank");

    mostrarMensajeSistema("Reporte generado correctamente", "exito");
  });

  // Subir avances //
  document.addEventListener("click", async (e) => {
    
    const btn = e.target.closest("[data-detalle]");
    if (!btn) return;
    
    const id = btn.dataset.id;
    idSolicitudActual = id;
    
    try {
      const response = await fetch(apiUrl(`/api/solicitudes/${id}`));
      const solicitud = await leerRespuesta(response);

      const panel = document.getElementById("panelDetalle");
      const titulo = document.getElementById("tituloSolicitud");
      const info = document.getElementById("infoSolicitud");
      
      if (panel && titulo && info) {
        
        titulo.textContent = solicitud.nombre;
        
        info.innerHTML = `
        <p><b>Descripción:</b> ${escaparHtml(solicitud.descripcion)}</p>
        <p><b>Área:</b> ${escaparHtml(solicitud.area)}</p>
        <p><b>Tipo de trabajo:</b> ${escaparHtml(solicitud.tipo_trabajo)}</p>
        <p><b>Prioridad:</b> ${escaparHtml(solicitud.prioridad)}</p>
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

  const inputArchivo = document.getElementById("inputArchivo");
  const btnSubirArchivo = document.getElementById("btnSubirArchivo");
  
  if (btnSubirArchivo && inputArchivo) {
    
    // Abrir gestionador de archivos //
    btnSubirArchivo.addEventListener("click", () => {
      inputArchivo.click();
    });
    
    // Guardar archivo seleccionado //
    inputArchivo.addEventListener("change", (e) => {
      const archivoSeleccionado = e.target.files[0];
      
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
        const response = await fetch(apiUrl("/api/avances"), {
          method: "POST",
          body: formData
        });
        
        const result = await leerRespuesta(response);
      
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

  document.getElementById("tabPendientes")?.addEventListener("click", () => cambiarTab("pendientes"));
  document.getElementById("tabProceso")?.addEventListener("click", () => cambiarTab("proceso"));
  document.getElementById("tabCompletado")?.addEventListener("click", () => cambiarTab("completado"));
  document.getElementById("cerrarDetalle")?.addEventListener("click", () => {
    document.getElementById("detalleSolicitud")?.classList.add("hidden");
  });
});

// historial de los avances //
async function cargarHistorialAvances(idSolicitud) {
  try {
    const response = await fetch(apiUrl(`/api/avances/${idSolicitud}`));
    const avances = await leerRespuesta(response);
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
        <strong>${porcentaje}%</strong> - ${escaparHtml(avance.descripcion)} <br>
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
    
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!usuarioGuardado?.idUsuario) {
      mostrarMensajeSistema("La sesión no es válida", "error");
      return;
    }
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
      const esEdicion = idSolicitudEditando !== null;
      const metodo = esEdicion ? "PUT" : "POST";
      const url = esEdicion
        ? apiUrl(`/api/solicitudes/${idSolicitudEditando}`)
        : apiUrl("/api/solicitudes");
      const archivoSolicitud = document.getElementById("inputArchivoSolicitud")?.files[0];
      const response = await fetch(url, {
        method: metodo,
        headers: esEdicion ? { "Content-Type": "application/json" } : undefined,
        body: esEdicion ? JSON.stringify(data) : crearFormularioSolicitud(data, archivoSolicitud)
      });

      const result = await leerRespuesta(response);

      restablecerFormularioSolicitud();
      
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
      url = apiUrl(`/api/solicitudes/colaborador/${idUsuario}`);
    } else if (rol === "solicitante") {
      url = apiUrl(`/api/solicitudes/solicitante/${idUsuario}`);
    }else {
      url = apiUrl("/api/solicitudes");
    }

    const response = await fetch(url);
    const solicitudes = await leerRespuesta(response);
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
         cargarArchivosSolicitud(solicitud.idSolicitud);

         // función para mostrar archivos //
         async function cargarArchivosSolicitud(idSolicitud) {
          const contenedor = document.getElementById("archivosSolicitud");
          if (!contenedor) return;
          
          try {
            contenedor.innerHTML = "Cargando archivos...";
            
            const response = await fetch(
              apiUrl(`/api/archivos/${idSolicitud}`)
            );
            const archivos = await leerRespuesta(response);
            contenedor.innerHTML = "";
            
            if (!archivos || archivos.length === 0) {
              contenedor.textContent = "No hay archivos adjuntos.";
              return;
            }
            
            const encabezado = document.createElement("strong");
            encabezado.textContent = "Archivos relacionados:";
            contenedor.appendChild(encabezado);

            archivos.forEach((archivo) => {
              const link = document.createElement("a");
              link.href = apiUrl(
                `/api/archivos/descargar/${encodeURIComponent(
                  archivo.nombre_archivo
                )}`
              );
              link.textContent = archivo.nombre_original;
              link.target = "_blank";
              link.classList.add("block", "text-blue-600", "underline", "mt-1");
              
              contenedor.appendChild(link);
            });
          
          } catch (error) {
            console.error("Error cargando archivos:", error);
            contenedor.textContent = "Error al cargar los archivos.";
          }
        }
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
              const response = await fetch(apiUrl(`/api/solicitudes/${solicitud.idSolicitud}`),
                { method: "DELETE" } );
                
                const result = await leerRespuesta(response);
                
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
          document.getElementById("tituloFormularioSolicitud").textContent = `Editar solicitud #${solicitud.idSolicitud}`;
          const inputArchivoSolicitud = document.getElementById("inputArchivoSolicitud");
          const nombreArchivoSolicitud = document.getElementById("nombreArchivoSolicitud");
          if (inputArchivoSolicitud) inputArchivoSolicitud.value = "";
          if (nombreArchivoSolicitud) nombreArchivoSolicitud.textContent = "";
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
            const response = await fetch(apiUrl(`/api/solicitudes/${idSolicitudActual}`));
            const data = await leerRespuesta(response);
            
            if (panel && titulo && info) {
              titulo.textContent = `${data.nombre}`;
              
              info.innerHTML = `
               <p><b>Descripción:</b> ${escaparHtml(data.descripcion)}</p>
               <p><b>Área:</b> ${escaparHtml(data.area)}</p>
               <p><b>Tipo de trabajo:</b> ${escaparHtml(data.tipo_trabajo)}</p>
               <p><b>Prioridad:</b> ${escaparHtml(data.prioridad)}</p>
               <p><b>Fecha de entrega:</b> ${
                data.fecha_de_entrega
                ? data.fecha_de_entrega.split("T")[0]
                : "Sin fecha"
              }</p>
              <p><b>Estado:</b> ${data.estado}</p>
              <p><b>Colaborador:</b> ${data.nombre_colaborador || "Sin asignar"}</p>
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
            }
          
          } catch (error) {
            console.error("Error cargando reporte:", error);
          }
        });
      }
      contenedor.appendChild(clone);
    });

  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
  }
}

function cambiarTab(tab) {
  tabActiva = tab;
  const pestañas = {
    pendientes: "tabPendientes",
    proceso: "tabProceso",
    completado: "tabCompletado"
  };

  Object.values(pestañas).forEach((id) =>
    document.getElementById(id)?.classList.remove("tab-activa")
  );
  document.getElementById(pestañas[tab])?.classList.add("tab-activa");
  cargarSolicitudes();
}

function crearFormularioSolicitud(data, archivo) {
  const formulario = new FormData();
  Object.entries(data).forEach(([clave, valor]) => formulario.append(clave, valor ?? ""));
  if (archivo) formulario.append("archivo", archivo);
  return formulario;
}

function obtenerFechaLocal() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

function restablecerFormularioSolicitud() {
  idSolicitudEditando = null;
  ["nombre", "descripcion", "area", "tipo_trabajo", "tiempo_estimado", "fecha_de_entrega"].forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });
  const prioridad = document.getElementById("prioridad");
  if (prioridad) prioridad.value = "";
  const fechaCreacion = document.getElementById("fecha_creacion");
  if (fechaCreacion) fechaCreacion.value = obtenerFechaLocal();
  const inputArchivo = document.getElementById("inputArchivoSolicitud");
  if (inputArchivo) inputArchivo.value = "";
  const nombreArchivo = document.getElementById("nombreArchivoSolicitud");
  if (nombreArchivo) nombreArchivo.textContent = "";
  document.getElementById("tituloFormularioSolicitud").textContent = "Nueva solicitud";
  document.getElementById("formularioSolicitud")?.classList.add("hidden");
}

cargarSolicitudes();