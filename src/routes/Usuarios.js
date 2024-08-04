const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/Usuarios');
const { registrarPersonal } = require('../controllers/Usuarios');
const { addUser } = require('../controllers/Usuarios');
const {login} = require('../controllers/Usuarios')

router.get('/verAllUsers', usuariosController.verAllUsers);
router.get('/getPerfil', usuariosController.getPerfil);
router.get('/getUser', usuariosController.getUser);
router.put('/:id', usuariosController.updateUser);
router.get('/getTrabajador', usuariosController.getTrabajador);
router.get('/getDatosPersonales', usuariosController.getDatosPersonales);
router.delete('/:id', usuariosController.deleteUser);
router.get('/login', login);
router.post('/addUser', addUser);
router.post('/registrarPersonal', registrarPersonal)
router.post('/registrarVivienda', usuariosController.registrarVivienda)
router.post('/registrarEconomico',usuariosController.registrarEconomico)

module.exports = router;


