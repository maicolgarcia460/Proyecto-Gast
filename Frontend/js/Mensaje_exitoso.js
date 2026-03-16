import { mostrarRolEnHeader } from "./Roles.js";

document.addEventListener("DOMContentLoaded", () => {
  mostrarRolEnHeader();

    setTimeout(function(){ history.back(); }, 1000);
});