const stateService = require('../services/state.service');

module.exports = {
    getHealth: (req, res) => res.json({ status: 'ok' }),
    getStatus: (req, res) => {
        const { status, attempts, lastScore } = stateService.getState();
        res.json({ status, attempts, lastScore });
    }
};