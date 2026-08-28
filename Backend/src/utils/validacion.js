const esIdValido = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

function validarSolicitud(data, requerirUsuario = true) {
  const campos = ["nombre", "descripcion", "area", "tipo_trabajo", "prioridad", "tiempo_estimado", "fecha_de_entrega"];
  if (requerirUsuario) campos.push("idUsuario");
  if (campos.some((campo) => !String(data[campo] ?? "").trim())) {
    return "Complete todos los campos obligatorios de la solicitud";
  }
  if (requerirUsuario && !esIdValido(data.idUsuario)) return "El usuario de la solicitud no es válido";
  return null;
}

function validarAsignacion(data) {
  if (!esIdValido(data.idSolicitud) || !esIdValido(data.idUsuario)) {
    return "La solicitud o el colaborador no son válidos";
  }
  if (!String(data.prioridad_jefe ?? "").trim()) return "Seleccione una prioridad";
  return null;
}

function validarAvance(data) {
  if (!esIdValido(data.idSolicitud) || !esIdValido(data.idUsuario)) {
    return "La solicitud o el usuario no son válidos";
  }
  if (!String(data.descripcion ?? "").trim()) return "La descripción del avance es obligatoria";
  return null;
}

function validarDecision(data) {
  const estados = new Set(["aprobada", "rechazada"]);
  const niveles = new Set(["Solicitante", "jefe de área"]);
  if (!esIdValido(data.idSolicitud)) return "La solicitud no es válida";
  if (!estados.has(data.estado) || !niveles.has(data.nivel_aprobacion)) {
    return "La decisión de aprobación no es válida";
  }
  return null;
}

module.exports = { validarSolicitud, validarAsignacion, validarAvance, validarDecision };