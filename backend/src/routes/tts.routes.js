const express = require('express');
const router = express.Router();
const controller = require('../controllers/tts.controller');

router.post('/api/tts', controller.generateTTS);

module.exports = router;
