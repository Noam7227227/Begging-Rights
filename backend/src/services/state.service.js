const { LOCK_STATES } = require('../config/constants');

let state = {
    status: LOCK_STATES.LOCKED,
    shouldOpen: false,
    attempts: 0,
    lastScore: 0
};

module.exports = {
    getState: () => ({ ...state }),
    updateState: (newState) => {
        state = { ...state, ...newState };
        return state;
    },
    resetState: () => {
        state = {
            status: LOCK_STATES.LOCKED,
            shouldOpen: false,
            attempts: 0,
            lastScore: 0
        };
        return state;
    }
};
