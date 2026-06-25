const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');

router.post('/api/admin/open', controller.openLock);
router.post('/api/admin/reset', controller.resetLock);

module.exports = router;