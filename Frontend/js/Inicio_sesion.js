
import { guardarRol } from "./Roles.js";

// USUARIOS SIMULADOS //
const usuarios = [
  { usuario: "soli", password: "1234", rol: "solicitante" },
  { usuario: "jefe", password: "1234", rol: "jefe" },
  { usuario: "colab", password: "1234", rol: "colaborador" }
];

document.addEventListener("DOMContentLoaded", () => {
  const botones = {
    solicitante: document.getElementById("solicitante"),
    jefe: document.getElementById("jefe"),
    colaborador: document.getElementById("colaborador")
  };

  let rolSeleccionado = "solicitante";

  // Selección manual del rol //
  Object.keys(botones).forEach(rol => {

    botones[rol].addEventListener("click", () => {
      rolSeleccionado = rol;
      Object.values(botones).forEach(btn =>
        btn.classList.remove("bg-[#1E88E5]")
      );
      botones[rol].classList.add("bg-[#1E88E5]");
    });
  });

  const form = document.getElementById("formLogin");
  const inputUsuario = document.getElementById("usuario");
  const inputPassword = document.getElementById("password");
  const mensajeError = document.getElementById("mensajeError");

  form.addEventListener("submit", function (e) {

    e.preventDefault();

    const usuarioIngresado = inputUsuario.value.trim();
    const passwordIngresado = inputPassword.value.trim();

    const usuarioValido = usuarios.find(u =>
      u.usuario === usuarioIngresado &&
      u.password === passwordIngresado
    );

    if (!usuarioValido) {
      mensajeError.textContent = "Usuario o contraseña incorrectos";
      mensajeError.classList.remove("hidden");
      return;
    }

    if (usuarioValido.rol !== rolSeleccionado) {
      mensajeError.textContent = "El rol seleccionado no corresponde al usuario";
      mensajeError.classList.remove("hidden");
      return;
    }

    // Login validado //
    guardarRol(usuarioValido.rol);
    localStorage.setItem("usuario", usuarioValido.usuario);
    window.location.href = "Menu_principal.html";
  });
});