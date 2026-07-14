/**
 * Plead routes - endpoint for submitting pleas to the AI judge.
 * @module routes/plead.routes
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/plead.controller');

router.post('/api/plead', controller.plead);

module.exports = router;
