const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas');

router.get('/getAllCitasPsicologicas', citasController.getAllCitasPsicologicas);
router.get('/getAllCitasJuridicas', citasController.getAllCitasJuridicas);
router.get('/getCitasFecha', citasController.getCitasFecha);
router.post('/addCita', citasController.addCita);
router.put('/updateCitas', citasController.updateCita);
router.delete('/deleteCitas', citasController.deleteCita);

module.exports = router;