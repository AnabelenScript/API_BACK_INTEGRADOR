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
exports.getAllCitasPsicologicas = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  db.query('SELECT * FROM Citas WHERE idUsuario = ? AND tipo = ?', [idUsuario, 'psicologica'], (err, result) => {
    if (err) {
      console.error('Error al obtener las citas:', err);
      res.status(500).send('Error al obtener las citas');
      return;
    }
    res.json(result);
  });
}];

exports.getAllCitasHorario = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  db.query('SELECT * FROM Citas WHERE idUsuario = ? AND tipo = ?', [idUsuario, 'psicologica'], (err, result) => {
    if (err) {
      console.error('Error al obtener las citas:', err);
      res.status(500).send('Error al obtener las citas');
      return;
    }
    res.json(result);
  });
}];

exports.verAllCitas = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM Citas', [], (err, result) => {
    if (err) {
      console.error('Error al obtener las citas:', err);
      res.status(500).send('Error al obtener las citas');
      return;
    }
    res.json(result);
  });
}];

exports.getCitasFecha = [authenticateJWT, (req, res) => {
  const fecha = req.query.fecha; 
  if (!fecha) {
    return res.status(400).json({ message: 'Fecha es requerida' });
  }

  db.query('SELECT fecha, horario FROM Citas WHERE tipo = ? AND fecha = ?', ['psicologica', fecha], (err, result) => {
    if (err) {
      console.error('Error al obtener las citas:', err);
      res.status(500).send('Error al obtener las citas');
      return;
    }
    res.json(result);
  });
}];


exports.getAllCitasJuridicas = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  db.query('SELECT * FROM Citas WHERE idUsuario = ? AND tipo = ?', [idUsuario, 'juridica'], (err, result) => {
    if (err) {
      console.error('Error al obtener las citas:', err);
      res.status(500).send('Error al obtener las citas');
      return;
    }
    res.json(result);
  });
}];
  exports.addCita = [authenticateJWT, (req, res) => {
    const idUsuario = req.params.id;
    const { tipo, fecha, horario, idDenuncia } = req.body;
    if (!tipo || !fecha || !horario) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
    if (idDenuncia) {
      db.query('SELECT * FROM Denuncia WHERE idDenuncia = ?', [idDenuncia], (err, result) => {
        if (err) {
          return res.status(500).send('Error al verificar la denuncia');
        }
        if (result.length === 0) {
          return res.status(404).send('La denuncia con el id proporcionado no existe');
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
            return res.status(400).send('Debe completar el registro de datos (Datos Personales, Vivienda y Datos Económicos) antes de agregar una cita');
          }
          db.query('INSERT INTO Citas (idUsuario, tipo, fecha, horario, idDenuncia) VALUES (?, ?, ?, ?, ?)',
            [idUsuario, tipo, fecha, horario, idDenuncia], (err, result) => {
              if (err) {
                return res.status(500).send('Error al registrar la cita');
              }
              res.status(201).send('Cita registrada correctamente');
            });
        });
      });
    } else {
        db.query('INSERT INTO Citas (idUsuario, tipo, fecha, horario) VALUES (?, ?, ?, ?)',
          [idUsuario, tipo, fecha, horario], (err, result) => {
            if (err) {
              return res.status(500).send('Error al registrar la cita');
            }
            res.status(201).send('Cita registrada correctamente');
          });
    }
  }];
  
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
  