/**
 * Admin controller - endpoints to open or reset lock state for administrative use.
 * @module controllers/admin.controller
 */

const stateService = require('../services/state.service');
const lockService = require('../services/lock.service');

module.exports = {
    /**
     * POST /api/admin/open - administratively request the lock to open.
     */
    openLock: (req, res) => {
        const updated = lockService.triggerOpen();
        res.json(updated);
    },

    /**
     * POST /api/admin/reset - reset the in-memory lock state to defaults.
     */
    resetLock: (req, res) => {
        const updated = stateService.resetState();
        res.json(updated);
    }
};