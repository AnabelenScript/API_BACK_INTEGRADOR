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
  const idUsuario = req.params.id;
    db.query('SELECT * FROM Denuncia WHERE idUsuario = ?', [idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener las Denuncias');
        throw err;
      }
      res.json(result);
      console.log(result);
    });
  }];


  exports.addDenuncia = [authenticateJWT, (req, res) => {
    const idUsuario = req.params.id;
    const { gravedadCaso, motivoDenuncia, fechaDenuncia, estatusDenuncia, horaDenuncia,caso, fechaCaso, violentador } = req.body;

    if (!gravedadCaso || !motivoDenuncia || !fechaDenuncia || !estatusDenuncia || !horaDenuncia ||! caso ||!fechaCaso ||!violentador) {
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
        db.query('INSERT INTO Denuncia (idUsuario, gravedadCaso, motivoDenuncia, fechaDenuncia, estatusDenuncia, horaDenuncia, caso, fechaCaso, violentador) VALUES (?,?,?,?,?,?,?,?,?)',
            [idUsuario, gravedadCaso, motivoDenuncia, fechaDenuncia, estatusDenuncia, horaDenuncia, caso, fechaCaso, violentador], (err, result) => {
                if (err) {
                    return res.status(500).send('Error al registrar los datos');
                }
                res.status(201).send('Denuncia registrada correctamente');
        });
    });
}];

exports.finalizarDenuncia = [authenticateJWT, (req, res) => {
  const idDenuncia = req.params.idDenuncia;
  
  db.query('UPDATE Denuncia SET estatusDenuncia = ? WHERE idDenuncia = ?', 
    ['finalizada', idDenuncia], 
    (err, result) => {
      if (err) {
        console.error('Error al actualizar el estatus de la denuncia:', err);
        res.status(500).send('Error al actualizar el estatus de la denuncia');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('Denuncia no encontrada o no actualizada');
      } else {
        res.send('Denuncia actualizada a finalizado correctamente');
      }
    }
  );
}];