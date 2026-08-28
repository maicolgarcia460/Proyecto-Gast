require('./src/config/dataBase');

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Inicio del servidor //
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Rutas API //
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

const solicitudRoutes = require('./src/routes/solicitudRoutes');
app.use('/api/solicitudes', solicitudRoutes);

const avanceRoutes = require('./src/routes/avanceRoutes');
app.use('/api/avances', avanceRoutes);

const reporteRoutes = require("./src/routes/reporteRoutes");
app.use("/api/reportes", reporteRoutes);

const aprobacionRoutes = require('./src/routes/aprobacionRoutes');
app.use('/api/aprobaciones', aprobacionRoutes);

const estadisticaRoutes = require('./src/routes/estadisticaRoutes');
app.use('/api/estadisticas', estadisticaRoutes);

const archivoRoutes = require('./src/routes/archivoRoutes');
app.use('/api/archivos', archivoRoutes);

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error("Error en la solicitud:", error);
    res.status(400).json({ mensaje: error.message || "No fue posible procesar la solicitud" });
});