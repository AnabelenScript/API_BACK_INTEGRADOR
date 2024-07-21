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

exports.getAllCitas = [authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Citas', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener las Citas');
        throw err;
      }
      res.json(result);
    });
  }];

exports.addCita = (req, res) => {
    const { tipo, fecha, horario, idDenuncia } = req.body;
  
    if (!tipo || !fecha || !horario) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
    const newCita = { tipo, fecha, horario };
    if (idDenuncia) {
      db.query('SELECT * FROM Denuncias WHERE idDenuncia = ?', [idDenuncia], (err, result) => {
        if (err) {
          return res.status(500).send('Error al verificar la denuncia');
        }
        if (result.length === 0) {
          return res.status(404).send('La denuncia con el id proporcionado no existe');
        }
        newCita.idDenuncia = idDenuncia;
        db.query('INSERT INTO Citas SET ?', newCita, (err, result) => {
          if (err) {
            return res.status(500).send('Error al agregar la cita');
          }
          res.status(201).send('Cita reportada correctamente con idDenuncia');
        });
      });
    } else {
      db.query('INSERT INTO Citas SET ?', newCita, (err, result) => {
        if (err) {
          return res.status(500).send('Error al agregar la cita');
        }
        res.status(201).send('Cita reportada correctamente sin id Denuncia');
      });
    }
  };
  
  exports.updateCita = [authenticateJWT, (req, res) => {
    const idCita = req.params.id;
    const { tipo, fecha, horario } = req.body;
    const updatedCita = { tipo, fecha, horario };
  
    db.query('UPDATE Citas SET ? WHERE idCita = ?', [updatedCita, idCita], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar la cita');
        throw err;
      }
      res.send('Cita actualizada correctamente');
    });
  }];

  exports.deleteCita = [authenticateJWT, (req, res) => {
    const idCita = req.params.id;
    db.query('DELETE FROM Citas WHERE idCita = ?', idCita, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar la cita');
        throw err;
      }
      res.send('Cita eliminada correctamente');
    });
  }];
  