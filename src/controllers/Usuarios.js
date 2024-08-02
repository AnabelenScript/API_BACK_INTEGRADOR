const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conexión a la BD establecida');
});

exports.login = async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son requeridos');
  }
  db.query('SELECT * FROM Usuarios WHERE email = ?', [email], async (err, result) => {
    if (err) {
      return res.status(500).send('Error en el servidor');
    }
    if (result.length === 0) {
      return res.status(401).send('Correo electrónico incorrecto');
    }
    const user = result[0];
    let validPassword;
    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      return res.status(500).send('Error en la comparación de contraseñas');
    }
    if (!validPassword) {
      return res.status(401).send('Contraseña incorrecto');
    }
    const idUsuario = user.idUsuario;
    const token = jwt.sign({ id: idUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ mensaje: 'Login exitoso', token });
  });
};
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

exports.getUser = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  db.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener el usuario');
      throw err;
    }
    res.json(result);
  });
}];
exports.getDatosPersonales = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  db.query('SELECT * FROM datosPersonales WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener los datos personales');
      throw err;
    }
    res.json(result);
  });
}];

exports.getTrabajador = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  db.query('SELECT * FROM Trabajadores WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener el trabajador');
      throw err;
    }
    res.json(result);
  });
}];



exports.getAllUsers = [authenticateJWT, (req, res) => {
  db.query('SELECT * FROM Usuarios', (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener los usuarios');
      throw err;
    }
    res.json(result);
  });
}];

exports.getPerfil = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  db.query('SELECT tipoPerfil FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error al obtener el perfil');
      throw err;
    }
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send('Perfil no encontrado');
    }
  });
}];


exports.registrarPersonal = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  const { edad, nombre, apellidoPaterno, apellidoMaterno, telefono, numHijos, estadoCivil, fechaNacimiento } = req.body;

  if (!edad || !nombre || !apellidoPaterno || !apellidoMaterno || !telefono || !numHijos || !estadoCivil || !fechaNacimiento) {
    return res.status(400).send('Los datos completos son requeridos');
  }

  db.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error en el servidor');
      throw err;
    }
    if (result.length === 0) {
      return res.status(404).send('id de Usuario no encontrado');
    }

    db.query('SELECT * FROM datosPersonales WHERE idUsuario = ?', [idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error en el servidor');
        throw err;
      }
      if (result.length > 0) {
        return res.status(409).send('Los datos personales ya están agregados a la base');
      }
      db.query('INSERT INTO datosPersonales (idUsuario, edad, nombre, apellidoPaterno, apellidoMaterno, telefono, numHijos, estadoCivil, fechaNacimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [idUsuario, edad, nombre, apellidoPaterno, apellidoMaterno, telefono, numHijos, estadoCivil, fechaNacimiento], (err, result) => {
        if (err) {
          res.status(500).send('Error al registrar los datos');
          throw err;
        }
        db.query('SELECT idDatosPersonales FROM datosPersonales WHERE idUsuario = ?',
          [idUsuario], (err, result) => {
          if (err) {
            res.status(500).send('Error en el servidor');
            throw err;
          }
          if (result.length === 0) {
            return res.status(500).send('No se pudo obtener el ID de los datos económicos');
          }
          const idDatosPersonales = result[0].idDatosPersonales;
          db.query('UPDATE Usuarios SET idDatosPersonales = ? WHERE idUsuario = ?',
            [idDatosPersonales, idUsuario], (err, result) => {
            if (err) {
              res.status(500).send('Error al actualizar el usuario');
              throw err;
            }
            res.status(201).json({ message: 'Datos registrados correctamente'});
          });
        });
      });
    });
  });
}];


exports.registrarVivienda = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  const { calle, colonia, numeroExterior, codigoPostal, numInterior, numHabitaciones, estatusVivienda, tipoVivienda } = req.body;

  if (!calle || !colonia || !numeroExterior || !codigoPostal || !numInterior || !numHabitaciones || !estatusVivienda || !tipoVivienda) {
    return res.status(400).send('Los datos completos son requeridos');
  }

  db.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      return res.status(500).send('Error en el servidor');
    }
    if (result.length === 0) {
      return res.status(404).send('id de Usuario no encontrado');
    }

    db.query('SELECT * FROM datosVivienda WHERE idUsuario = ?', [idUsuario], (err, result) => {
      if (err) {
        return res.status(500).send('Error en el servidor');
      }
      if (result.length > 0) {
        return res.status(409).send('Los datos de vivienda ya están agregados a la base');
      }

      db.query('INSERT INTO datosVivienda (idUsuario, calle, colonia, numeroExterior, codigoPostal, numInterior, numHabitaciones, estatusVivienda, tipoVivienda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [idUsuario, calle, colonia, numeroExterior, codigoPostal, numInterior, numHabitaciones, estatusVivienda, tipoVivienda], (err, result) => {
        if (err) {
          return res.status(500).send('Error al registrar los datos');
        }

        db.query('SELECT idVivienda FROM datosVivienda WHERE idUsuario = ?', [idUsuario], (err, result) => {
          if (err) {
            return res.status(500).send('Error en el servidor');
          }
          if (result.length === 0) {
            return res.status(500).send('No se pudo obtener el ID de los datos de vivienda');
          }

          const idDatosVivienda = result[0].idVivienda;
          db.query('UPDATE Usuarios SET idDatosVivienda = ? WHERE idUsuario = ?', [idDatosVivienda, idUsuario], (err, result) => {
            if (err) {
              return res.status(500).send('Error al actualizar el usuario');
            }
            return res.status(201).json({ message: 'Datos registrados correctamente'});
          });
        });
      });
    });
  });
}];


exports.registrarEconomico = [authenticateJWT, (req, res) => {
  const idUsuario = req.params.id;
  const { ocupacion, ingresosMensuales, gastosMensuales, apoyosExternos } = req.body;
  if (!ocupacion || !ingresosMensuales || !gastosMensuales || !apoyosExternos) {
    return res.status(400).send('Los datos completos son requeridos');
  }
  db.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
    if (err) {
      res.status(500).send('Error en el servidor');
      throw err;
    }
    if (result.length === 0) {
      return res.status(404).send('id de Usuario no encontrado');
    }
    db.query('SELECT * FROM datosEconomicos WHERE idUsuario = ?', [idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error en el servidor');
        throw err;
      }
      if (result.length > 0) {
        return res.status(409).send('Los datos económicos ya están agregados a la base');
      }
      db.query('INSERT INTO datosEconomicos (idUsuario, ocupacion, ingresosMensuales, gastosMensuales, apoyosExternos) VALUES (?, ?, ?, ?, ?)',
        [idUsuario, ocupacion, ingresosMensuales, gastosMensuales, apoyosExternos], (err, result) => {
        if (err) {
          res.status(500).send('Error al registrar los datos');
          throw err;
        }
        db.query('SELECT iddatosEconomicos FROM datosEconomicos WHERE idUsuario = ?',
          [idUsuario], (err, result) => {
          if (err) {
            res.status(500).send('Error en el servidor');
            throw err;
          }
          if (result.length === 0) {
            return res.status(500).send('No se pudo obtener el ID de los datos económicos');
          }
          const idDatosEconomicos = result[0].iddatosEconomicos;
          db.query('UPDATE Usuarios SET idDatosEconomicos = ? WHERE idUsuario = ?',
            [idDatosEconomicos, idUsuario], (err, result) => {
            if (err) {
              res.status(500).send('Error al actualizar el usuario');
              throw err;
            }
            res.status(201).json({ message: 'Datos registrados correctamente'});
          });
        });
      });
    });
  });
}];


exports.addUser = (req, res) => {
  const { email, password, idTrabajador } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error hashing password');
    }
    db.query('SELECT idTrabajador FROM Trabajadores WHERE idTrabajador = ?', [idTrabajador], (err, result) => {
      if (err) {
        console.error('Error al obtener el id:', err);
        return res.status(500).send('Error al obtener el id');
      }
      const tipoPerfil = result.length ? 1 : 2;
      const newUser = { email, password: hash, tipoPerfil, idTrabajador: tipoPerfil === 1 ? idTrabajador : null };
      db.query('INSERT INTO Usuarios (email, password, tipoPerfil, idTrabajador) VALUES (?, ?, ?, ?)', [newUser.email, newUser.password, newUser.tipoPerfil, newUser.idTrabajador], (err, result) => {
        if (err) {
          console.error('Error executing insert query:', err);
          return res.status(500).send('Error adding user');
        }
        const userId = result.insertId; 
        if (tipoPerfil === 1) {
          db.query('UPDATE Trabajadores SET idUsuario = ? WHERE idTrabajador = ?', [userId, idTrabajador], (err, result) => {
            if (err) {
              console.error('Error updating Trabajadores:', err);
              return res.status(500).send('Error updating Trabajadores');
            }
            console.log('Registro exitoso. Ya puedes iniciar sesión');
            res.status(201).send('User added successfully and associated with Trabajador');
          });
        } else {
          console.log('Registro exitoso. Ya puedes iniciar sesión');
          res.status(201).send('User added successfully');
        }
      });
    });
  });
};


  exports.updateUser = [authenticateJWT, (req, res) => {
    const idUsuario = req.params.id;
    const updateUsers = req.body;
    db.query('UPDATE Usuarios SET ? WHERE idUsuario = ?', [updateUsers, idUsuario], (err, result) => {
      if (err) {
        res.status(500).send('Error al actualizar los datos');
        throw err;
      }
      res.send('Los datos actualizados correctamente');
    });
  }];

  exports.deleteUser = [authenticateJWT, (req, res) => {
    const idUsuario = req.params.id;
    db.query('DELETE FROM Usuarios WHERE idUsuario = ?', [idUsuario], (err, result) => {
      if (err) {
        console.error('Error al eliminar el elemento:', err);
        return res.status(500).send('Error al eliminar el elemento');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Usuario no encontrado');
      }
      res.send('Elemento eliminado correctamente');
    });
  }];
  