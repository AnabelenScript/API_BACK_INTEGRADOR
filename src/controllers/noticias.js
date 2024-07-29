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


exports.getAllNoticias = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
    db.query('SELECT * FROM Noticias WHERE idUsuario = ?', [idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error al obtener las Noticias');
        throw err;
      }
      res.json(result);
    });
  }];

  exports.addNoticia = [authenticateJWT, (req, res) => {
    const { descripcion, fecha, titulo } = req.body;
  
    console.log('Datos recibidos:', { descripcion, fecha, titulo });
  
    if (!descripcion || !fecha || !titulo) {
      return res.status(400).send('Todos los campos son obligatorios');
    }
    const newNoticia = { descripcion, fecha, titulo };
    db.query('INSERT INTO Noticias (descripcion, fecha, titulo) VALUES (?, ?, ?)', [newNoticia.descripcion, newNoticia.fecha, newNoticia.titulo], (err, result) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res.status(500).send('Error al agregar la noticia');
      }
      res.status(200).send('Noticia agregada correctamente');
    });
  }];
  
  exports.updateNoticia = [authenticateJWT, (req, res) => {
    const idUsuario = req.params.id;
    const updateNoticia = req.body;
    db.query('UPDATE Usuarios SET ? WHERE idUsuario = ?', [updateNoticia, idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar los datos');
        throw err;
      }
      res.send('Los datos actualizados correctamente');
    });
  }];

  exports.deleteNoticias = [authenticateJWT, (req, res) => {
    const idNoticia = req.params.id;
  
    db.query('DELETE FROM Noticias WHERE idNoticia = ?', idNoticia, (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar la noticia');
        throw err;
      }
      res.send('Noticia eliminada correctamente');
    });
  }];
  