const express = require('express');
const bodyParser = require('body-parser');
const UsuariosRoutes = require('./routes/Usuarios');
const apoyosRoutes = require('./routes/apoyos');
const citasRoutes = require('./routes/citas');
const denunciasRoutes = require('./routes/denuncias');
const eventosRoutes = require('./routes/eventos');
const noticiasRoutes = require('./routes/noticias');
const cors = require('cors');

require('dotenv').config();
const app = express();
const port = process.env.DB_PORT || 3000;

app.use(bodyParser.json());

app.use(cors({
  origin: 'https://figualitario.integrador.xyz', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use('/Usuarios', UsuariosRoutes);
app.use('/apoyos', apoyosRoutes);
app.use('/citas', citasRoutes);
app.use('/denuncias', denunciasRoutes);
app.use('/eventos', eventosRoutes);
app.use('/noticias', noticiasRoutes);

app.listen(port, () => {
  console.log(`Servidor Express en ejecución en http://localhost:${port}`);
});
