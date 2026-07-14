/**
 * Lock controller - returns lock state and acknowledges opens from devices.
 * @module controllers/lock.controller
 */

const stateService = require('../services/state.service');
const lockService = require('../services/lock.service');

module.exports = {
    /**
     * GET /api/lock/state - return whether the lock should open and current status.
     */
    getLockState: (req, res) => {
        const { shouldOpen, status } = stateService.getState();
        res.json({ shouldOpen, status });
    },

    /**
     * POST /api/lock/ack - device acknowledges the open action. Returns updated state.
     */
    ackOpen: (req, res) => {
        const updated = lockService.acknowledgeOpen();
        res.json(updated);
    }
};