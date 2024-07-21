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
    const { fecha, horario, descripcion } = req.body;
  
    if (!fecha || !horario || !descripcion) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
  
    const newEvento = { fecha, horario, descripcion };
  
    db.query('INSERT INTO Eventos SET ?', newEvento, (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el evento');
        throw err;
      }
      res.status(201).send('Evento agregado correctamente');
    });
  }];

  exports.updateEvento = [authenticateJWT, (req, res) => {
    const idEvento = req.params.id;
    const { fecha, horario, descripcion } = req.body;
  
    if (!fecha || !horario || !descripcion) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
  
    const updatedEvento = { fecha, horario, descripcion };
  
    db.query('UPDATE Eventos SET ? WHERE idEvento = ?', [updatedEvento, idEvento], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar el evento');
        throw err;
      }
      res.send('Evento actualizado correctamente');
    });
  }];

  exports.deleteEvento = [authenticateJWT, (req, res) => {
    const idEvento = req.params.id;
  
    db.query('DELETE FROM Eventos WHERE idEvento = ?', idEvento, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar el evento');
        throw err;
      }
      res.send('Evento eliminado correctamente');
    });
  }];
  