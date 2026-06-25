const stateService = require('../services/state.service');
const lockService = require('../services/lock.service');

module.exports = {
    openLock: (req, res) => {
        const updated = lockService.triggerOpen();
        res.json(updated);
    },
    resetLock: (req, res) => {
        const updated = stateService.resetState();
        res.json(updated);
    }
};