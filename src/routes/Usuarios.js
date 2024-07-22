const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/Usuarios');
const { registrarPersonal } = require('../controllers/Usuarios');
const { addUser } = require('../controllers/Usuarios');
const {login} = require('../controllers/Usuarios')

router.get('/', usuariosController.getAllUsers);
router.put('/:id', usuariosController.updateUser);
router.delete('/:id', usuariosController.deleteUser);
router.get('/login', login);
router.post('/addUser', addUser);
router.post('/registrarPersonal', registrarPersonal)
router.post('/registrarVivienda', usuariosController.registrarVivienda)
router.post('/registrarEconomico',usuariosController.registrarEconomico)

module.exports = router;


