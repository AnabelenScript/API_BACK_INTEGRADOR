const express = require('express');
const router = express.Router();
const apoyosController = require('../controllers/apoyos');

router.get('/getAllApoyos', apoyosController.getAllApoyos);
router.post('/addApoyo', apoyosController.addApoyo);
router.put('/updateApoyo', apoyosController.updateApoyo);
router.delete('/deleteApoyo', apoyosController.deleteApoyo);

module.exports = router;