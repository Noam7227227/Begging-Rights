/**
 * TTS routes - endpoint to generate text-to-speech audio for verdicts.
 * @module routes/tts.routes
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/tts.controller');

router.post('/api/tts', controller.generateTTS);

module.exports = router;
