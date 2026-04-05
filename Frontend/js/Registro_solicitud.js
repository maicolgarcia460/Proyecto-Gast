import { mostrarRolEnHeader, aplicarPermisos } from "./Roles.js";

let idSolicitudEditando = null;
let idSolicitudActual = null;

document.addEventListener("DOMContentLoaded", () => {
  
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "Inicio_sesion.html";
    return;
  }
  mostrarRolEnHeader();
  aplicarPermisos();

  // Despliegue y cierre de menu + botón agregar //
  const botonagregar = document.getElementById("botonagregar");
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

// Generaración de reportes //
document.querySelectorAll("[data-reporte]").forEach(boton => {
  boton.addEventListener("click", () => {

   const nombre = boton.dataset.reporte;
   const texto = document.getElementById("solicitudSeleccionada");
   const panel = document.getElementById("panelReporte");
    if (texto && panel) {
      texto.textContent = "Solicitud seleccionada: " + nombre;
      panel.classList.remove("hidden");
    }
  });
});

// Botón //
document.getElementById("btnGenerarPDF").addEventListener("click", () => {

  if (!idSolicitudActual) {
    alert("No hay solicitud seleccionada");
    return;
  }

// Descarga del PDF //
window.open(`http://localhost:3000/api/reportes/${idSolicitudActual}`, "_blank"); 
});

// Subir avances //
document.querySelectorAll("[data-detalle]").forEach(item => {
  item.addEventListener("click", () => {

    const nombre = item.dataset.detalle;
    const id = item.dataset.id;
    idSolicitudActual = id;
    const panel = document.getElementById("panelDetalle");
    const titulo = document.getElementById("tituloSolicitud");
    if (panel && titulo) {
      titulo.textContent = nombre;
      panel.classList.remove("hidden");
    }
  });
});

// Guardar los avances //
const btnGuardarAvance = document.getElementById("btnGuardarAvance");
if (btnGuardarAvance) {
  btnGuardarAvance.addEventListener("click", async () => {

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const porcentaje = document.getElementById("porcentaje").value;
    const observaciones = document.getElementById("observaciones").value;
    const detalleBloqueo = document.getElementById("detalleBloqueo").value;
    const tieneBloqueo = detalleBloqueo.trim() !== "" ? 1 : 0;
    const data = {
      idSolicitud: idSolicitudActual,
      idUsuario: usuario.idUsuario,
      descripcion: `Avance ${porcentaje}% - ${observaciones}`,
      tiene_bloqueo: tieneBloqueo,
      detalle_bloqueo: detalleBloqueo
    };

// Botón Si //
document.getElementById("btnSi").addEventListener("click", () => {
  tieneBloqueo = 1;
});

// Botón No //
document.getElementById("btnNo").addEventListener("click", () => {
  tieneBloqueo = 0;
});

    try {
      const response = await fetch("http://localhost:3000/api/avances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      localStorage.setItem("mensaje", result.mensaje);
      window.location.href = "Mensaje_proceso_exitoso.html";

       cargarSolicitudes();

    } catch (error) {
      console.error("Error al guardar avance:", error);
      alert("Error al guardar avance");
    }
  });
}

// Formulario para subir avances //
const botonsubiravance = document.getElementById("botonsubiravance");
const formularioAvance = document.getElementById("formularioAvance");
  if (botonsubiravance && formularioAvance) {
    botonsubiravance.addEventListener("click", () => {
      formularioAvance.classList.remove("hidden");
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

      let mensaje = "Operación realizada correctamente";
      if (response.ok) {
        try {
          const result = await response.json();
          if (result.mensaje) {
            mensaje = result.mensaje;
          }
        } catch (e) {}
      }

      localStorage.setItem("mensaje", mensaje);

      // Reiniciar el modo //
      idSolicitudEditando = null;

      // Cierre de formulario //
      document.getElementById("formularioSolicitud").classList.add("hidden");

      // Recargar la lista //
      cargarSolicitudes();

    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar la solicitud");
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
    } else {
      url = "http://localhost:3000/api/solicitudes";
    }

    const response = await fetch(url);
    const solicitudes = await response.json();
    const contenedor = document.getElementById("listaSolicitudes");
    const template = document.getElementById("templateSolicitud");

    contenedor.innerHTML = "";

    solicitudes.forEach(solicitud => {

      const clone = template.content.cloneNode(true);
      const nombre = clone.querySelector(".nombre-solicitud");

      nombre.textContent =
        `Solicitud #${solicitud.idSolicitud} - ${solicitud.nombre}`;


 // Calcular el porcentaje desde los avances //
 let porcentaje = 0;
 if (solicitud.ultimo_avance) {
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

 // Ingreso de datos //
 clone.querySelector(".nombre-solicitud").textContent = solicitud.nombre;

 // Botón para avances //
 const btnAvance = clone.querySelector(".btn-avance");
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
 btnEliminar.addEventListener("click", async () => {

  if (!confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
  try {
    const response = await fetch(`http://localhost:3000/api/solicitudes/${solicitud.idSolicitud}`, {
      method: "DELETE"
    });

    const result = await response.json();

    localStorage.setItem("mensaje", result.mensaje || "Solicitud eliminada correctamente");
    window.location.href = "Mensaje_proceso_exitoso.html";

  } catch (error) {
    console.error("Error al eliminar:", error);
  }

  cargarSolicitudes();
 });

 // Editar una solicitud //
 const btnEditar = clone.querySelector(".btn-editar");
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
 if (btnReporte) {
  btnReporte.addEventListener("click", () => {

    const panel = document.getElementById("panelReporte");
    const texto = document.getElementById("solicitudSeleccionada");
    if (panel && texto) {
      texto.textContent = "Solicitud seleccionada: " + solicitud.nombre;
      panel.classList.remove("hidden");
    }

    idSolicitudActual = solicitud.idSolicitud;
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

  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
  }

}
cargarSolicitudes();