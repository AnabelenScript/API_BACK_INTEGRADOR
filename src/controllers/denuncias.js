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
      req.params.id = user.id;
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
    const idUsuario = req.params.id;
    const { gravedadCaso, motivoDenuncia, fechaDenuncia, estatusDenuncia, horaDenuncia } = req.body;

    if (!gravedadCaso || !motivoDenuncia || !fechaDenuncia || !estatusDenuncia || !horaDenuncia) {
        return res.status(400).send('Los datos completos son requeridos');
    }
    db.query('SELECT idDatosPersonales, idDatosVivienda, idDatosEconomicos FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
        if (err) {
            return res.status(500).send('Error en el servidor');
        }
        if (result.length === 0) {
            return res.status(404).send('ID de Usuario no encontrado');
        }
        const usuario = result[0];
        if (!usuario.idDatosPersonales || !usuario.idDatosVivienda || !usuario.idDatosEconomicos) {
            return res.status(400).send('Debe completar el registro de datos (Datos Personales, Vivienda y Datos Económicos) antes de agregar una denuncia');
        }
        db.query('INSERT INTO Denuncia (idUsuario, gravedadCaso, motivoDenuncia, fechaDenuncia, estatusDenuncia, horaDenuncia) VALUES (?,?,?,?,?,?)',
            [idUsuario, gravedadCaso, motivoDenuncia, fechaDenuncia, estatusDenuncia, horaDenuncia], (err, result) => {
                if (err) {
                    return res.status(500).send('Error al registrar los datos');
                }
                res.status(201).send('Denuncia registrada correctamente');
        });
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
  