const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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

exports.getAllDenuncias = [authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Denuncias', (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener las Denuncias');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.addDenuncia = [authenticateJWT, (req, res) => {
    const { gravedadCaso, gastosMensuales, numPersonasEnCasa, ingresosDiarios } = req.body;
  
    if (!gravedadCaso || !gastosMensuales || !numPersonasEnCasa || !ingresosDiarios) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
  
    const newDenuncia = { gravedadCaso, gastosMensuales, numPersonasEnCasa, ingresosDiarios };
  
    db.query('INSERT INTO Denuncia SET ?', newDenuncia, (err, result) => {
      if (err) {
        res.status(500).send('Error al agregar la denuncia');
        throw err;
      }
      res.status(201).send('Denuncia reportada correctamente');
    });
  }];
  

  exports.updateDenuncia = [authenticateJWT, (req, res) => {
    const idDenuncia = req.params.id;
    const { gravedadCaso, gastosMensuales, numPersonasEnCasa, ingresosDiarios } = req.body;
  
    if (!gravedadCaso && !gastosMensuales && !numPersonasEnCasa && !ingresosDiarios) {
      return res.status(400).send('Debe proporcionar al menos un campo para actualizar');
    }
  
    const updatedDenuncia = {};
    if (gravedadCaso) updatedDenuncia.gravedadCaso = gravedadCaso;
    if (gastosMensuales) updatedDenuncia.gastosMensuales = gastosMensuales;
    if (numPersonasEnCasa) updatedDenuncia.numPersonasEnCasa = numPersonasEnCasa;
    if (ingresosDiarios) updatedDenuncia.ingresosDiarios = ingresosDiarios;
  
    db.query('UPDATE Denuncia SET ? WHERE idDenuncia = ?', [updatedDenuncia, idDenuncia], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar la denuncia');
        throw err;
      }
      res.send('Denuncia actualizada correctamente');
    });
  }];

  exports.deleteDenuncia = [authenticateJWT, (req, res) => {
    const idDenuncia = req.params.id;
  
    db.query('DELETE FROM Denuncia WHERE idDenuncia = ?', idDenuncia, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar la denuncia');
        throw err;
      }
      res.send('Denuncia eliminada correctamente');
    });
  }];
  