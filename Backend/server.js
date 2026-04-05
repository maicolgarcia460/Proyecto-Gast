require('./src/config/dataBase');

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

const solicitudRoutes = require('./src/routes/solicitudRoutes');
app.use('/api/solicitudes', solicitudRoutes);

const avanceRoutes = require('./src/routes/avanceRoutes');
app.use('/api/avances', avanceRoutes);

const reporteRoutes = require("./src/routes/reporteRoutes");
app.use("/api/reportes", reporteRoutes);