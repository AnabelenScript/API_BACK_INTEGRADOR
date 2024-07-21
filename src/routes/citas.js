const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas');

router.get('/getAllCitas', citasController.getAllCitas);
router.post('/addCita', citasController.addCita);
router.put('/updateCitas', citasController.updateCita);
router.delete('/deleteCitas', citasController.deleteCita);

module.exports = router;