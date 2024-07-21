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

exports.getAllApoyos = [authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Apoyos', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener los apoyos');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.addApoyo = [authenticateJWT, (req, res) => {
    const { descripción, monto, fechalimite, fechaInicio, tipoApoyo } = req.body;
    
    if (!descripción || !monto || !fechalimite || !fechaInicio || !tipoApoyo) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
  
    const newApoyo = { descripción, monto, fechalimite, fechaInicio, tipoApoyo };
  
    db.query('INSERT INTO Apoyos SET ?', newApoyo, (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar el apoyo');
        throw err;
      }
      res.status(201).send('Apoyo agregado correctamente');
    });
  }];

  exports.updateApoyo = [authenticateJWT, (req, res) => {
    const idApoyo = req.params.id;
    const { descripción, monto, fechalimite, fechaInicio, tipoApoyo } = req.body;
  
    if (!descripción && !monto && !fechalimite && !fechaInicio && !tipoApoyo) {
      return res.status(400).send('Debe proporcionar al menos un campo para actualizar');
    }
  
    const updatedApoyo = {};
    if (descripción) updatedApoyo.descripción = descripción;
    if (monto) updatedApoyo.monto = monto;
    if (fechalimite) updatedApoyo.fechalimite = fechalimite;
    if (fechaInicio) updatedApoyo.fechaInicio = fechaInicio;
    if (tipoApoyo) updatedApoyo.tipoApoyo = tipoApoyo;
  
    db.query('UPDATE Apoyos SET ? WHERE idApoyo = ?', [updatedApoyo, idApoyo], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar el apoyo');
        throw err;
      }
      res.send('Apoyo actualizado correctamente');
    });
  }];

  exports.deleteApoyo = [authenticateJWT, (req, res) => {
    const idApoyo = req.params.id;
    db.query('DELETE FROM Apoyos WHERE idApoyo = ?', idApoyo, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar el apoyo');
        throw err;
      }
      res.send('Apoyo eliminado correctamente');
    });
  }];
  