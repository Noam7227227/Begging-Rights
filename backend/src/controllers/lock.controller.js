const stateService = require('../services/state.service');
const lockService = require('../services/lock.service');

module.exports = {
    getLockState: (req, res) => {
        const { shouldOpen, status } = stateService.getState();
        res.json({ shouldOpen, status });
    },
    ackOpen: (req, res) => {
        const updated = lockService.acknowledgeOpen();
        res.json(updated);
    }
};