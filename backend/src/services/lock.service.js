const stateService = require('./state.service');
const { LOCK_STATES } = require('../config/constants');

module.exports = {
    triggerOpen: () => {
        return stateService.updateState({
            shouldOpen: true,
            status: LOCK_STATES.OPEN_REQUESTED
        });
    },
    acknowledgeOpen: () => {
        return stateService.updateState({
            shouldOpen: false,
            status: LOCK_STATES.OPENED
        });
    }
};
