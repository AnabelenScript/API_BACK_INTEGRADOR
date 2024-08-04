const express = require('express');
const router = express.Router();
const denunciasController = require('../controllers/denuncias');


router.get('/getAllDenuncias', denunciasController.getAllDenuncias);
router.get('/verAllDenuncias', denunciasController.verAllDenuncias);
router.post('/addDenuncia', denunciasController.addDenuncia);
router.put('/finalizarDenuncia/:idDenuncia', denunciasController.finalizarDenuncia);

module.exports = router;