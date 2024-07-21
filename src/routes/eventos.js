const express = require('express');
const router = express.Router();
const apoyosController = require('../controllers/eventos');

router.get('/getAllEventos', apoyosController.getAllEventos);
router.post('/addEvento', apoyosController.addEvento);
router.put('/updateEvento', apoyosController.updateEvento);
router.delete('/deleteEvento', apoyosController.deleteEvento);

module.exports = router;