const express = require('express');
const router = express.Router();
const controller = require('../controllers/status.controller');

router.get('/health', controller.getHealth);
router.get('/api/status', controller.getStatus);

module.exports = router;