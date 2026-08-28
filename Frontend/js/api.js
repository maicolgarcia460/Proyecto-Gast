export const API_BASE_URL = "http://localhost:3000";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function leerRespuesta(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No fue posible completar la operación");
  }

  return data;
}

export function escaparHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[caracter]);
}