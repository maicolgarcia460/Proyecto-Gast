const usuarioModel = require('../models/usuarioModel');

// Inicio de sesión //
const login = (req, res) => {
    const { usuario, password } = req.body;

    console.log("DATOS RECIBIDOS:", usuario, password);

    usuarioModel.login(usuario, password, (error, results) => {
        if (error) {
            console.log("ERROR SQL:", error);
            return res.status(500).json(error);
        }
        console.log("RESULTADOS:", results);

        if (results.length > 0) {
            res.json({
                mensaje: 'Login exitoso',
                usuario: results[0]
            });
        } else {
            res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos'
            });
        }
    });
};

// Obtención de colaboradores //
const obtenerColaboradores = (req, res) => {

  usuarioModel.obtenerColaboradores((error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ mensaje: "Error al obtener colaboradores" });
    }
    res.json(results);
  });
};

module.exports = { login, obtenerColaboradores };