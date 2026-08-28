import { guardarRol } from "./Roles.js";
import { apiUrl, leerRespuesta } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const botones = {
    solicitante: document.getElementById("solicitante"),
    jefe: document.getElementById("jefe"),
    colaborador: document.getElementById("colaborador")
  };

  let rolSeleccionado = "solicitante";

  // Selección manual del rol //
  Object.keys(botones).forEach(rol => {
    botones[rol]?.addEventListener("click", () => {
      rolSeleccionado = rol;
      Object.values(botones).forEach(btn => btn.classList.remove("bg-[#1E88E5]"));
      botones[rol].classList.add("bg-[#1E88E5]");
    });
  });

  const form = document.getElementById("formLogin");
  const inputUsuario = document.getElementById("usuario");
  const inputPassword = document.getElementById("password");
  const mensajeError = document.getElementById("mensajeError");

  if (!form || !inputUsuario || !inputPassword || !mensajeError) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value.trim();

    //  Petición al Backend //
    try {
      const response = await fetch(apiUrl("/api/usuarios/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password })
      });
      const data = await leerRespuesta(response);

      if (data.mensaje !== "Login exitoso") {
        throw new Error(data.mensaje || "No fue posible iniciar sesión");
      }

    // Validación del rol en la base de datos //
      const rolUsuario = data.usuario.rol;
      if (rolUsuario !== rolSeleccionado) {
        throw new Error("El rol seleccionado no corresponde al usuario");
      }

    // Inicio de sesión correcto //
      guardarRol(data.usuario.rol);
      localStorage.setItem("rol", data.usuario.rol);
      localStorage.setItem("idUsuario", data.usuario.idUsuario);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      window.location.href = "Menu_principal.html";
    } catch (error) {
      console.error("Error:", error);
      mensajeError.textContent = error.message || "Error en el servidor";
      mensajeError.classList.remove("hidden");
    }
  });
});