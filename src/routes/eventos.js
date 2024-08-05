const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos');

router.get('/getAllEventos', eventosController.getAllEventos);
router.post('/addEvento', eventosController.addEvento);
router.put('/updateEvento/:idEvento', eventosController.updateEvento);
router.delete('/deleteEvento/:idEvento', eventosController.deleteEvento);

module.exports = router;