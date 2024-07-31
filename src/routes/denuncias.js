const express = require('express');
const router = express.Router();
const denunciasController = require('../controllers/denuncias');


router.get('/getAllDenuncias', denunciasController.getAllDenuncias);
router.post('/addDenuncia', denunciasController.addDenuncia);
router.put('/finalizarDenuncia/:idDenuncia', denunciasController.finalizarDenuncia);

module.exports = router;