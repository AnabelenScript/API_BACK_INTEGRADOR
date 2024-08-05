const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
  if (err) throw err;
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); 
      }
      req.user = user;
      req.params.id = user.id;
      next();
    });
  } else {
    res.sendStatus(401); 
  }
};


exports.getAllEventos = [authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Eventos', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener las Eventos');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.addEvento = [authenticateJWT, (req, res) => {
    const idUsuario = req.params.id;
    const { fechaEvento, horario, descripcion, finalInscripcion, calle, colonia, numExterior, codigoPostal } = req.body;
  
    if (!fechaEvento || !horario || !descripcion || !finalInscripcion || !calle || !colonia || !numExterior || !codigoPostal) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
    db.query('INSERT INTO Eventos (fechaEvento, horario, descripcion, finalInscripcion, calle, colonia, numExterior, codigoPostal, idUsuario) VALUES (?, ?, ?, ?, ?,?,?,?,?)',
      [fechaEvento, horario, descripcion, finalInscripcion, calle, colonia, numExterior, codigoPostal, idUsuario  ], (err, result) => {
      if (err) {
        res.status(500).send('Error al registrar los datos');
        throw err;
    }})
  }];

  exports.updateEvento = [authenticateJWT, (req, res) => {
    const idEventos = req.params.idEventos;
    const updatedEvento = req.body;
  
    db.query('UPDATE Eventos SET ? WHERE idEventos = ?', [updatedEvento, idEventos], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar el evento');
        throw err;
      }
      res.send('Evento actualizado correctamente');
    });
  }];

  exports.deleteEvento = [authenticateJWT, (req, res) => {
    const idEventos = req.params.idEventos;
    db.query('DELETE FROM Eventos WHERE idEventos = ?', idEventos, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar el evento');
        throw err;
      }
      res.send('Evento eliminado correctamente');
    });
  }];
  