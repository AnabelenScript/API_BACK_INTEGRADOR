const express = require('express');
const router = express.Router();
const denunciasController = require('../controllers/denuncias');


router.get('/getAllDenuncias', denunciasController.getAllDenuncias);
router.post('/addDenuncia', denunciasController.addDenuncia);
router.put('/:id', denunciasController.updateDenuncia);
router.delete('/:id', denunciasController.deleteDenuncia);

module.exports = router;