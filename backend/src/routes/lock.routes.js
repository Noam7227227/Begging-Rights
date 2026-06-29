/**
 * Lock routes - endpoints exposing lock state and acknowledgements.
 * @module routes/lock.routes
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/lock.controller');

router.get('/api/lock/state', controller.getLockState);
router.post('/api/lock/ack', controller.ackOpen);

module.exports = router;