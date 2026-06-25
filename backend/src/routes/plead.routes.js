const express = require('express');
const router = express.Router();
const controller = require('../controllers/plead.controller');

router.post('/api/plead', controller.plead);

module.exports = router;
